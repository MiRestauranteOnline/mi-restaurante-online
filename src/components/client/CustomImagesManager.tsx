import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, Calendar, Image as ImageIcon, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClientImage {
  id: string;
  client_id: string;
  image_url: string;
  alt_text: string | null;
  original_filename: string | null;
  upload_context: string;
  file_size_kb: number | null;
  uploaded_at: string;
  created_at: string;
}

interface CustomImagesManagerProps {
  selectedClientId: string;
}

export function CustomImagesManager({ selectedClientId }: CustomImagesManagerProps) {
  const [images, setImages] = useState<ClientImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClientImages = async () => {
    try {
      setLoading(true);
      
      const { data: imagesData, error } = await supabase
        .from('client_images')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setImages(imagesData || []);
    } catch (error: any) {
      console.error('Error fetching client images:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        title: "¡Copiado!",
        description: "URL de la imagen copiada al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL",
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      setDeleting(imageId);
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('client_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Try to delete from storage (extract path from URL)
      const urlParts = imageUrl.split('/');
      const pathIndex = urlParts.findIndex(part => part === 'client-assets');
      if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
        const filePath = urlParts.slice(pathIndex + 1).join('/');
        const { error: storageError } = await supabase.storage
          .from('client-assets')
          .remove([filePath]);
        
        if (storageError) {
          console.warn('Could not delete file from storage:', storageError);
        }
      }

      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada correctamente",
      });

      // Refresh the images list
      await fetchClientImages();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (selectedClientId) {
      fetchClientImages();
    }
  }, [selectedClientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay imágenes</h3>
        <p className="text-muted-foreground">
          No tienes imágenes personalizadas aún. Las imágenes que subas durante el registro o posteriormente aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={`${image.image_url}?v=${new Date(image.created_at).getTime()}`}
                  alt={image.alt_text || 'Imagen personalizada'}
                  className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => copyToClipboard(image.image_url)}
                />
              </AspectRatio>
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(image.image_url)}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      disabled={deleting === image.id}
                    >
                      {deleting === image.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. La imagen será eliminada permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteImage(image.id, image.image_url)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {image.upload_context?.replace('_', ' ') || 'custom'}
                  </Badge>
                  {image.file_size_kb && (
                    <Badge variant="outline" className="text-xs">
                      {image.file_size_kb}KB
                    </Badge>
                  )}
                </div>
                {image.original_filename && (
                  <p className="text-sm font-medium truncate" title={image.original_filename}>
                    {image.original_filename}
                  </p>
                )}
                {image.alt_text && (
                  <p className="text-xs text-muted-foreground truncate" title={image.alt_text}>
                    {image.alt_text}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(image.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Tienes {images.length} imagen{images.length !== 1 ? 'es' : ''} personalizada{images.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Haz clic en una imagen para copiar su URL al portapapeles
        </p>
      </div>
    </div>
  );
}