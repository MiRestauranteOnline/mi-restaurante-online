import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Palette, 
  Code, 
  Rocket 
} from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      icon: MessageSquare,
      title: "Conversemos",
      description: "Completa el formulario o contáctanos por WhatsApp. Te preguntaremos sobre tu restaurante, estilo y necesidades.",
      duration: "15 minutos",
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      step: "2", 
      icon: Palette,
      title: "Diseñamos",
      description: "Nuestro equipo crea el diseño personalizado basado en tu marca, menú y público objetivo.",
      duration: "24 horas",
      color: "bg-accent/10 text-accent border-accent/20"
    },
    {
      step: "3",
      icon: Code,
      title: "Desarrollamos",
      description: "Programamos tu sitio web con todas las funcionalidades: WhatsApp, menú PDF, SEO y optimización móvil.",
      duration: "48 horas",
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      step: "4",
      icon: Rocket,
      title: "¡Lanzamos!",
      description: "Tu sitio está listo. Te entregamos el acceso completo y comenzamos el soporte continuo por WhatsApp.",
      duration: "72 horas",
      color: "bg-accent/10 text-accent border-accent/20"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Proceso Simple
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            ¿Cómo funciona nuestro
            <span className="text-primary block">Sistema Express?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            En solo 4 pasos sencillos, tu restaurante tendrá presencia online profesional. 
            Un proceso probado con más de 100 sitios web exitosos.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/20 z-0" />
                )}
                
                <Card className={`relative z-10 border-2 ${step.color} hover:shadow-primary transition-all duration-300 hover:-translate-y-2`}>
                  <CardContent className="p-6 text-center space-y-4">
                    {/* Step Number */}
                    <div className="relative">
                      <div className={`w-20 h-20 mx-auto rounded-full ${step.color} flex items-center justify-center relative`}>
                        <Icon className="w-10 h-10" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                      
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${step.color}`}>
                        ⏱️ {step.duration}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Credibility Strip */}
        <div className="mt-20 text-center">
          <div className="bg-card border border-primary/20 p-8 rounded-2xl shadow-primary animate-fade-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
            </div>
            
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Más de <span className="text-primary">100 sitios web</span> creados internacionalmente
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Ahora, al servicio de restaurantes en Perú con precios locales y soporte en español
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Experiencia internacional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Tecnología probada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Soporte local 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Precios accesibles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};