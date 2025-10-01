import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  uses_count: number;
  applicable_plans: string[];
  is_active: boolean;
}

export const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    valid_until: "",
    max_uses: "",
    applicable_plans: ["basic", "advanced"],
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cupones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase.from('coupons').insert({
        code: newCoupon.code.toUpperCase(),
        discount_type: newCoupon.discount_type,
        discount_value: parseFloat(newCoupon.discount_value),
        valid_until: newCoupon.valid_until || null,
        max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
        applicable_plans: newCoupon.applicable_plans,
      });

      if (error) throw error;

      toast({
        title: "Cupón creado",
        description: "El cupón se ha creado exitosamente",
      });

      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        valid_until: "",
        max_uses: "",
        applicable_plans: ["basic", "advanced"],
      });

      fetchCoupons();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el cupón",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Cupón actualizado",
        description: `El cupón ha sido ${!currentStatus ? 'activado' : 'desactivado'}`,
      });

      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cupón",
        variant: "destructive",
      });
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Cupón eliminado",
        description: "El cupón se ha eliminado exitosamente",
      });

      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cupón",
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nuevo Cupón</CardTitle>
          <CardDescription>Crea cupones de descuento para tus clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                placeholder="PROMO2024"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="uppercase"
              />
            </div>

            <div>
              <Label htmlFor="discount_type">Tipo de Descuento</Label>
              <Select
                value={newCoupon.discount_type}
                onValueChange={(value) => setNewCoupon({ ...newCoupon, discount_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed">Monto Fijo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount_value">
                Valor {newCoupon.discount_type === 'percentage' ? '(%)' : '(S/)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                placeholder={newCoupon.discount_type === 'percentage' ? '10' : '50'}
                value={newCoupon.discount_value}
                onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="valid_until">Válido Hasta (Opcional)</Label>
              <Input
                id="valid_until"
                type="date"
                value={newCoupon.valid_until}
                onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="max_uses">Usos Máximos (Opcional)</Label>
              <Input
                id="max_uses"
                type="number"
                placeholder="Sin límite"
                value={newCoupon.max_uses}
                onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Planes Aplicables</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="basic"
                  checked={newCoupon.applicable_plans.includes('basic')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNewCoupon({ ...newCoupon, applicable_plans: [...newCoupon.applicable_plans, 'basic'] });
                    } else {
                      setNewCoupon({ ...newCoupon, applicable_plans: newCoupon.applicable_plans.filter(p => p !== 'basic') });
                    }
                  }}
                />
                <label htmlFor="basic">Plan Básico</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="advanced"
                  checked={newCoupon.applicable_plans.includes('advanced')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNewCoupon({ ...newCoupon, applicable_plans: [...newCoupon.applicable_plans, 'advanced'] });
                    } else {
                      setNewCoupon({ ...newCoupon, applicable_plans: newCoupon.applicable_plans.filter(p => p !== 'advanced') });
                    }
                  }}
                />
                <label htmlFor="advanced">Plan Avanzado</label>
              </div>
            </div>
          </div>

          <Button onClick={createCoupon} disabled={creating}>
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Crear Cupón
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cupones Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Válido Hasta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%`
                      : `S/${coupon.discount_value}`
                    }
                  </TableCell>
                  <TableCell>
                    {coupon.uses_count} / {coupon.max_uses || '∞'}
                  </TableCell>
                  <TableCell>
                    {coupon.valid_until 
                      ? format(new Date(coupon.valid_until), 'dd/MM/yyyy')
                      : 'Sin límite'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                      {coupon.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                      >
                        {coupon.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
