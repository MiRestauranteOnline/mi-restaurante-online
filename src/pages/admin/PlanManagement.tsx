import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Edit, Save, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const PlanManagement = () => {
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editForm, setEditForm] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditForm({ ...plan });
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditForm(null);
  };

  const handleSave = async () => {
    if (!editForm) return;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: editForm.name,
          monthly_price: editForm.monthly_price,
          original_price: editForm.original_price,
          discount_percentage: editForm.discount_percentage,
          features: editForm.features,
          is_popular: editForm.is_popular,
        })
        .eq('id', editForm.id);

      if (error) throw error;

      await fetchPlans();
      
      toast({
        title: "Plan actualizado",
        description: `Los cambios en ${editForm.name} se han guardado correctamente.`,
      });

      setEditingPlan(null);
      setEditForm(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive",
      });
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    if (!editForm) return;
    const newFeatures = [...editForm.features];
    newFeatures[index] = value;
    setEditForm({ ...editForm, features: newFeatures });
  };

  const handleAddFeature = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, features: [...editForm.features, ""] });
  };

  const handleRemoveFeature = (index: number) => {
    if (!editForm) return;
    const newFeatures = editForm.features.filter((_, i) => i !== index);
    setEditForm({ ...editForm, features: newFeatures });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Planes</h1>
        <p className="text-muted-foreground">
          Administra los planes de suscripción y sus características
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={editingPlan === plan.id ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {editingPlan === plan.id ? (
                        <Input
                          value={editForm?.name || ""}
                          onChange={(e) => setEditForm(editForm ? { ...editForm, name: e.target.value } : null)}
                          className="text-xl font-bold"
                        />
                      ) : (
                        <>
                          {plan.name}
                          {plan.is_popular && (
                            <Badge className="bg-primary text-primary-foreground">
                              Más Popular
                            </Badge>
                          )}
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {editingPlan === plan.id ? "Editando plan..." : "Plan de suscripción"}
                    </CardDescription>
                  </div>
                  {editingPlan === plan.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="space-y-2">
                  <Label>Precio mensual (S/)</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editForm?.monthly_price || 0}
                      onChange={(e) => setEditForm(editForm ? { ...editForm, monthly_price: parseFloat(e.target.value) } : null)}
                    />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{plan.currency === 'USD' ? '$' : 'S/'}{plan.monthly_price}</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  )}
                </div>

                {/* Original Price & Discount */}
                {editingPlan === plan.id ? (
                  <>
                    <div className="space-y-2">
                      <Label>Precio original ({plan.currency === 'USD' ? '$' : 'S/'})</Label>
                      <Input
                        type="number"
                        value={editForm?.original_price || 0}
                        onChange={(e) => setEditForm(editForm ? { ...editForm, original_price: parseFloat(e.target.value) } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descuento (%)</Label>
                      <Input
                        type="number"
                        value={editForm?.discount_percentage || 0}
                        onChange={(e) => setEditForm(editForm ? { ...editForm, discount_percentage: parseFloat(e.target.value) } : null)}
                      />
                    </div>
                  </>
                ) : (
                  plan.original_price && plan.discount_percentage && (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-muted-foreground">{plan.currency === 'USD' ? '$' : 'S/'}{plan.original_price}</span>
                      <Badge variant="destructive">-{plan.discount_percentage}%</Badge>
                    </div>
                  )
                )}

                {/* Features */}
                <div className="space-y-2">
                  <Label>Características</Label>
                  {editingPlan === plan.id ? (
                    <div className="space-y-2">
                      {editForm?.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Textarea
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveFeature(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={handleAddFeature}>
                        Agregar característica
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            ))}
        </div>
      )}

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Nota:</strong> Los cambios en los planes se reflejarán en la página de registro y en las páginas públicas.
            </p>
            <p>
              <strong>Sobrecargo actual:</strong> S/15 por cada 1,000 visitas adicionales o 3 GB (lo que sea mayor)
            </p>
            <p>
              Los precios mostrados son parte del precio de lanzamiento y pueden cambiar en el futuro.
            </p>
          </CardContent>
        </Card>
    </div>
  );
};

export default PlanManagement;
