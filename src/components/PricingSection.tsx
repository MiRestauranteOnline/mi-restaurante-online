import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Plan {
  id: string;
  plan_key: string;
  name: string;
  monthly_price: number;
  original_price?: number;
  discount_percentage?: number;
  features: string[];
  is_popular: boolean;
  currency: string;
}

export const PricingSection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('id, plan_key, name, monthly_price, original_price, discount_percentage, features, is_popular, currency')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;

        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);
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
            <Star className="w-5 h-5 fill-current" aria-hidden="true" />
            <span className="font-bold text-lg">¡PRECIO DE LANZAMIENTO!</span>
          </div>
          <p className="text-sm">
            Aprovecha ahora: Los precios pueden aumentar. El precio mensual al momento de la compra se mantendrá hasta la cancelación.
          </p>
        </div>

        {/* Pricing Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border-2 ${plan.plan_key === 'advanced' ? 'hover:shadow-primary border-primary' : 'border-accent hover:shadow-accent'} transition-smooth ${plan.plan_key === 'advanced' ? 'shadow-lg' : ''}`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-6">
                    <Badge className="bg-accent text-accent-foreground">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {plan.plan_key === 'basic' ? 'Perfecto para comenzar online' : 'Para restaurantes en crecimiento'}
                  </CardDescription>
                  
                  <div className="py-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className={`text-5xl font-bold ${plan.plan_key === 'advanced' ? 'text-primary' : 'text-accent'}`} role="heading" aria-level={3}>
                        {plan.currency === 'USD' ? '$' : 'S/'}{plan.monthly_price}
                      </span>
                      <span className="text-lg text-muted-foreground">/mes</span>
                    </div>
                    {plan.original_price && plan.discount_percentage && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-lg line-through text-destructive">
                          {plan.currency === 'USD' ? '$' : 'S/'}{plan.original_price}
                        </span>
                        <Badge variant="destructive" className="text-xs">-{plan.discount_percentage}%</Badge>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.plan_key === 'advanced' ? 'Incluye todo del Plan Básico +' : 'Precio fijo de por vida'}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${plan.plan_key === 'advanced' ? 'text-primary' : 'text-accent'} flex-shrink-0`} aria-hidden="true" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.plan_key === 'advanced' && (
                    <div className="mt-6 p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
                      <h4 className="font-semibold text-sm mb-3 text-primary">Ventajas Premium del Plan Avanzado:</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" />
                          <p className="text-xs text-foreground">
                            <strong>Soporte prioritario:</strong> Respuestas en 24h vs 48h del plan básico
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" />
                          <p className="text-xs text-foreground">
                            <strong>1 hora de soporte mensual:</strong> Ideal para cambios de menú, actualización de contenido o ajustes de funcionalidades
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground">
                            <strong>Analíticas avanzadas:</strong> Entiende a tus clientes y optimiza tu sitio basado en datos reales
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6">
                    <Button 
                      className={`w-full ${plan.plan_key === 'advanced' ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary' : 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent'}`}
                      onClick={() => navigate(`/registro?plan=${plan.plan_key}`)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                      Registrarse con {plan.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>Hosting ilimitado:</strong> Sin límites de visitas ni ancho de banda • SSL gratis incluido
          </p>
          <p className="text-sm text-muted-foreground">
            Los dominios se pueden comprar en <strong>Namecheap</strong> • Evitamos GoDaddy por costos altos y panel confuso
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Nuestros planes están basados en plantillas optimizadas. No ofrecemos diseños personalizados ni desarrollos custom.
          </p>
        </div>
      </div>
    </section>
  );
};