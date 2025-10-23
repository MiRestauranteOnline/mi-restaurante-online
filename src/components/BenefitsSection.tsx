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
import { useNavigate } from "react-router-dom";

export const BenefitsSection = () => {
  const navigate = useNavigate();
  const benefits = [
    {
      icon: DollarSign,
      title: "Hosting Ilimitado Incluido",
      description: "Sin límites de visitas ni ancho de banda. Tu sitio carga rápido con CDN y SSL incluidos, sin cargos por tráfico extra.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Actualización Instantánea",
      description: "Cambia menú, precios, horarios y contenido en segundos. Los cambios aparecen en vivo sin esperas ni desarrolladores.",
      color: "text-accent"
    },
    {
      icon: Settings,
      title: "Sistema de Reservas Completo",
      description: "Gestión inteligente de mesas, horarios y disponibilidad. Recibe notificaciones en tiempo real de cada reserva.",
      color: "text-primary"
    },
    {
      icon: Search,
      title: "SEO y Google Search Console",
      description: "Optimización técnica completa, metadatos automáticos y seguimiento en Google. Aparece cuando clientes buscan restaurantes.",
      color: "text-accent"
    },
    {
      icon: Smartphone,
      title: "Gestiona Todo Desde Tu Móvil",
      description: "Dashboard optimizado para celular. Actualiza tu sitio desde cualquier lugar, en segundos, sin necesitar computadora.",
      color: "text-primary"
    },
    {
      icon: ImageIcon,
      title: "Carrusel de Imágenes Profesional",
      description: "Galería optimizada automáticamente. Sube fotos desde tu móvil y muéstralas en formato profesional sin perder calidad.",
      color: "text-accent"
    },
    {
      icon: Download,
      title: "Menú Digital Completo",
      description: "Menú en vivo editable al instante + versión PDF descargable. Organiza por categorías ilimitadas con fotos y precios.",
      color: "text-primary"
    },
    {
      icon: Star,
      title: "Panel de Analíticas Detallado",
      description: "Seguimiento de visitas, conversiones, clics de WhatsApp y teléfono. Métricas de cada sección del menú y dispositivos.",
      color: "text-accent"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integrado + Popup",
      description: "Botón flotante en todas las páginas + popup personalizable. Mensajes predefinidos para reservas, delivery y consultas.",
      color: "text-primary"
    },
    {
      icon: Headphones,
      title: "Soporte Real con Respuesta Rápida",
      description: "Tickets con respuesta en 24-48h. Plan avanzado incluye soporte prioritario por WhatsApp con atención directa.",
      color: "text-accent"
    },
    {
      icon: Clock,
      title: "Online en 72 Horas",
      description: "Tu sitio profesional listo en 3 días con contenido optimizado y configuración personalizada. Mientras otros esperan meses, tú capturas clientes.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Control Total Sin Código",
      description: "Activa/desactiva secciones, añade staff, delivery links y FAQs. Guías completas y videos tutoriales para cada función.",
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
              Fundado por un diseñador con experiencia internacional en más de 100 proyectos web. 
              Construimos con tecnología moderna (React/Next.js), no sistemas anticuados como WordPress. 
              Tu sitio profesional estará listo en 72 horas, no en meses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-smooth shadow-primary"
                onClick={() => navigate('/registro')}
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