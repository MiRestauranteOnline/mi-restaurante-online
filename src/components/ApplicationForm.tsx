import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ApplicationForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    restaurantName: "",
    district: "",
    whatsapp: "",
    hasDelivery: "",
    hasMenu: "",
    desiredStyle: "",
    hasDomain: "",
    wantsEmail: false,
    hasBrandGuide: "",
    hasSocialMedia: "",
    aboutRestaurant: ""
  });

  const [conditionalFields, setConditionalFields] = useState({
    showDeliveryServices: false,
    showBrandGuideFields: false,
    showSocialMediaFields: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle conditional logic
    if (field === "hasDelivery" && value === "Sí") {
      setConditionalFields(prev => ({ ...prev, showDeliveryServices: true }));
    } else if (field === "hasDelivery" && value === "No") {
      setConditionalFields(prev => ({ ...prev, showDeliveryServices: false }));
    }
    
    if (field === "hasBrandGuide" && value === "Sí") {
      setConditionalFields(prev => ({ ...prev, showBrandGuideFields: true }));
    } else if (field === "hasBrandGuide" && value === "No") {
      setConditionalFields(prev => ({ ...prev, showBrandGuideFields: false }));
    }
    
    if (field === "hasSocialMedia" && value === "Sí") {
      setConditionalFields(prev => ({ ...prev, showSocialMediaFields: true }));
    } else if (field === "hasSocialMedia" && value === "No") {
      setConditionalFields(prev => ({ ...prev, showSocialMediaFields: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.restaurantName || !formData.district || !formData.whatsapp) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    // Success submission
    setIsSubmitted(true);
    toast({
      title: "¡Solicitud enviada!",
      description: "Te contactaremos en las próximas 24 horas para confirmar los detalles.",
    });
  };

  const handleWhatsAppClick = () => {
    const message = `Hola, quiero aplicar para un sitio web de restaurante:

Restaurante: ${formData.restaurantName}
Distrito: ${formData.district}
WhatsApp: ${formData.whatsapp}
Delivery: ${formData.hasDelivery}
Estilo: ${formData.desiredStyle}

${formData.aboutRestaurant ? `Información adicional: ${formData.aboutRestaurant}` : ''}`;

    window.open(`https://wa.me/51999999999?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (isSubmitted) {
    return (
      <section id="application" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">¡Gracias por tu solicitud!</h2>
              <p className="text-lg text-muted-foreground">
                Hemos recibido tu información. Te contactaremos en las próximas 24 horas para 
                confirmar los detalles y programar la entrega de tu demo en 72 horas.
              </p>
            </div>

            <div className="bg-accent/10 border border-accent/20 p-6 rounded-xl">
              <h3 className="font-semibold text-accent mb-2">Recordatorio Importante:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Demo funcional en 72 horas</li>
                <li>• Precio fijo de por vida si contratas este mes</li>
                <li>• Sin costo inicial, solo el pago mensual</li>
                <li>• Soporte completo por WhatsApp</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar por WhatsApp También
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsSubmitted(false)}
              >
                Hacer otra solicitud
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="application" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-up">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Comienza tu proyecto
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Aplicar para tu 
              <span className="text-primary block">Sitio Web</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Completa este formulario y recibe tu demo funcional en 72 horas. 
              ¡Sin compromiso y con garantía de precio fijo de por vida!
            </p>
          </div>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Información de tu Restaurante
              </CardTitle>
              <CardDescription>
                Todos los campos marcados con * son obligatorios
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Nombre del restaurante *</Label>
                    <Input
                      id="restaurantName"
                      value={formData.restaurantName}
                      onChange={(e) => handleInputChange("restaurantName", e.target.value)}
                      placeholder="Ej: La Casa del Ceviche"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">Distrito/Ciudad *</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange("district", e.target.value)}
                      placeholder="Ej: Miraflores, Lima"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp de contacto *</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="Ej: +51 999 999 999"
                    required
                  />
                </div>

                {/* Delivery Services */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>¿Usas servicios de delivery? *</Label>
                    <Select onValueChange={(value) => handleInputChange("hasDelivery", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {conditionalFields.showDeliveryServices && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="rappi">Rappi</Label>
                        <Input id="rappi" placeholder="Link de tu restaurante en Rappi" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pedidosya">PedidosYa</Label>
                        <Input id="pedidosya" placeholder="Link de tu restaurante en PedidosYa" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ubereats">UberEats</Label>
                        <Input id="ubereats" placeholder="Link de tu restaurante en UberEats" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otros">Otros</Label>
                        <Input id="otros" placeholder="Otras plataformas de delivery" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu and Style */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>¿Tienes un menú actual?</Label>
                    <Select onValueChange={(value) => handleInputChange("hasMenu", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí, en PDF">Sí, en PDF</SelectItem>
                        <SelectItem value="Sí, en imagen">Sí, en imagen</SelectItem>
                        <SelectItem value="No">No, necesito ayuda creándolo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estilo deseado *</Label>
                    <Select onValueChange={(value) => handleInputChange("desiredStyle", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clásico">Clásico</SelectItem>
                        <SelectItem value="Moderno">Moderno</SelectItem>
                        <SelectItem value="Rústico">Rústico</SelectItem>
                        <SelectItem value="Fancy Look">Fancy Look</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Domain and Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>¿Ya tienes dominio?</Label>
                    <Select onValueChange={(value) => handleInputChange("hasDomain", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí, ya tengo</SelectItem>
                        <SelectItem value="No">No, quiero comprarlo en Namecheap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox 
                      id="wantsEmail" 
                      checked={formData.wantsEmail}
                      onCheckedChange={(checked) => handleInputChange("wantsEmail", checked as boolean)}
                    />
                    <Label htmlFor="wantsEmail">Quiero correos con mi dominio (Namecheap)</Label>
                  </div>
                </div>

                {/* Conditional Brand Guide */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>¿Tienes guía de marca/estilo?</Label>
                    <Select onValueChange={(value) => handleInputChange("hasBrandGuide", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {conditionalFields.showBrandGuideFields && (
                    <div className="p-4 bg-muted rounded-lg space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="brandColors">Colores de marca</Label>
                          <Input id="brandColors" placeholder="Ej: Azul, dorado, blanco" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brandFonts">Fuentes preferidas</Label>
                          <Input id="brandFonts" placeholder="Ej: Arial, Helvetica" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brandNotes">Notas de estilo</Label>
                        <Textarea 
                          id="brandNotes" 
                          placeholder="Describe el estilo que buscas..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Conditional Social Media */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>¿Tienes redes sociales?</Label>
                    <Select onValueChange={(value) => handleInputChange("hasSocialMedia", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {conditionalFields.showSocialMediaFields && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input id="instagram" placeholder="@turestaurante" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input id="facebook" placeholder="facebook.com/turestaurante" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tiktok">TikTok</Label>
                        <Input id="tiktok" placeholder="@turestaurante" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otrasRedes">Otras redes</Label>
                        <Input id="otrasRedes" placeholder="YouTube, Twitter, etc." />
                      </div>
                    </div>
                  )}
                </div>

                {/* About Restaurant */}
                <div className="space-y-2">
                  <Label htmlFor="aboutRestaurant">Cuéntanos sobre tu restaurante</Label>
                  <Textarea 
                    id="aboutRestaurant"
                    value={formData.aboutRestaurant}
                    onChange={(e) => handleInputChange("aboutRestaurant", e.target.value)}
                    placeholder="Historia, especialidades, público objetivo, horarios, ubicación especial, etc..."
                    className="min-h-[120px]"
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo (opcional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra tu logo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos: PNG, JPG, SVG (máx. 5MB)
                    </p>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enviar Solicitud
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleWhatsAppClick}
                    className="border-primary text-primary hover:bg-primary/5 flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar por WhatsApp
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};