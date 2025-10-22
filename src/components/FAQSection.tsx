import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { businessData } from "@/config/businessData";

export const FAQSection = () => {
  const faqs = [
    {
      question: "¿En cuánto tiempo estará listo mi sitio web?",
      answer: "Tu sitio web profesional estará completamente listo y online en 72 horas. Trabajamos con plantillas optimizadas de alta calidad que personalizamos con tu contenido, logo, menú y fotos."
    },
    {
      question: "¿Qué cambios puedo hacer yo mismo?",
      answer: "A través de tu dashboard personal puedes actualizar: menú con precios, horarios de atención, información de contacto, imágenes, y textos básicos. Para cambios de diseño o funcionalidades adicionales, te ayudamos según tu plan."
    },
    {
      question: "¿Usan plantillas o diseños completamente personalizados?",
      answer: "Utilizamos plantillas profesionales creadas internamente con las últimas tecnologías. Esto nos permite entregar sitios de alta calidad en 72 horas. No ofrecemos diseños completamente personalizados en los planes básicos, pero todas las plantillas son modernas y optimizadas para restaurantes."
    },
    {
      question: "¿Qué pasa si quiero cancelar el servicio?",
      answer: "Puedes cancelar en cualquier momento sin penalizaciones. El sitio se desactiva en tu próximo ciclo de facturación. Guardamos tu sitio web por 6 meses en nuestro sistema para que puedas reactivarlo fácilmente. Como es un servicio administrado, no ofrecemos migración del sitio a otros servidores."
    },
    {
      question: "¿Dónde compro mi dominio?",
      answer: "Los dominios se compran por separado. Recomendamos Namecheap (evitamos GoDaddy por costos altos y panel confuso). Te guiamos en todo el proceso de compra y lo configuramos sin costo adicional."
    },
    {
      question: "¿El precio de S/297 es realmente fijo de por vida?",
      answer: "Sí, durante el período promocional de lanzamiento, el precio que contratas se mantiene de por vida mientras tu suscripción esté activa. Es nuestra garantía para early adopters."
    },
    {
      question: "¿Qué incluye el hosting?",
      answer: "Incluimos hosting ilimitado con SSL (https) gratis y automático. No hay límites de visitas ni ancho de banda. Utilizamos infraestructura de Cloudflare Pages para garantizar velocidad, seguridad y disponibilidad mundial."
    },
    {
      question: "¿Puedo agregar funciones personalizadas no listadas?",
      answer: "Las funciones listadas en nuestros planes son lo que incluimos. Si necesitas funcionalidades completamente personalizadas (sistemas de reservas complejos, e-commerce integrado, etc.), podemos cotizarlas por separado, pero no están incluidas en los planes base."
    },
    {
      question: "¿El sitio funciona bien en celulares?",
      answer: "Sí, todos nuestros sitios son mobile-first. Se diseñan primero para móvil y luego se adaptan a desktop. Más del 80% de tus clientes visitarán desde celular, por eso es nuestra prioridad."
    },
    {
      question: "¿Qué diferencia hay entre Plan Básico y Avanzado en soporte?",
      answer: "Plan Básico: Soporte WhatsApp básico y email (48h) para actualizaciones vía dashboard. Plan Avanzado: Soporte prioritario (24h), 1 hora/mes de cambios profesionales (textos, imágenes, secciones), analytics y WhatsApp premium con PIN único."
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