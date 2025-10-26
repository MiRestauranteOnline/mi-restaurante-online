import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Star, CheckCircle, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-restaurant-websites.webp";
import { businessData } from "@/config/businessData";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const navigate = useNavigate();
  const [basicPlanPrice, setBasicPlanPrice] = useState<number>(297);
  const [originalPrice, setOriginalPrice] = useState<number>(500);
  const [currency, setCurrency] = useState<string>('PEN');

  useEffect(() => {
    const fetchBasicPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('monthly_price, original_price, currency')
          .eq('plan_key', 'basic')
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data) {
          setBasicPlanPrice(data.monthly_price);
          setOriginalPrice(data.original_price || data.monthly_price);
          setCurrency(data.currency);
        }
      } catch (error) {
        console.error('Error fetching basic plan:', error);
      }
    };

    fetchBasicPlan();
  }, []);
  
  const handleWhatsAppClick = () => {
    window.open(`${businessData.contact.whatsapp.url}?text=${encodeURIComponent(businessData.contact.whatsapp.message)}`, "_blank");
  };

  const handleSignupClick = () => {
    navigate('/registro');
  };

  return (
    <section className="relative min-h-screen bg-gradient-subtle flex items-center">
      <div className="container mx-auto px-4 pt-24 md:pt-16 pb-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-up">
            {/* Credibility Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
              <Star className="w-4 h-4 fill-current" aria-hidden="true" />
              <span className="text-sm font-medium">Fundado por diseñador con 100+ proyectos internacionales</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Tu Restaurante Online
                <span className="text-primary block">en Solo 72 Horas</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Transformamos tu restaurante con un sitio web que genera más clientes. 
                Hosting incluido, entrega en 72 horas, y SEO optimizado para dominar Google. 
                Todo desde S/297/mes, sin costo inicial.
              </p>
            </div>

            {/* Pricing Highlight */}
            <div className="bg-card border-2 border-accent p-6 rounded-xl shadow-accent">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-accent" aria-hidden="true" />
                <span className="font-semibold text-lg">Precio especial por lanzamiento</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary" role="heading" aria-level={3}>
                  {currency === 'USD' ? '$' : 'S/'}{basicPlanPrice}
                </span>
                <span className="text-lg text-muted-foreground">/mes</span>
                <span className="text-lg line-through text-destructive ml-2">
                  {currency === 'USD' ? '$' : 'S/'}{originalPrice}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                🎯 Sin costo inicial • Precio garantizado de por vida • Oferta por tiempo limitado
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary transition-smooth flex items-center gap-2"
                onClick={handleSignupClick}
              >
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
                Registrarse Ahora
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary/5 flex items-center gap-2"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                WhatsApp
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                Website Listo en 72 Horas
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                Hosting & SSL Incluido
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                CDN para Mayor Velocidad
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                Dashboard de Control Total
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                Sin Costo Inicial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                Cancela Cuando Quieras
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                Protección Anti-Spam Cloudflare
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                Seguridad de Datos Empresarial
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

      {/* Scroll Indicator */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-muted-foreground">
          <span className="text-sm mb-2">Scroll</span>
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
            <div className="w-1 h-3 bg-current rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};