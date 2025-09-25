import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
  email?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  coordinates?: any;
  opening_hours?: any;
  social_media_links?: any;
  brand_colors?: any;
  delivery?: any;
  other_customizations?: any;
}

export default function ClientSettings() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    restaurant_name: '',
    subdomain: '',
    email: '',
    phone: '',
    address: '',
    whatsapp: '',
    social_media_links: {
      facebook: '',
      instagram: '',
      x: '',
      tiktok: '',
      youtube: '',
      linkedin: ''
    },
    delivery: {
      rappi: '',
      pedidos_ya: '',
      didi_food: ''
    },
    brand_colors: {
      primary: '#8B5CF6',
      accent: '#F59E0B'
    },
    other_customizations: {
      currency: 'S/'
    }
  });

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      
      setClient(data);
      setFormData({
        restaurant_name: data.restaurant_name || '',
        subdomain: data.subdomain || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        whatsapp: data.whatsapp || '',
        social_media_links: {
          facebook: '',
          instagram: '',
          x: '',
          tiktok: '',
          youtube: '',
          linkedin: '',
          ...(data.social_media_links as any || {})
        },
        delivery: {
          rappi: '',
          pedidos_ya: '',
          didi_food: '',
          ...(data.delivery as any || {})
        },
        brand_colors: {
          primary: '#8B5CF6',
          accent: '#F59E0B',
          ...(data.brand_colors as any || {})
        },
        other_customizations: {
          currency: 'S/',
          ...(data.other_customizations as any || {})
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load client: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!clientId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          restaurant_name: formData.restaurant_name,
          subdomain: formData.subdomain,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          whatsapp: formData.whatsapp,
          social_media_links: formData.social_media_links,
          delivery: formData.delivery,
          brand_colors: formData.brand_colors,
          other_customizations: formData.other_customizations,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update client: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/client-management')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Client Settings</h1>
            <p className="text-muted-foreground">{client.restaurant_name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurant_name">Restaurant Name</Label>
                  <Input
                    id="restaurant_name"
                    value={formData.restaurant_name}
                    onChange={(e) => setFormData({...formData, restaurant_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.social_media_links.facebook}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        facebook: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.social_media_links.instagram}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        instagram: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="x">X (Twitter)</Label>
                  <Input
                    id="x"
                    value={formData.social_media_links.x}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        x: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.social_media_links.tiktok}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        tiktok: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Platform Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rappi">Rappi</Label>
                <Input
                  id="rappi"
                  value={formData.delivery.rappi}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      rappi: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="pedidos_ya">PedidosYa</Label>
                <Input
                  id="pedidos_ya"
                  value={formData.delivery.pedidos_ya}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      pedidos_ya: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="didi_food">DiDi Food</Label>
                <Input
                  id="didi_food"
                  value={formData.delivery.didi_food}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      didi_food: e.target.value
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.brand_colors.primary}
                    onChange={(e) => setFormData({
                      ...formData, 
                      brand_colors: {
                        ...formData.brand_colors,
                        primary: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <Input
                    id="accent_color"
                    type="color"
                    value={formData.brand_colors.accent}
                    onChange={(e) => setFormData({
                      ...formData, 
                      brand_colors: {
                        ...formData.brand_colors,
                        accent: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.other_customizations.currency}
                    onChange={(e) => setFormData({
                      ...formData, 
                      other_customizations: {
                        ...formData.other_customizations,
                        currency: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}