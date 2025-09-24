import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  MessageCircle, 
  Search, 
  Zap, 
  Image as ImageIcon, 
  Star,
  Instagram,
  Smartphone
} from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: Download,
      title: "Menú Descargable PDF",
      description: "Tus clientes pueden descargar el menú completo en PDF directamente desde tu sitio web.",
      color: "text-primary"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Directo",
      description: "Botón flotante de WhatsApp para que tus clientes te contacten al instante.",
      color: "text-[#25D366]"
    },
    {
      icon: Search,
      title: "Optimizado para Google",
      description: "SEO básico incluido para que aparezcan en las búsquedas de 'restaurantes cerca de mí'.",
      color: "text-accent"
    },
    {
      icon: Zap,
      title: "Carga Rápida",
      description: "Sitio web optimizado para cargar en menos de 3 segundos, incluso en móviles.",
      color: "text-primary"
    },
    {
      icon: ImageIcon,
      title: "Galería e Info Clara",
      description: "Fotos profesionales de tus platos e información clara de horarios y ubicación.",
      color: "text-accent"
    },
    {
      icon: Smartphone,
      title: "Optimizado para Móvil",
      description: "Diseño responsive que se ve perfecto en celulares, tablets y computadoras.",
      color: "text-primary"
    },
    {
      icon: Star,
      title: "Reseñas de Google",
      description: "Integración opcional con tus reseñas de Google para generar más confianza.",
      color: "text-accent"
    },
    {
      icon: Instagram,
      title: "Feed de Instagram",
      description: "Muestra automáticamente tus últimas fotos de Instagram en tu sitio web.",
      color: "text-[#E4405F]"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Beneficios Incluidos
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Todo lo que necesitas para
            <span className="text-primary block">Destacar Online</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cada sitio web incluye estas funcionalidades profesionales que harán crecer tu negocio 
            desde el primer día. Sin extras ocultos, todo está incluido.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-primary transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center ${benefit.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-subtle p-8 rounded-2xl border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              ¿Listo para hacer crecer tu restaurante online?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Más de 100 restaurantes ya confían en nosotros. Tu sitio web profesional 
              está a solo 72 horas de distancia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-smooth shadow-primary"
                onClick={() => document.getElementById('application')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Aplicar Ahora
              </button>
              <button 
                className="border border-primary text-primary hover:bg-primary/5 px-8 py-3 rounded-lg font-semibold transition-smooth"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Precios
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};