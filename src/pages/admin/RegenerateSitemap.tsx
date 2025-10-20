import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

export default function RegenerateSitemap() {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-static-sitemap', {
        body: {}
      });

      if (error) throw error;

      toast.success("Sitemap regenerated successfully", {
        description: `${data.urls} URLs updated`
      });
      
      console.log('Sitemap generation result:', data);
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      toast.error("Failed to regenerate sitemap", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Regenerate Sitemap</CardTitle>
          <CardDescription>
            Manually trigger sitemap generation to update with latest data from database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleRegenerate} 
            disabled={isRegenerating}
            className="w-full sm:w-auto"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Sitemap
              </>
            )}
          </Button>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>This will:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Fetch all active site pages from database</li>
              <li>Fetch all active documentation pages from database</li>
              <li>Fetch all published blog articles</li>
              <li>Generate and upload new sitemap.xml to storage</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
