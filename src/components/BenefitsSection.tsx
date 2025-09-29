import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  MessageCircle, 
  Search, 
  Zap, 
  Image as ImageIcon, 
  Star,
  Smartphone,
  Settings,
  Shield,
  DollarSign,
  Clock,
  Headphones
} from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Sin Comisiones por Cliente",
      description: "0% de comisión. A diferencia de otros servicios, no cobramos por cada cliente que te llega.",
      color: "text-primary"
    },
    {
      icon: Download,
      title: "Menú Digital Siempre Actualizado",
      description: "Tu menú completo online y descargable en PDF. Clientes ven tus platos antes de decidir.",
      color: "text-accent"
    },
    {
      icon: Settings,
      title: "Control Total - Sin Esperas",
      description: "Actualiza menú, precios y horarios tú mismo en minutos. No dependas de desarrolladores lentos.",
      color: "text-primary"
    },
    {
      icon: Headphones,
      title: "Soporte de Alta Calidad",
      description: "Atención rápida cuando lo necesites. Nada de tickets ignorados o sitios caídos.",
      color: "text-accent"
    },
    {
      icon: ImageIcon,
      title: "Galería Profesional",
      description: "Muestra tus platos y ambiente con galería optimizada. Atrae más clientes con fotos impactantes.",
      color: "text-primary"
    },
    {
      icon: Search,
      title: "Domina Google Desde Día 1",
      description: "SEO profesional incluido. Aparece primero cuando buscan 'restaurantes cerca de mí'.",
      color: "text-accent"
    },
    {
      icon: Clock,
      title: "Online en 72 Horas",
      description: "Tu sitio web profesional listo en 3 días. Mientras competidores esperan meses, tú ya capturas clientes.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Hosting Confiable y Rápido",
      description: "Sitio web que funciona 24/7 sin caídas. Carga en menos de 3 segundos en cualquier dispositivo.",
      color: "text-accent"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Directo",
      description: "Botón flotante de WhatsApp para que clientes te contacten al instante desde cualquier página.",
      color: "text-primary"
    },
    {
      icon: Smartphone,
      title: "Perfecto en Móvil",
      description: "Diseño responsive impecable. El 80% de tus clientes te buscarán desde el celular.",
      color: "text-accent"
    },
    {
      icon: Star,
      title: "Muestra tus Mejores Reseñas",
      description: "Sección de testimonios para generar confianza. Muestra por qué eres la mejor opción.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Dashboard de Gestión",
      description: "Panel intuitivo para gestionar todo tu contenido sin conocimientos técnicos.",
      color: "text-accent"
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index} 
                className={`group transition-all duration-300 hover:-translate-y-2 border-2 ${
                  benefit.color === 'text-accent' 
                    ? 'hover:shadow-accent hover:border-accent/20' 
                    : 'hover:shadow-primary hover:border-primary/20'
                }`}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${benefit.color} group-hover:scale-110 transition-transform duration-300 ${
                    benefit.color === 'text-accent' ? 'bg-accent/10' : 'bg-muted'
                  }`}>
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