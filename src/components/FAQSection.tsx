import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { businessData } from "@/config/businessData";

export const FAQSection = () => {
  const faqs = [
    {
      question: "¿En cuánto tiempo estará listo mi sitio web?",
      answer: "Tu sitio web profesional estará completamente listo y online en 72 horas. Trabajamos con plantillas optimizadas de alta calidad creadas con React que personalizamos con tu contenido, logo, menú y fotos."
    },
    {
      question: "¿Qué cambios puedo hacer yo mismo desde el dashboard?",
      answer: "Desde tu dashboard puedes actualizar: menú completo con categorías y precios, horarios de atención, información de contacto, imágenes de galería, equipo/staff, links de delivery, FAQs, sistema de reservas (horarios y disponibilidad), y ver analíticas detalladas. Todo sin necesitar conocimientos técnicos."
    },
    {
      question: "¿Usan plantillas o diseños completamente personalizados?",
      answer: "Utilizamos plantillas profesionales creadas internamente con React y tecnología moderna. A diferencia de sistemas anticuados como WordPress, nuestras soluciones son más rápidas, seguras y fáciles de actualizar. Esto nos permite entregar sitios de alta calidad en 72 horas. No ofrecemos diseños completamente personalizados ni desarrollos custom - todas nuestras soluciones están basadas en plantillas optimizadas para restaurantes."
    },
    {
      question: "¿Necesito comprar un dominio o puedo empezar gratis?",
      answer: "Puedes empezar inmediatamente con nuestro subdominio gratuito (ejemplo: turestaurante.mirestauranteonline.com). Si prefieres tu propio dominio, recomendamos comprarlo en Namecheap (evitamos GoDaddy por costos altos y panel confuso). Te guiamos en todo el proceso de compra y lo configuramos sin costo adicional."
    },
    {
      question: "¿El precio mensual es realmente fijo de por vida?",
      answer: "Sí, durante el período promocional de lanzamiento, el precio que contratas se mantiene de por vida mientras tu suscripción esté activa. Es nuestra garantía para early adopters. Los precios pueden aumentar para nuevos clientes, pero tu tarifa queda bloqueada."
    },
    {
      question: "¿Qué incluye exactamente el hosting?",
      answer: "Incluimos hosting ilimitado con SSL (https) gratis y automático. No hay límites de visitas ni ancho de banda. Utilizamos infraestructura de Cloudflare Pages (CDN mundial) para garantizar velocidad, seguridad y disponibilidad 24/7. Tu sitio carga rápido desde cualquier parte del mundo."
    },
    {
      question: "¿Qué incluye el sistema de reservas?",
      answer: "Sistema completo de gestión de mesas con configuración de horarios, capacidad de mesas, disponibilidad por día/hora, notificaciones en tiempo real de nuevas reservas, y panel de administración para gestionar todas tus reservas. Los clientes reservan directamente desde tu sitio web."
    },
    {
      question: "¿Qué diferencia hay entre Plan Básico y Avanzado?",
      answer: "Plan Básico incluye todo lo esencial: sitio web completo, menú digital, reservas, WhatsApp, SEO básico y soporte en 48h. Plan Avanzado añade: soporte prioritario en 24h, 1 hora/mes de cambios profesionales por nuestro equipo (ideal para actualizar textos, contenido o agregar funcionalidades), analíticas avanzadas con métricas detalladas, y WhatsApp premium con PIN único para atención prioritaria."
    },
    {
      question: "¿El sitio funciona bien en celulares?",
      answer: "Sí, todos nuestros sitios son mobile-first. Se diseñan primero para móvil y luego se adaptan a desktop. Más del 80% de tus clientes visitarán desde celular, por eso es nuestra prioridad. Además, puedes gestionar todo el dashboard desde tu móvil sin necesitar computadora."
    },
    {
      question: "¿Qué pasa si quiero cancelar el servicio?",
      answer: "Puedes cancelar en cualquier momento sin penalizaciones. El sitio se desactiva al final de tu ciclo de facturación actual. Guardamos tu sitio web por 6 meses en nuestro sistema para que puedas reactivarlo fácilmente si cambias de opinión. Como es un servicio administrado, no ofrecemos migración del sitio a otros servidores."
    },
    {
      question: "¿Ofrecen diseños personalizados o desarrollos custom?",
      answer: "No ofrecemos diseños personalizados ni desarrollos custom. Nuestros planes están basados en plantillas profesionales optimizadas que incluyen todas las funcionalidades esenciales que necesita un restaurante: menú digital + PDF descargable, sistema de reservas, galería de imágenes, WhatsApp integrado, links de delivery, SEO, analíticas, y más. Si necesitas un proyecto completamente personalizado, puedes contactarnos a info@mirestaurante.online para evaluar tu caso específico."
    }
  ];

  const handleWhatsAppClick = () => {
    window.open(`${businessData.contact.whatsapp.url}?text=${encodeURIComponent("Hola, tengo una pregunta sobre los sitios web para restaurantes")}`, "_blank");
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Preguntas Frecuentes
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Resolvemos todas tus
            <span className="text-primary block">Dudas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estas son las preguntas más comunes de nuestros clientes. Si tienes alguna otra duda, 
            ¡conversemos por WhatsApp!
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 hover:border-primary/20 transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-subtle border border-primary/20 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              ¿Tienes más preguntas?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestro equipo está disponible por WhatsApp para resolver cualquier duda específica 
              sobre tu proyecto. ¡No esperes más!
            </p>
            <Button 
              onClick={handleWhatsAppClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 rounded-lg font-semibold transition-smooth shadow-accent flex items-center gap-3 mx-auto"
            >
              <MessageCircle className="w-5 h-5" />
              Preguntar por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};