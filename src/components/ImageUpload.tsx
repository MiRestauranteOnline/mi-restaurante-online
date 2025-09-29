import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Link, Image as ImageIcon } from "lucide-react";
import { useDashboardLanguage } from "@/contexts/DashboardLanguageContext";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  clientId: string;
  context?: string; // e.g., 'carousel', 'menu-item', 'team-member', 'hero-background', etc.
  description?: string; // Optional custom description for better SEO
  storeInDatabase?: boolean; // Whether to store in client_images table
  onProcessingChange?: (processing: boolean) => void; // Notify parent about processing state
}

export function ImageUpload({ label, value, onChange, clientId, context = 'restaurant content', description, storeInDatabase = false, onProcessingChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useDashboardLanguage();

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    onProcessingChange?.(true);
    try {
      // Step 1: Upload original file temporarily
      const fileExt = file.name.split('.').pop();
      const tempFileName = `temp/${clientId}/${Date.now()}-original.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('client-assets')
        .upload(tempFileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('client-assets')
        .getPublicUrl(tempFileName);

      // Step 2: Optimize the uploaded image
      setUploading(false);
      setOptimizing(true);
      
      // Create a description based on context, custom description, or file name
      let imageDescription = description;
      if (!imageDescription) {
        const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
        const contextMap: Record<string, string> = {
          'carousel': `carousel image for restaurant showcase - ${fileName}`,
          'menu-item': `menu item photo - ${fileName}`,
          'team-member': `team member profile photo - ${fileName}`,
          'hero-background': `hero background image - ${fileName}`,
          'about-section': `about section image - ${fileName}`,
          'logo': `restaurant logo - ${fileName}`,
          'restaurant content': `restaurant content image - ${fileName}`
        };
        imageDescription = contextMap[context] || `restaurant image - ${fileName}`;
      }
      
      const optimizeResponse = await supabase.functions.invoke('optimize-user-image', {
        body: {
          imageUrl: data.publicUrl,
          description: imageDescription,
          clientId: clientId,
          context: context,
          storeInDatabase: storeInDatabase,
          originalFilename: file.name
        }
      });

      if (optimizeResponse.error) {
        throw new Error(optimizeResponse.error.message || 'Failed to optimize image');
      }

      const { optimizedUrl, altText, originalSizeKB, optimizedSizeKB, compressionRatio } = optimizeResponse.data;
      
      // Step 3: Keep the original temporary file as requested (do not delete)
      // Previously we deleted the temp file to save space.
      // await supabase.storage.from('client-assets').remove([tempFileName]);

      // Step 4: Update the component with optimized image
      onChange(optimizedUrl);
      
      toast({
        title: "Image Optimized Successfully",
        description: `Converted to WebP format. ${originalSizeKB > optimizedSizeKB ? `Reduced from ${originalSizeKB}KB to ${optimizedSizeKB}KB (${compressionRatio}% compression)` : `Final size: ${optimizedSizeKB}KB`}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload and optimize image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setOptimizing(false);
      onProcessingChange?.(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit (will be optimized down)
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive"
        });
        return;
      }
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Processing indicator */}
      {(uploading || optimizing) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700">
            {uploading && (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t('imageUpload.uploading')}</span>
              </>
            )}
            {optimizing && (
              <>
                <ImageIcon className="h-4 w-4 animate-pulse" />
                <span className="text-sm">{t('imageUpload.optimizingMessage')}</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Current image preview */}
      {value && (
        <AspectRatio ratio={16 / 9} className="bg-muted rounded border overflow-hidden">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 z-10"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        </AspectRatio>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || optimizing}
          className="flex-1"
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              {t('imageUpload.uploading')}
            </>
          ) : optimizing ? (
            <>
              <ImageIcon className="h-4 w-4 mr-2 animate-pulse" />
              {t('imageUpload.optimizing')}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {t('imageUpload.uploadImage')}
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={uploading || optimizing}
        >
          <Link className="h-4 w-4 mr-2" />
          {t('imageUpload.url')}
        </Button>
      </div>

      {/* URL input */}
      {showUrlInput && (
        <Input
          placeholder={t('imageUpload.enterImageUrl')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}