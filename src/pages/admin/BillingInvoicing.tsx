import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Receipt, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
}

interface BillingRecord {
  id: string;
  month: string;
  total_visits: number;
  total_bandwidth_gb: number;
  overage_visits: number;
  overage_bandwidth_gb: number;
  overage_charge: number;
  billing_date: string;
  billed: boolean;
}

export default function BillingInvoicing() {
  const { selectedClientId, selectedClient } = useOutletContext<{
    selectedClientId: string;
    selectedClient: Client;
  }>();

  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchBillingRecords();
  }, [selectedClientId, selectedYear]);

  const fetchBillingRecords = async () => {
    if (!selectedClientId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('client_monthly_usage')
        .select('id, client_id, month, total_visits, total_bandwidth_gb, overage_visits, overage_bandwidth_gb, overage_charge, billing_date, billed')
        .eq('client_id', selectedClientId)
        .eq('billed', true)
        .gte('month', `${selectedYear}-01-01`)
        .lte('month', `${selectedYear}-12-31`)
        .order('month', { ascending: false });

      if (error) throw error;
      setBillingRecords(data || []);
    } catch (error) {
      console.error('Error fetching billing records:', error);
      toast.error('Error al cargar historial de facturación');
    } finally {
      setLoading(false);
    }
  };

  const getTotalBilledThisYear = () => {
    return billingRecords.reduce((sum, record) => sum + (record.overage_charge || 0), 0);
  };

  const getAverageMonthlyOverage = () => {
    if (billingRecords.length === 0) return 0;
    const total = getTotalBilledThisYear();
    return total / billingRecords.length;
  };

  const getLastPaymentDate = () => {
    if (billingRecords.length === 0) return 'N/A';
    const lastRecord = billingRecords[0];
    return new Date(lastRecord.billing_date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const handleDownloadInvoice = (recordId: string) => {
    toast.info('Descarga de facturas próximamente disponible');
  };

  const availableYears = Array.from(
    new Set(billingRecords.map(r => new Date(r.month).getFullYear()))
  ).sort((a, b) => b - a);

  if (availableYears.length === 0 && !loading) {
    availableYears.push(new Date().getFullYear());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Cargando historial de facturación...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación e Invoices</h1>
          <p className="text-muted-foreground mt-1">
            {selectedClient?.restaurant_name}
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado {selectedYear}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/{getTotalBilledThisYear().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total en cargos por excedente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/{getAverageMonthlyOverage().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Cargo promedio por mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Pago</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sm">{getLastPaymentDate()}</div>
            <p className="text-xs text-muted-foreground">
              Fecha de última facturación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturación</CardTitle>
          <CardDescription>
            Visualiza tu historial completo de pagos y cargos por excedente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingRecords.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay historial de facturación</h3>
              <p className="text-muted-foreground mb-4">
                Tu uso está dentro de los límites. Los cargos por excedente aparecerán aquí cuando corresponda.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead className="text-right">Total Visitas</TableHead>
                    <TableHead className="text-right">Total Bandwidth</TableHead>
                    <TableHead className="text-right">Cargo por Excedente</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{formatMonth(record.month)}</TableCell>
                      <TableCell className="text-right">{record.total_visits.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{record.total_bandwidth_gb.toFixed(2)} GB</TableCell>
                      <TableCell className="text-right font-semibold">
                        {record.overage_charge > 0 ? (
                          <span className="text-destructive">S/{record.overage_charge.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">S/0.00</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={record.billed ? "default" : "secondary"} className="bg-green-500">
                          Pagado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(record.id)}
                          disabled
                          title="Descarga de facturas próximamente"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
