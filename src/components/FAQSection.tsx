import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

export const FAQSection = () => {
  const faqs = [
    {
      question: "¿En cuánto tiempo estará listo mi sitio web?",
      answer: "Tu demo funcional estará listo en 72 horas. Una vez aprobado el diseño y recibido el primer pago, el sitio final se entrega en 24 horas adicionales con tu dominio configurado."
    },
    {
      question: "¿Qué cambios puedo hacer yo mismo?",
      answer: "Con el sistema PIN puedes cambiar: textos básicos, precios del menú, horarios, información de contacto, y agregar/quitar fotos. Para cambios más complejos, nuestro soporte te ayuda por WhatsApp."
    },
    {
      question: "¿Ofrecen migración de mi sitio web actual?",
      answer: "No ofrecemos migración porque trabajamos con un sistema administrado que garantiza rapidez y calidad. Si tienes un sitio actual, creamos uno completamente nuevo con tu contenido optimizado."
    },
    {
      question: "¿Qué pasa si quiero cancelar el servicio?",
      answer: "Puedes cancelar en cualquier momento. Tras 6 meses de no pago, el sitio se desactiva automáticamente. No hay penalizaciones ni costos ocultos de cancelación."
    },
    {
      question: "¿Dónde compro el dominio y correo electrónico?",
      answer: "Recomendamos Namecheap para dominios y correos. Es más barato que GoDaddy y tiene un panel fácil de usar. Te guiamos en todo el proceso de compra y configuración."
    },
    {
      question: "¿El precio de S/297 es realmente fijo de por vida?",
      answer: "Sí, si contratas durante esta promoción, mantienes el precio de S/297 por mes de por vida, sin aumentos. Es nuestra garantía de precio fijo para clientes fundadores."
    },
    {
      question: "¿Qué incluye el hosting de 3,000 visitas mensuales?",
      answer: "Son 3,000 visitas únicas por mes o 6 GB de ancho de banda, lo que sea mayor. Para la mayoría de restaurantes esto cubre perfectamente el tráfico inicial. Si creces, el sobrecargo es solo S/15 por cada 1,000 visitas adicionales."
    },
    {
      question: "¿Pueden integrar mi página con delivery apps como Rappi?",
      answer: "Sí, incluimos botones directos a tus perfiles en Rappi, PedidosYa, UberEats y otras plataformas de delivery. También podemos integrar el WhatsApp para pedidos directos."
    },
    {
      question: "¿El sitio web funciona bien en celulares?",
      answer: "Absolutamente. Todos nuestros sitios son mobile-first, diseñados primero para celular y luego adaptados a computadora. Más del 80% de tus clientes visitarán desde el móvil."
    },
    {
      question: "¿Qué tipo de soporte recibo después del lanzamiento?",
      answer: "Soporte completo por WhatsApp para dudas técnicas, cambios menores, y optimizaciones. El Plan Avanzado incluye 1 hora mensual para cambios más extensos como nuevas secciones o modificaciones de diseño."
    }
  ];

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/51999999999?text=Hola, tengo una pregunta sobre los sitios web para restaurantes", "_blank");
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
            <button 
              onClick={handleWhatsAppClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 rounded-lg font-semibold transition-smooth shadow-accent flex items-center gap-3 mx-auto"
            >
              <MessageCircle className="w-5 h-5" />
              Preguntar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};