import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PlanFeatures {
  name: string;
  features: string[];
  plan_key: string;
}

export const ProblemSolutionSection = () => {
  const [plans, setPlans] = useState<PlanFeatures[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('name, features, plan_key')
          .eq('is_active', true)
          .in('plan_key', ['basic', 'advanced'])
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

  // Comprehensive feature list with proper categorization
  const allFeatures = [
    'Hosting ilimitado (visitas y ancho de banda)',
    'Dominio personalizado o subdominio incluido',
    'SSL y CDN incluidos',
    'Contenido optimizado para SEO',
    'Menú digital en vivo (editable en segundos)',
    'Menú descargable en PDF',
    'Sistema completo de reservaciones por mesa',
    'Gestión de disponibilidad de mesas',
    'Carrusel de imágenes personalizable',
    'Sección de preguntas frecuentes',
    'Sección de reseñas destacadas',
    'Gestión de equipo y staff',
    'Enlaces a redes sociales',
    'Integración con apps de delivery',
    'Botón flotante de WhatsApp',
    'Control total de visibilidad de secciones',
    'Cambios en vivo instantáneos',
    'Gestión desde dispositivo móvil',
    'Guías de instrucción completas',
    'Video tutoriales paso a paso',
    'Cancelación flexible sin penalización',
    'Soporte por tickets',
  ];

  const basicPlan = plans.find(p => p.plan_key === 'basic');
  const advancedPlan = plans.find(p => p.plan_key === 'advanced');
  
  // Special handling for support features
  const getFeatureValue = (feature: string, planKey: string) => {
    if (feature === 'Soporte por tickets') {
      return planKey === 'basic' ? '48h' : '24h';
    }
    return true;
  };
  
  const hasFeature = (feature: string, planKey: string) => {
    // WhatsApp support only in advanced
    if (feature.toLowerCase().includes('whatsapp prioritario')) {
      return planKey === 'advanced';
    }
    return true; // All other features in both plans
  };

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Intro Text */}
        <div className="text-center mb-12 animate-fade-up max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground">
            En 2024, el <span className="font-bold text-foreground">87% de los clientes buscan restaurantes online</span> antes de decidir. 
            Si no te encuentran, van con la competencia.
          </p>
        </div>

        {/* Comparison Section */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Lo que hace que <span className="text-primary">Mi Restaurante Online</span> sea diferente
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50%] text-left font-bold text-foreground">
                      Características
                    </TableHead>
                    <TableHead className="text-center font-bold text-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{basicPlan?.name || 'Plan Básico'}</span>
                        <Badge variant="outline" className="text-xs">Esencial</Badge>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-bold text-primary">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{advancedPlan?.name || 'Plan Avanzado'}</span>
                        <Badge className="text-xs bg-primary text-primary-foreground">Más Popular</Badge>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allFeatures.map((feature, index) => {
                    const basicValue = getFeatureValue(feature, 'basic');
                    const advancedValue = getFeatureValue(feature, 'advanced');
                    const inBasic = hasFeature(feature, 'basic');
                    const inAdvanced = hasFeature(feature, 'advanced');
                    
                    return (
                      <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          {feature}
                        </TableCell>
                        <TableCell className="text-center">
                          {inBasic ? (
                            <div className="flex justify-center items-center">
                              {typeof basicValue === 'string' ? (
                                <span className="text-sm font-medium text-accent">{basicValue}</span>
                              ) : (
                                <CheckCircle className="w-5 h-5 text-accent" />
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <X className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {inAdvanced ? (
                            <div className="flex justify-center items-center">
                              {typeof advancedValue === 'string' ? (
                                <span className="text-sm font-medium text-primary">{advancedValue}</span>
                              ) : (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <X className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="hover:bg-muted/30 transition-colors bg-muted/20">
                    <TableCell className="font-medium text-foreground">
                      Soporte prioritario por WhatsApp
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <X className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};