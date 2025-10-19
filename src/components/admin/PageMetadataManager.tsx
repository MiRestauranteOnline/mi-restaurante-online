import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Sparkles, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PageMetadata {
  id?: string;
  page_type: string;
  meta_title: string;
  meta_description: string;
  og_title?: string;
  og_description?: string;
  twitter_title?: string;
  twitter_description?: string;
}

interface PageMetadataManagerProps {
  clientId: string;
}

const PAGE_TYPES = [
  { value: "home", label: "Home Page" },
  { value: "about", label: "About Page" },
  { value: "menu", label: "Menu Page" },
  { value: "contact", label: "Contact Page" },
  { value: "reviews", label: "Reviews Page" },
];

export const PageMetadataManager = ({ clientId }: PageMetadataManagerProps) => {
  const [metadata, setMetadata] = useState<Record<string, PageMetadata>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchMetadata();
  }, [clientId]);

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_metadata")
        .select("*")
        .eq("client_id", clientId);

      if (error) throw error;

      const metadataMap: Record<string, PageMetadata> = {};
      data?.forEach((item) => {
        metadataMap[item.page_type] = item;
      });
      setMetadata(metadataMap);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast({
        title: "Error",
        description: "Failed to load metadata",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageType: string) => {
    const pageMetadata = metadata[pageType];
    if (!pageMetadata) return;

    // Validation
    if (pageMetadata.meta_title.length > 60) {
      toast({
        title: "Title Too Long",
        description: "Meta title must be 60 characters or less",
        variant: "destructive",
      });
      return;
    }

    if (pageMetadata.meta_description.length > 155) {
      toast({
        title: "Description Too Long",
        description: "Meta description must be 155 characters or less",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("page_metadata").upsert({
        id: pageMetadata.id,
        client_id: clientId,
        page_type: pageType,
        meta_title: pageMetadata.meta_title,
        meta_description: pageMetadata.meta_description,
        og_title: pageMetadata.og_title || pageMetadata.meta_title,
        og_description: pageMetadata.og_description || pageMetadata.meta_description,
        twitter_title: pageMetadata.twitter_title || pageMetadata.meta_title,
        twitter_description: pageMetadata.twitter_description || pageMetadata.meta_description,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metadata saved successfully",
      });
      fetchMetadata();
    } catch (error) {
      console.error("Error saving metadata:", error);
      toast({
        title: "Error",
        description: "Failed to save metadata",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async (pageType: string, fieldType: 'title' | 'description') => {
    const key = `${pageType}-${fieldType}`;
    setRegenerating((prev) => ({ ...prev, [key]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('regenerate-page-metadata', {
        body: {
          clientId,
          pageType,
          fieldType: fieldType === 'title' ? 'title' : 'description',
        },
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from function');
      }

      if (data.success) {
        const generatedValue = fieldType === 'title' ? data.title : data.description;
        
        if (!generatedValue) {
          throw new Error('Generated value is empty');
        }

        const field = fieldType === 'title' ? 'meta_title' : 'meta_description';
        updateMetadata(pageType, field, generatedValue);
        
        toast({
          title: "Success",
          description: `${fieldType === 'title' ? 'Title' : 'Description'} regenerated successfully`,
        });
      } else {
        throw new Error(data.error || 'Failed to regenerate');
      }
    } catch (error) {
      console.error('Error regenerating:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to regenerate ${fieldType}`,
        variant: "destructive",
      });
    } finally {
      setRegenerating((prev) => ({ ...prev, [key]: false }));
    }
  };

  const updateMetadata = (pageType: string, field: keyof PageMetadata, value: string) => {
    setMetadata((prev) => ({
      ...prev,
      [pageType]: {
        ...prev[pageType],
        page_type: pageType,
        meta_title: prev[pageType]?.meta_title || "",
        meta_description: prev[pageType]?.meta_description || "",
        [field]: value,
      },
    }));
  };

  const getCharacterCount = (text: string, limit: number) => {
    const length = text.length;
    const isOptimal = limit === 60 ? length <= 57 : length <= limit;
    const isOverLimit = length > limit;
    
    return {
      length,
      isOptimal,
      isOverLimit,
      color: isOverLimit ? "text-destructive" : isOptimal ? "text-green-600" : "text-yellow-600",
    };
  };

  if (loading) {
    return <div>Loading metadata...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Metadata Management</h2>
          <p className="text-muted-foreground">Manage SEO metadata for each page</p>
        </div>
        <Button onClick={fetchMetadata} variant="outline">
          Refresh
        </Button>
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>SEO Best Practices:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Title: 57 chars recommended, 60 max (includes location, cuisine type, restaurant name)</li>
            <li>• Description: 155 chars max (use keywords, emojis ✓★, urgency, benefits)</li>
            <li>• Include ALL CAPS for key benefits to increase click-through rates</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {PAGE_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PAGE_TYPES.map((type) => {
          const pageMetadata = metadata[type.value] || {
            page_type: type.value,
            meta_title: "",
            meta_description: "",
          };
          const titleCheck = getCharacterCount(pageMetadata.meta_title, 60);
          const descCheck = getCharacterCount(pageMetadata.meta_description, 155);

          return (
            <TabsContent key={type.value} value={type.value} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{type.label} SEO</CardTitle>
                  <CardDescription>
                    Optimize metadata for search engines and social media
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${type.value}-title`}>Meta Title *</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerate(type.value, 'title')}
                          disabled={regenerating[`${type.value}-title`]}
                        >
                          {regenerating[`${type.value}-title`] ? (
                            <>
                              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Regenerate
                            </>
                          )}
                        </Button>
                        <span className={`text-sm font-medium ${titleCheck.color}`}>
                          {titleCheck.length}/60
                          {titleCheck.length <= 57 && <CheckCircle2 className="inline ml-1 h-3 w-3" />}
                          {titleCheck.isOverLimit && <AlertCircle className="inline ml-1 h-3 w-3" />}
                        </span>
                      </div>
                    </div>
                    <Input
                      id={`${type.value}-title`}
                      value={pageMetadata.meta_title}
                      onChange={(e) => updateMetadata(type.value, "meta_title", e.target.value)}
                      placeholder="Best Indian Food in Miraflores, Lima | Restaurant Name"
                      className={titleCheck.isOverLimit ? "border-destructive" : ""}
                    />
                    {titleCheck.length > 57 && titleCheck.length <= 60 && (
                      <p className="text-xs text-yellow-600">Consider shortening to 57 characters for optimal display</p>
                    )}
                    {titleCheck.isOverLimit && (
                      <p className="text-xs text-destructive">Must be 60 characters or less</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${type.value}-desc`}>Meta Description *</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerate(type.value, 'description')}
                          disabled={regenerating[`${type.value}-description`]}
                        >
                          {regenerating[`${type.value}-description`] ? (
                            <>
                              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Regenerate
                            </>
                          )}
                        </Button>
                        <span className={`text-sm font-medium ${descCheck.color}`}>
                          {descCheck.length}/155
                          {descCheck.isOptimal && <CheckCircle2 className="inline ml-1 h-3 w-3" />}
                          {descCheck.isOverLimit && <AlertCircle className="inline ml-1 h-3 w-3" />}
                        </span>
                      </div>
                    </div>
                    <Textarea
                      id={`${type.value}-desc`}
                      value={pageMetadata.meta_description}
                      onChange={(e) => updateMetadata(type.value, "meta_description", e.target.value)}
                      placeholder="★ AUTHENTIC Indian Cuisine ★ Fresh ingredients daily. Experience flavors that transport you. Reserve your table NOW!"
                      rows={3}
                      className={descCheck.isOverLimit ? "border-destructive" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use emojis (✓★➤), ALL CAPS for benefits, add urgency/curiosity
                    </p>
                    {descCheck.isOverLimit && (
                      <p className="text-xs text-destructive">Must be 155 characters or less</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${type.value}-og-title`}>Open Graph Title (Optional)</Label>
                    <Input
                      id={`${type.value}-og-title`}
                      value={pageMetadata.og_title || ""}
                      onChange={(e) => updateMetadata(type.value, "og_title", e.target.value)}
                      placeholder="Defaults to Meta Title if empty"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${type.value}-og-desc`}>Open Graph Description (Optional)</Label>
                    <Textarea
                      id={`${type.value}-og-desc`}
                      value={pageMetadata.og_description || ""}
                      onChange={(e) => updateMetadata(type.value, "og_description", e.target.value)}
                      placeholder="Defaults to Meta Description if empty"
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={() => handleSave(type.value)}
                    disabled={saving || !pageMetadata.meta_title || !pageMetadata.meta_description}
                  >
                    {saving ? "Saving..." : "Save Metadata"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
