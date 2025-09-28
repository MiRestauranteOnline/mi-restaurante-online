import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, Calendar, User, Image as ImageIcon, Trash2 } from "lucide-react";
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

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
}

interface ClientImageWithClient extends ClientImage {
  client?: Client;
}

export function ClientImagesManagement() {
  const [images, setImages] = useState<ClientImageWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClientImages = async () => {
    try {
      setLoading(true);
      
      // Fetch all client images
      const { data: imagesData, error } = await supabase
        .from('client_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client information separately
      const clientIds = [...new Set(imagesData?.map(img => img.client_id) || [])];
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, restaurant_name, subdomain')
        .in('id', clientIds);

      if (clientsError) throw clientsError;

      // Combine the data
      const imagesWithClients = imagesData?.map(image => ({
        ...image,
        client: clientsData?.find(client => client.id === image.client_id)
      })) || [];

      setImages(imagesWithClients);
    } catch (error: any) {
      console.error('Error fetching client images:', error);
      toast({
        title: "Error",
        description: "Failed to load client images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        title: "Copied!",
        description: "Image URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive"
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
        await supabase.storage
          .from('client-assets')
          .remove([filePath]);
      }

      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId));

      toast({
        title: "Deleted",
        description: "Image deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete image",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (sizeKb: number | null) => {
    if (!sizeKb) return 'Unknown size';
    if (sizeKb < 1024) return `${sizeKb}KB`;
    return `${(sizeKb / 1024).toFixed(1)}MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContextBadgeColor = (context: string) => {
    switch (context) {
      case 'signup_custom_upload':
        return 'bg-blue-100 text-blue-800';
      case 'carousel':
        return 'bg-green-100 text-green-800';
      case 'menu-item':
        return 'bg-orange-100 text-orange-800';
      case 'team-member':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchClientImages();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading client images...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client Images</h2>
          <p className="text-muted-foreground">
            Manage images uploaded by clients during signup and dashboard usage
          </p>
        </div>
        <Badge variant="secondary">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </Badge>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No client images found</h3>
            <p className="text-muted-foreground">
              Client uploaded images will appear here once they start using the upload features.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="p-0">
                <AspectRatio ratio={16 / 9} className="bg-muted">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || 'Client uploaded image'}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => copyToClipboard(image.image_url)}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </AspectRatio>
              </div>
              
              <CardContent className="p-4 space-y-3">
                {/* Client Info */}
                {image.client && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium">{image.client.restaurant_name}</span>
                      <span className="text-muted-foreground ml-1">
                        ({image.client.subdomain})
                      </span>
                    </div>
                  </div>
                )}

                {/* Context Badge */}
                <div className="flex items-center gap-2">
                  <Badge className={getContextBadgeColor(image.upload_context)}>
                    {image.upload_context.replace('_', ' ')}
                  </Badge>
                  {image.file_size_kb && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(image.file_size_kb)}
                    </span>
                  )}
                </div>

                {/* Alt Text */}
                {image.alt_text && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.alt_text}
                  </p>
                )}

                {/* Upload Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(image.uploaded_at)}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(image.image_url)}
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy URL
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleting === image.id}
                      >
                        {deleting === image.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Image</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this image? This action cannot be undone and will remove the image from storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteImage(image.id, image.image_url)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}