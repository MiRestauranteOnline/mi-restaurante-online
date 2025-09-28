import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Link, FileText, ExternalLink } from "lucide-react";

interface MenuUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  clientId: string;
  description?: string;
  maxSizeMB?: number;
}

export function MenuUpload({ 
  label, 
  value, 
  onChange, 
  clientId, 
  description,
  maxSizeMB = 10 
}: MenuUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, Word document, or image file');
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `menus/${clientId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('client-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('client-assets')
        .getPublicUrl(fileName);

      onChange(data.publicUrl);
      
      toast({
        title: "Menu Uploaded Successfully",
        description: `File "${file.name}" uploaded successfully (${fileSizeMB.toFixed(1)}MB)`,
      });
      
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload menu file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const getFileIcon = (url: string) => {
    if (url.toLowerCase().includes('.pdf')) return FileText;
    if (url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) return FileText;
    return FileText;
  };

  const FileIcon = value ? getFileIcon(value) : FileText;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {/* Processing indicator */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Upload className="h-4 w-4 animate-spin" />
            <span className="text-sm">Uploading menu file...</span>
          </div>
        </div>
      )}
      
      {/* Current file preview */}
      {value && (
        <div className="border rounded-lg p-3 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileIcon className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Menu File</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {value}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(value, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={uploading}
        >
          <Link className="h-4 w-4 mr-2" />
          URL
        </Button>
      </div>

      {/* URL input */}
      {showUrlInput && (
        <Input
          placeholder="Enter menu URL (Google Drive, Dropbox, etc.)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* File size limit note */}
      <p className="text-xs text-muted-foreground">
        Max file size: {maxSizeMB}MB. Supported formats: PDF, Word documents, images
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}