import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Edit, Save, X } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  features: string[];
  popular?: boolean;
}

const PlanManagement = () => {
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  // Initial plans based on current homepage pricing
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "basic",
      name: "Plan Básico",
      price: 297,
      originalPrice: 500,
      discount: 41,
      popular: true,
      features: [
        "Hasta 3,000 visitas/mes (6 GB hosting)",
        "Soporte WhatsApp básico",
        "Soporte por email (respuesta en 48h)",
        "Actualizaciones auto-gestionables vía dashboard"
      ]
    },
    {
      id: "advanced",
      name: "Plan Avanzado",
      price: 497,
      originalPrice: 1000,
      discount: 50,
      popular: false,
      features: [
        "Todo lo del Plan Básico",
        "Doble capacidad: Hasta 6,000 visitas/mes (12 GB hosting)",
        "1 hora/mes soporte profesional para cambios de texto e imágenes",
        "Soporte prioritario (respuesta en 24h)",
        "Soporte WhatsApp premium con PIN único",
        "Dashboard de Analítica Básica y reportes mensuales",
        "Configuración de Google Analytics y Search Console incluida"
      ]
    }
  ]);

  const [editForm, setEditForm] = useState<Plan | null>(null);

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditForm({ ...plan });
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditForm(null);
  };

  const handleSave = () => {
    if (!editForm) return;

    setPlans(plans.map(p => p.id === editForm.id ? editForm : p));
    
    toast({
      title: "Plan actualizado",
      description: `Los cambios en ${editForm.name} se han guardado correctamente.`,
    });

    setEditingPlan(null);
    setEditForm(null);
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
                          {plan.popular && (
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
                      value={editForm?.price || 0}
                      onChange={(e) => setEditForm(editForm ? { ...editForm, price: parseFloat(e.target.value) } : null)}
                    />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">S/{plan.price}</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  )}
                </div>

                {/* Original Price & Discount */}
                {editingPlan === plan.id ? (
                  <>
                    <div className="space-y-2">
                      <Label>Precio original (S/)</Label>
                      <Input
                        type="number"
                        value={editForm?.originalPrice || 0}
                        onChange={(e) => setEditForm(editForm ? { ...editForm, originalPrice: parseFloat(e.target.value) } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descuento (%)</Label>
                      <Input
                        type="number"
                        value={editForm?.discount || 0}
                        onChange={(e) => setEditForm(editForm ? { ...editForm, discount: parseFloat(e.target.value) } : null)}
                      />
                    </div>
                  </>
                ) : (
                  plan.originalPrice && plan.discount && (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-muted-foreground">S/{plan.originalPrice}</span>
                      <Badge variant="destructive">-{plan.discount}%</Badge>
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
