import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, MessageCircle } from "lucide-react";
import { businessData } from "@/config/businessData";

export const PricingSection = () => {
  const handleWhatsAppClick = (plan: string) => {
    const message = `Hola, quiero información sobre el plan ${plan}`;
    window.open(`${businessData.contact.whatsapp.url}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Precios Transparentes
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Planes Diseñados para tu 
            <span className="text-primary block">Éxito Online</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sin sorpresas, sin costos ocultos. Elige el plan perfecto para tu restaurante 
            y comienza a crecer desde el primer día.
          </p>
        </div>

        {/* Promo Banner */}
        <div className="bg-accent text-accent-foreground p-4 rounded-xl mb-12 text-center shadow-accent animate-pulse-accent">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold text-lg">¡PRECIO DE LANZAMIENTO!</span>
          </div>
          <p className="text-sm">
            Aprovecha ahora: Los precios pueden aumentar. El precio mensual al momento de la compra se mantendrá hasta la cancelación.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plan Básico */}
          <Card className="relative border-2 hover:shadow-primary transition-smooth">
            <div className="absolute -top-3 left-6">
              <Badge className="bg-primary text-primary-foreground">
                Más Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Plan Básico</CardTitle>
              <CardDescription className="text-muted-foreground">
                Perfecto para comenzar online
              </CardDescription>
              
              <div className="py-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-primary">S/297</span>
                  <span className="text-lg text-muted-foreground">/mes</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-lg line-through text-destructive">S/500</span>
                  <Badge variant="destructive" className="text-xs">-41%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Precio fijo de por vida
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  "Hasta 3,000 visitas/mes (6 GB hosting)",
                  "Soporte WhatsApp básico",
                  "Soporte por email (respuesta en 48h)",
                  "Actualizaciones auto-gestionables vía dashboard"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary"
                  onClick={() => handleWhatsAppClick('Básico')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contratar Plan Básico
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary/5"
                  onClick={() => window.location.href = '/registro'}
                >
                  Registrarse Ahora
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plan Avanzado */}
          <Card className="border-2 border-accent hover:shadow-accent transition-smooth">            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Plan Avanzado</CardTitle>
              <CardDescription className="text-muted-foreground">
                Para restaurantes en crecimiento
              </CardDescription>
              
              <div className="py-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-accent">S/497</span>
                  <span className="text-lg text-muted-foreground">/mes</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-lg line-through text-destructive">S/1000</span>
                  <Badge variant="destructive" className="text-xs">-50%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Incluye todo del Plan Básico +
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  "Todo lo del Plan Básico",
                  "Doble capacidad: Hasta 6,000 visitas/mes (12 GB hosting)",
                  "1 hora/mes soporte profesional para cambios de texto e imágenes",
                  "Soporte prioritario (respuesta en 24h)",
                  "Soporte WhatsApp premium con PIN único",
                  "Dashboard de Analítica Básica y reportes mensuales",
                  "Configuración de Google Analytics y Search Console incluida"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 space-y-3">
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent"
                  onClick={() => handleWhatsAppClick('Avanzado')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contratar Plan Avanzado
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent/5"
                  onClick={() => window.location.href = '/registro'}
                >
                  Registrarse Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>Sobrecargo:</strong> S/15 por cada 1,000 visitas adicionales o 3 GB (lo que sea mayor)
          </p>
          <p className="text-sm text-muted-foreground">
            Los dominios se pueden comprar en <strong>Namecheap</strong> • Evitamos GoDaddy por costos altos y panel confuso
          </p>
        </div>
      </div>
    </section>
  );
};