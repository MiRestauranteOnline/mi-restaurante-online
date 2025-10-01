import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ClientDiscount {
  id: string;
  name: string;
  discount_type: string;
  percentage: number;
}

interface DiscountAssignment {
  id: string;
  discount_id: string;
  is_active: boolean;
  applied_at: string | null;
}

interface Props {
  clientId: string;
}

export const ClientDiscountAssignments = ({ clientId }: Props) => {
  const [discounts, setDiscounts] = useState<ClientDiscount[]>([]);
  const [assignments, setAssignments] = useState<Map<string, DiscountAssignment>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    try {
      // Check if client has an active subscription
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('mercadopago_subscription_id, subscription_status')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // Check if subscription is active (regardless of whether it's auto-recurring or manual)
      const hasSubscription = clientData?.subscription_status === 'active';
      setHasActiveSubscription(hasSubscription);

      // Fetch all active client discounts
      const { data: discountsData, error: discountsError } = await supabase
        .from('client_discounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (discountsError) throw discountsError;

      // Fetch assignments for this client
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('client_discount_assignments')
        .select('*')
        .eq('client_id', clientId);

      if (assignmentsError) throw assignmentsError;

      setDiscounts(discountsData || []);

      // Create a map of discount_id -> assignment
      const assignmentsMap = new Map();
      assignmentsData?.forEach(assignment => {
        assignmentsMap.set(assignment.discount_id, assignment);
      });
      setAssignments(assignmentsMap);
    } catch (error) {
      console.error('Error fetching discount data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los descuentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignment = async (discountId: string, currentValue: boolean) => {
    try {
      const assignment = assignments.get(discountId);
      const discount = discounts.find(d => d.id === discountId);
      
      if (!discount) return;

      if (assignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('client_discount_assignments')
          .update({ 
            is_active: !currentValue,
            applied_at: !currentValue ? new Date().toISOString() : assignment.applied_at
          })
          .eq('id', assignment.id);

        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('client_discount_assignments')
          .insert({
            client_id: clientId,
            discount_id: discountId,
            is_active: true,
            applied_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update MercadoPago subscription price
      const discountPercentage = !currentValue ? discount.percentage : 0;
      const months = discount.discount_type === 'one_time' ? 1 : undefined;

      const { data: updateResult, error: updateError } = await supabase.functions.invoke(
        'update-client-subscription-price',
        {
          body: {
            clientId,
            discountPercentage,
            months,
          },
        }
      );

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update subscription price');
      }

      console.log('Subscription price updated:', updateResult);

      toast({
        title: "Descuento actualizado",
        description: !currentValue
          ? `Descuento del ${discount.percentage}% aplicado. Precio actualizado en MercadoPago.`
          : `Descuento removido. Precio revertido al original.`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error toggling assignment:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el descuento",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Descuentos del Cliente</CardTitle>
          <CardDescription>No hay descuentos disponibles para asignar</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Descuentos del Cliente</CardTitle>
        <CardDescription>Gestiona los descuentos aplicables a este cliente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasActiveSubscription && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Este cliente aún no tiene una suscripción activa en MercadoPago. 
              Los descuentos solo pueden aplicarse después de que el cliente complete el pago inicial y 
              la suscripción esté activa.
            </p>
          </div>
        )}
        {discounts.map((discount) => {
          const assignment = assignments.get(discount.id);
          const isActive = assignment?.is_active || false;
          const appliedAt = assignment?.applied_at;

          return (
            <div key={discount.id} className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`discount-${discount.id}`} className="text-base font-medium">
                      {discount.name}
                    </Label>
                    <Badge variant={discount.discount_type === 'one_time' ? 'default' : 'secondary'}>
                      {discount.discount_type === 'one_time' ? 'Una Vez' : 'Recurrente'}
                    </Badge>
                    <Badge variant="outline">{discount.percentage}%</Badge>
                  </div>
                </div>
                <Switch
                  id={`discount-${discount.id}`}
                  checked={isActive}
                  onCheckedChange={() => toggleAssignment(discount.id, isActive)}
                  disabled={!hasActiveSubscription}
                />
              </div>
              {appliedAt && (
                <p className="text-sm text-muted-foreground">
                  Descuento aplicado el {format(new Date(appliedAt), 'dd/MM/yyyy HH:mm')}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
