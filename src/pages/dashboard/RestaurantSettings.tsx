import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface DashboardContext {
  selectedClientId: string;
  selectedClient: {
    id: string;
    restaurant_name: string;
    subdomain: string;
  };
}

const settingsSchema = z.object({
  restaurant_name: z.string().min(1, 'El nombre del restaurante es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  coordinates_lat: z.string().optional(),
  coordinates_lng: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  primary_color: z.string().optional(),
  accent_color: z.string().optional(),
  currency: z.string().optional(),
  // Opening hours
  monday_open: z.string().optional(),
  monday_close: z.string().optional(),
  monday_closed: z.boolean().default(false),
  tuesday_open: z.string().optional(),
  tuesday_close: z.string().optional(),
  tuesday_closed: z.boolean().default(false),
  wednesday_open: z.string().optional(),
  wednesday_close: z.string().optional(),
  wednesday_closed: z.boolean().default(false),
  thursday_open: z.string().optional(),
  thursday_close: z.string().optional(),
  thursday_closed: z.boolean().default(false),
  friday_open: z.string().optional(),
  friday_close: z.string().optional(),
  friday_closed: z.boolean().default(false),
  saturday_open: z.string().optional(),
  saturday_close: z.string().optional(),
  saturday_closed: z.boolean().default(false),
  sunday_open: z.string().optional(),
  sunday_close: z.string().optional(),
  sunday_closed: z.boolean().default(false),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function RestaurantSettings() {
  const { selectedClientId } = useOutletContext<DashboardContext>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      restaurant_name: '',
      phone: '',
      email: '',
      whatsapp: '',
      address: '',
      coordinates_lat: '',
      coordinates_lng: '',
      facebook: '',
      instagram: '',
      twitter: '',
      primary_color: '#22c55e',
      accent_color: '#eab308',
      currency: 'S/',
      monday_closed: false,
      tuesday_closed: false,
      wednesday_closed: false,
      thursday_closed: false,
      friday_closed: false,
      saturday_closed: false,
      sunday_closed: false,
    },
  });

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!selectedClientId) return;

      setLoading(true);
      try {
        const { data: client, error } = await (supabase as any)
          .from('clients')
          .select('*')
          .eq('id', selectedClientId)
          .single();

        if (error) {
          toast.error('Error al cargar datos del restaurante');
          return;
        }

        if (client) {
          // Parse JSON fields
          const coordinates = client.coordinates || {};
          const socialMedia = client.social_media_links || {};
          const brandColors = client.brand_colors || {};
          const openingHours = client.opening_hours || {};
          const customizations = client.other_customizations || {};

          form.reset({
            restaurant_name: client.restaurant_name || '',
            phone: client.phone || '',
            email: client.email || '',
            whatsapp: client.whatsapp || '',
            address: client.address || '',
            coordinates_lat: coordinates.lat?.toString() || '',
            coordinates_lng: coordinates.lng?.toString() || '',
            facebook: socialMedia.facebook || '',
            instagram: socialMedia.instagram || '',
            twitter: socialMedia.twitter || '',
            primary_color: brandColors.primary || '#22c55e',
            accent_color: brandColors.accent || '#eab308',
            currency: customizations.currency || 'S/',
            // Opening hours
            monday_open: openingHours.monday?.open || '09:00',
            monday_close: openingHours.monday?.close || '22:00',
            monday_closed: openingHours.monday?.closed || false,
            tuesday_open: openingHours.tuesday?.open || '09:00',
            tuesday_close: openingHours.tuesday?.close || '22:00',
            tuesday_closed: openingHours.tuesday?.closed || false,
            wednesday_open: openingHours.wednesday?.open || '09:00',
            wednesday_close: openingHours.wednesday?.close || '22:00',
            wednesday_closed: openingHours.wednesday?.closed || false,
            thursday_open: openingHours.thursday?.open || '09:00',
            thursday_close: openingHours.thursday?.close || '22:00',
            thursday_closed: openingHours.thursday?.closed || false,
            friday_open: openingHours.friday?.open || '09:00',
            friday_close: openingHours.friday?.close || '22:00',
            friday_closed: openingHours.friday?.closed || false,
            saturday_open: openingHours.saturday?.open || '09:00',
            saturday_close: openingHours.saturday?.close || '22:00',
            saturday_closed: openingHours.saturday?.closed || false,
            sunday_open: openingHours.sunday?.open || '09:00',
            sunday_close: openingHours.sunday?.close || '22:00',
            sunday_closed: openingHours.sunday?.closed || false,
          });
        }
      } catch (error) {
        toast.error('Error al cargar configuración');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [selectedClientId, form]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      // Prepare data for update
      const coordinates = data.coordinates_lat && data.coordinates_lng ? {
        lat: parseFloat(data.coordinates_lat),
        lng: parseFloat(data.coordinates_lng)
      } : null;

      const socialMediaLinks = {
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        twitter: data.twitter || '',
      };

      const brandColors = {
        primary: data.primary_color || '#22c55e',
        accent: data.accent_color || '#eab308',
      };

      const openingHours = {
        monday: { open: data.monday_open || '09:00', close: data.monday_close || '22:00', closed: data.monday_closed },
        tuesday: { open: data.tuesday_open || '09:00', close: data.tuesday_close || '22:00', closed: data.tuesday_closed },
        wednesday: { open: data.wednesday_open || '09:00', close: data.wednesday_close || '22:00', closed: data.wednesday_closed },
        thursday: { open: data.thursday_open || '09:00', close: data.thursday_close || '22:00', closed: data.thursday_closed },
        friday: { open: data.friday_open || '09:00', close: data.friday_close || '22:00', closed: data.friday_closed },
        saturday: { open: data.saturday_open || '09:00', close: data.saturday_close || '22:00', closed: data.saturday_closed },
        sunday: { open: data.sunday_open || '09:00', close: data.sunday_close || '22:00', closed: data.sunday_closed },
      };

      const otherCustomizations = {
        currency: data.currency || 'S/',
      };

      const { error } = await (supabase as any)
        .from('clients')
        .update({
          restaurant_name: data.restaurant_name,
          phone: data.phone,
          email: data.email,
          whatsapp: data.whatsapp,
          address: data.address,
          coordinates,
          social_media_links: socialMediaLinks,
          brand_colors: brandColors,
          opening_hours: openingHours,
          other_customizations: otherCustomizations,
        })
        .eq('id', selectedClientId);

      if (error) {
        toast.error('Error al guardar configuración');
        return;
      }

      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
          <div>
            <div className="w-48 h-6 bg-muted animate-pulse rounded mb-2"></div>
            <div className="w-64 h-4 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="w-32 h-5 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-full h-10 bg-muted animate-pulse rounded"></div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración del Restaurante</h1>
        <p className="text-muted-foreground mt-2">
          Actualiza la información de tu restaurante
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos principales de tu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="restaurant_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Restaurante *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi Restaurante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+51 123 456 789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@mirestaurante.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+51 987 654 321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Av. Principal 123, Distrito, Ciudad"
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>
                Enlaces a tus perfiles sociales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/mirestaurante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/mirestaurante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/mirestaurante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Atención</CardTitle>
              <CardDescription>
                Define los horarios de atención por día
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map((day, index) => (
                <div key={day}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{dayNames[index]}</h4>
                    <FormField
                      control={form.control}
                      name={`${day}_closed` as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300"
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Cerrado</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {!form.watch(`${day}_closed` as any) && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`${day}_open` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apertura</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`${day}_close` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cierre</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  {index < days.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}