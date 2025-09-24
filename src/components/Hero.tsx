import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Star, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-restaurant-websites.jpg";

export const Hero = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/51999999999?text=Hola, quiero información sobre los sitios web para restaurantes", "_blank");
  };

  return (
    <section className="relative min-h-screen bg-gradient-subtle flex items-center">
      {/* Promo Banner */}
      <div className="absolute top-0 left-0 right-0 gradient-promo text-secondary py-2 z-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold animate-pulse-accent">
            🎉 OFERTA LIMITADA: Sin costo inicial • Precio fijo de por vida • ¡Solo hasta fin de mes!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-up">
            {/* Credibility Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Más de 100 sitios web creados internacionalmente</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Tu Restaurante 
                <span className="text-primary block">Online en 72h</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Soy diseñador web profesional con años de experiencia. Gracias a mi nuevo sistema, 
                creo sitios web profesionales más rápido y barato sin perder calidad.
              </p>
            </div>

            {/* Pricing Highlight */}
            <div className="bg-card border-2 border-accent p-6 rounded-xl shadow-accent">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-accent" />
                <span className="font-semibold text-lg">Precio especial por lanzamiento</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">S/297</span>
                <span className="text-lg text-muted-foreground">/mes</span>
                <span className="text-lg line-through text-destructive ml-2">S/500</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Sin costo inicial • Precio fijo de por vida si contratas ahora
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary transition-smooth flex items-center gap-2"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary/5"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Precios
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                SEO Básico Incluido
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Optimizado para Móvil
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Menú Descargable PDF
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                WhatsApp Directo
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-slide-in-right">
            <div className="relative overflow-hidden rounded-2xl shadow-elevated">
              <img 
                src={heroImage} 
                alt="Ejemplos de sitios web profesionales para restaurantes creados por Mi Restaurante Online"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-xl shadow-primary border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Sitios Creados</div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground p-4 rounded-xl shadow-accent">
              <div className="text-center">
                <div className="text-2xl font-bold">72h</div>
                <div className="text-sm">Entrega</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};