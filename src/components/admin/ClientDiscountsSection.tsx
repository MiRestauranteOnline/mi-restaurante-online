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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ClientDiscount {
  id: string;
  name: string;
  discount_type: string;
  percentage: number;
  is_active: boolean;
  created_at: string;
}

export const ClientDiscountsSection = () => {
  const [discounts, setDiscounts] = useState<ClientDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const [newDiscount, setNewDiscount] = useState({
    name: "",
    discount_type: "one_time",
    percentage: "",
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('client_discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error('Error fetching client discounts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los descuentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDiscount = async () => {
    if (!newDiscount.name || !newDiscount.percentage) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase.from('client_discounts').insert({
        name: newDiscount.name,
        discount_type: newDiscount.discount_type,
        percentage: parseFloat(newDiscount.percentage),
      });

      if (error) throw error;

      toast({
        title: "Descuento creado",
        description: "El descuento se ha creado exitosamente",
      });

      setNewDiscount({
        name: "",
        discount_type: "one_time",
        percentage: "",
      });

      fetchDiscounts();
    } catch (error: any) {
      console.error('Error creating discount:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el descuento",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleDiscountStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('client_discounts')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Descuento actualizado",
        description: `El descuento ha sido ${!currentStatus ? 'activado' : 'desactivado'}`,
      });

      fetchDiscounts();
    } catch (error) {
      console.error('Error toggling discount:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el descuento",
        variant: "destructive",
      });
    }
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este descuento?')) return;

    try {
      const { error } = await supabase
        .from('client_discounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Descuento eliminado",
        description: "El descuento se ha eliminado exitosamente",
      });

      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el descuento",
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
          <CardTitle>Crear Descuento para Clientes</CardTitle>
          <CardDescription>Crea descuentos que se pueden asignar a clientes específicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="discount-name">Nombre del Descuento</Label>
              <Input
                id="discount-name"
                placeholder="Reseña en Google"
                value={newDiscount.name}
                onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="discount-type">Tipo</Label>
              <Select
                value={newDiscount.discount_type}
                onValueChange={(value) => setNewDiscount({ ...newDiscount, discount_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">Una Vez</SelectItem>
                  <SelectItem value="recurring">Recurrente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount-percentage">Porcentaje (%)</Label>
              <Input
                id="discount-percentage"
                type="number"
                placeholder="25"
                value={newDiscount.percentage}
                onChange={(e) => setNewDiscount({ ...newDiscount, percentage: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={createDiscount} disabled={creating}>
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Crear Descuento
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descuentos de Clientes Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Porcentaje</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.name}</TableCell>
                  <TableCell>
                    <Badge variant={discount.discount_type === 'one_time' ? 'default' : 'secondary'}>
                      {discount.discount_type === 'one_time' ? 'Una Vez' : 'Recurrente'}
                    </Badge>
                  </TableCell>
                  <TableCell>{discount.percentage}%</TableCell>
                  <TableCell>
                    {format(new Date(discount.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={discount.is_active ? 'default' : 'secondary'}>
                      {discount.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleDiscountStatus(discount.id, discount.is_active)}
                      >
                        {discount.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDiscount(discount.id)}
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
