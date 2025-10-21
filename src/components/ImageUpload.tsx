import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Link, Image as ImageIcon } from "lucide-react";
import imageCompression from 'browser-image-compression';

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

const defaultTranslations = {
  uploading: "Subiendo...",
  optimizingMessage: "Optimizando imagen...",
  optimizing: "Optimizando...",
  uploadImage: "Subir Imagen",
  url: "URL",
  enterImageUrl: "Ingrese URL de imagen"
};

export function ImageUpload({ label, value, onChange, clientId, context = 'restaurant content', description, storeInDatabase = false, onProcessingChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');
  const progressTimerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Progress helpers
  const startProgress = (target: number, stepMs = 150) => {
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => (prev < target ? Math.min(target, prev + 1) : prev));
    }, stepMs);
  };

  const stopProgress = (final = 100) => {
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
    setProgress(final);
    setTimeout(() => setShowProgress(false), 500);
  };

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    };
  }, []);
  // Helper function to get translation with fallback
  const t = (key: string): string => {
    const keys = key.split('.');
    if (keys[0] === 'imageUpload' && keys[1] in defaultTranslations) {
      return defaultTranslations[keys[1] as keyof typeof defaultTranslations];
    }
    return key;
  };

  // Helper to delete old storage files before uploading new one
  const deleteOldStorageFiles = async (oldUrl: string) => {
    if (!oldUrl || !clientId) return;
    
    try {
      // Delete all files for this client (temp and optimized)
      const { data: files, error: listError } = await supabase.storage
        .from('client-assets')
        .list(`clients/${clientId}`, {
          limit: 1000,
          search: ''
        });

      if (!listError && files && files.length > 0) {
        const filePaths = files.map(f => `clients/${clientId}/${f.name}`);
        await supabase.storage.from('client-assets').remove(filePaths);
      }

      // Also check temp folder
      const { data: tempFiles, error: tempListError } = await supabase.storage
        .from('client-assets')
        .list(`temp/${clientId}`, {
          limit: 1000,
          search: ''
        });

      if (!tempListError && tempFiles && tempFiles.length > 0) {
        const tempPaths = tempFiles.map(f => `temp/${clientId}/${f.name}`);
        await supabase.storage.from('client-assets').remove(tempPaths);
      }

      console.log('Deleted old storage files for client:', clientId);
    } catch (error) {
      console.warn('Failed to delete old storage files:', error);
    }
  };

  // Compress image using browser-image-compression
  const compressImageWithBrowser = async (file: File): Promise<{ blob: Blob; originalSizeKB: number; compressedSizeKB: number }> => {
    const originalSizeKB = Math.round(file.size / 1024);
    
    // Target sizes based on context
    const targetKB = context === 'menu-item' ? 60 : context === 'hero-background' ? 300 : context === 'carousel' ? 140 : 200;
    
    // Max dimensions based on context
    const maxWidth = context === 'menu-item' ? 800 : context === 'hero-background' ? 1920 : context === 'carousel' ? 1000 : 1200;
    
    const options = {
      maxSizeMB: targetKB / 1024, // Convert KB to MB
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      fileType: 'image/webp' as const,
      initialQuality: 0.7
    };
    
    try {
      console.log(`Compressing image: original ${originalSizeKB}KB, target ${targetKB}KB, maxWidth ${maxWidth}px`);
      const compressedFile = await imageCompression(file, options);
      const compressedSizeKB = Math.round(compressedFile.size / 1024);
      
      console.log(`Compression complete: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
      
      return {
        blob: compressedFile,
        originalSizeKB,
        compressedSizeKB
      };
    } catch (error) {
      console.error('Compression error:', error);
      throw error;
    }
  };

  // Generate SEO-friendly filename based on context and description
  const generateFileName = (context: string, description?: string): string => {
    const timestamp = Date.now();

    const slugify = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const contextNames: Record<string, string> = {
      'menu-item': 'dish',
      'team-member': 'team',
      'hero-background': 'hero',
      'carousel': 'banner',
      'restaurant content': 'image',
    };

    const baseFromContext = contextNames[context] || slugify(context);
    const fromDescription = description ? slugify(description) : '';

    const baseName = fromDescription || baseFromContext;

    // For team members, keep a clean, stable filename without timestamp when we have a proper name
    const includeTimestamp = context !== 'team-member' || !fromDescription;

    const finalName = includeTimestamp ? `${baseName}-${timestamp}` : baseName;

    return `clients/${clientId}/optimized-images/${finalName}.webp`;
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    onProcessingChange?.(true);
    setShowProgress(true);
    setProgress(5);
    setProgressLabel('Comprimiendo...');
    startProgress(40, 80);
    
    // Delete old files before uploading new one
    if (value) {
      await deleteOldStorageFiles(value);
    }
    
    try {
      // Step 1: Compress image client-side with browser-image-compression
      const { blob: compressedBlob, originalSizeKB, compressedSizeKB } = await compressImageWithBrowser(file);
      
      console.log(`Browser compression complete: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
      
      // Step 2: Upload compressed image
      setProgress(45);
      setProgressLabel('Subiendo...');
      startProgress(90, 100);
      
      const fileName = generateFileName(context, description);
      
      const { error: uploadError } = await supabase.storage
        .from('client-assets')
        .upload(fileName, compressedBlob, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('client-assets')
        .getPublicUrl(fileName);

      // Step 3: Update the component with optimized image
      onChange(data.publicUrl);
      stopProgress(100);
      
      const compressionRatio = Math.round((1 - compressedSizeKB / originalSizeKB) * 100);
      
      toast({
        title: "Imagen Optimizada",
        description: `WebP format. ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% compresión)`,
      });
      
    } catch (error: any) {
      stopProgress(0);
      console.error('Upload/compression error:', error);
      toast({
        title: "Error de Carga",
        description: error.message || "Falló la compresión u optimización de la imagen",
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
      
      {/* Progress bar */}
      {showProgress && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progressLabel}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
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
            onClick={async () => {
              // Delete storage files before clearing the URL
              await deleteOldStorageFiles(value);
              onChange('');
            }}
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