import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock,
  Phone
} from "lucide-react";
import { businessData } from "@/config/businessData";

const Contact = () => {
  const handleWhatsAppClick = () => {
    window.open(`${businessData.contact.whatsapp.url}?text=${encodeURIComponent(businessData.contact.whatsapp.message)}`, "_blank");
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${businessData.contact.email.general}?subject=Consulta sobre sitios web para restaurantes`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-[hsl(var(--primary)_/_0.05)] py-20 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Contacto
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Hablemos sobre tu
              <span className="text-primary block">Proyecto</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Estamos aquí para resolver todas tus dudas y ayudarte a crear el sitio web 
              perfecto para tu restaurante. ¡Contáctanos por tu canal preferido!
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {/* WhatsApp */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={handleWhatsAppClick}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    WhatsApp
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    La forma más rápida de contactarnos. Respuesta en minutos.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chatear Ahora
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={handleEmailClick}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Email
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para consultas detalladas o envío de archivos.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/5 w-full"
                    onClick={handleEmailClick}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors md:col-span-2 lg:col-span-1">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                  <Phone className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Teléfono
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para casos urgentes o consultas complejas.
                  </p>
                  <p className="text-primary font-semibold">
                    {businessData.contact.phone.display}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Information */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Horarios de Atención
                </CardTitle>
                <CardDescription>
                  Estamos disponibles para atenderte en estos horarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{businessData.businessHours.weekdays.days}</span>
                  <span className="font-semibold">{businessData.businessHours.weekdays.hours}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{businessData.businessHours.sunday.days}</span>
                  <span className="font-semibold">{businessData.businessHours.sunday.hours}</span>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg mt-4">
                  <p className="text-sm text-primary font-medium">
                    📱 {businessData.businessHours.whatsapp.availability}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Ubicación
                </CardTitle>
                <CardDescription>
                  Oficina principal en Lima, Perú
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground mb-1">{businessData.company.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {businessData.address.full}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Servicio a todo el país
                  </p>
                </div>
                
                <div className="bg-accent/5 border border-accent/20 p-3 rounded-lg">
                  <p className="text-sm text-accent font-medium mb-1">
                    🌎 Experiencia Internacional
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Más de 100 sitios web creados para clientes internacionales, 
                    ahora al servicio del mercado peruano.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;