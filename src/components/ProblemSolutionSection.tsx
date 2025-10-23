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

  // Get all unique features from both plans
  const allFeatures = Array.from(
    new Set([
      ...(plans.find(p => p.plan_key === 'basic')?.features || []),
      ...(plans.find(p => p.plan_key === 'advanced')?.features || [])
    ])
  );

  const basicPlan = plans.find(p => p.plan_key === 'basic');
  const advancedPlan = plans.find(p => p.plan_key === 'advanced');

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
                    const inBasic = basicPlan?.features.includes(feature);
                    const inAdvanced = advancedPlan?.features.includes(feature);
                    
                    return (
                      <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          {feature}
                        </TableCell>
                        <TableCell className="text-center">
                          {inBasic ? (
                            <div className="flex justify-center">
                              <CheckCircle className="w-5 h-5 text-accent" />
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <X className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {inAdvanced ? (
                            <div className="flex justify-center">
                              <CheckCircle className="w-5 h-5 text-primary" />
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
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};