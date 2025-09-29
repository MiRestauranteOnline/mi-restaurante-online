import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Clock, 
  Mouse, 
  Smartphone, 
  Eye, 
  Download,
  MessageCircle,
  Phone,
  Calendar,
  TrendingUp,
  Users,
  Crown,
  ArrowRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DailyAnalytics {
  id: string;
  client_id: string;
  date: string;
  total_page_views: number;
  unique_sessions: number;
  avg_time_on_page: number;
  bounce_rate: number;
  whatsapp_clicks: number;
  phone_clicks: number;
  menu_downloads: number;
  reservation_clicks: number;
  menu_section_data: any; // JSONB from database
  device_breakdown: any; // JSONB from database
}

interface AnalyticsOverviewProps {
  clientId: string;
}

export function AnalyticsOverview({ clientId }: AnalyticsOverviewProps) {
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days
  const [clientPlan, setClientPlan] = useState<string>('basic');
  const { toast } = useToast();

  useEffect(() => {
    if (clientId) {
      fetchAnalytics();
      fetchClientPlan();
    }
  }, [clientId, dateRange]);

  const fetchClientPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('plan_type')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      
      setClientPlan(data?.plan_type || 'basic');
    } catch (error: any) {
      console.error('Error fetching client plan:', error);
      setClientPlan('basic'); // Default to basic on error
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
      
      const { data, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('client_id', clientId)
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      
      setAnalytics(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las analíticas: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = analytics.reduce((acc, day) => ({
    page_views: acc.page_views + day.total_page_views,
    unique_sessions: acc.unique_sessions + day.unique_sessions,
    whatsapp_clicks: acc.whatsapp_clicks + day.whatsapp_clicks,
    phone_clicks: acc.phone_clicks + day.phone_clicks,
    menu_downloads: acc.menu_downloads + day.menu_downloads,
    reservation_clicks: acc.reservation_clicks + day.reservation_clicks,
  }), {
    page_views: 0,
    unique_sessions: 0,
    whatsapp_clicks: 0,
    phone_clicks: 0,
    menu_downloads: 0,
    reservation_clicks: 0,
  });

  const avgTimeOnPage = analytics.length > 0 
    ? Math.round(analytics.reduce((sum, day) => sum + day.avg_time_on_page, 0) / analytics.length)
    : 0;

  const avgBounceRate = analytics.length > 0 
    ? Math.round(analytics.reduce((sum, day) => sum + day.bounce_rate, 0) / analytics.length)
    : 0;

  // Get device breakdown
  const deviceBreakdown = analytics.reduce((acc, day) => {
    Object.entries(day.device_breakdown || {}).forEach(([device, count]) => {
      acc[device] = (acc[device] || 0) + (count as number);
    });
    return acc;
  }, {} as Record<string, number>);

  // Get popular menu sections
  const menuSections = analytics.reduce((acc, day) => {
    Object.entries(day.menu_section_data || {}).forEach(([section, data]) => {
      if (!acc[section]) {
        acc[section] = { views: 0, total_time: 0, count: 0 };
      }
      acc[section].views += (data as any).views || 0;
      acc[section].total_time += (data as any).avg_time || 0;
      acc[section].count += 1;
    });
    return acc;
  }, {} as Record<string, { views: number; total_time: number; count: number }>);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show upgrade CTA for basic users
  if (clientPlan === 'basic') {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-6 rounded-full bg-primary/10 p-6">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <h3 className="mb-4 text-2xl font-bold">Analíticas Avanzadas</h3>
          <p className="mb-6 text-muted-foreground max-w-md">
            ¿Quieres ver analíticas detalladas directamente de tu sitio web y agregar Google Analytics y Google Search Console? 
            Actualiza al plan avanzado para acceder a estas funciones.
          </p>
          <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Analíticas detalladas del sitio web
            </li>
            <li className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Integración con Google Analytics
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Google Search Console para SEO
            </li>
          </ul>
          <Button size="lg" className="gap-2">
            Actualizar a Plan Avanzado
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analíticas del Restaurante</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {analytics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay datos de analíticas disponibles para este período.
              <br />
              Los datos comenzarán a aparecer una vez que los visitantes interactúen con tu sitio web.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="engagement">Interacciones</TabsTrigger>
            <TabsTrigger value="menu">Popularidad del Menú</TabsTrigger>
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vistas de Página</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.page_views.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(totals.page_views / Math.max(analytics.length, 1))} por día en promedio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.unique_sessions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(totals.unique_sessions / Math.max(analytics.length, 1))} por día en promedio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(avgTimeOnPage)}</div>
                  <p className="text-xs text-muted-foreground">
                    Por página visitada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Rebote</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgBounceRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Visitantes que ven solo una página
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clics WhatsApp</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.whatsapp_clicks}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(totals.whatsapp_clicks / Math.max(analytics.length, 1))} por día
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Llamadas</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.phone_clicks}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(totals.phone_clicks / Math.max(analytics.length, 1))} por día
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Descargas del Menú</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.menu_downloads}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(totals.menu_downloads / Math.max(analytics.length, 1))} por día
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.reservation_clicks}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(totals.reservation_clicks / Math.max(analytics.length, 1))} por día
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Secciones Más Populares del Menú</CardTitle>
                <CardDescription>
                  Tiempo promedio que los visitantes pasan viendo cada sección
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(menuSections).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay datos de secciones del menú disponibles
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(menuSections)
                      .sort(([,a], [,b]) => b.views - a.views)
                      .map(([section, data]) => (
                        <div key={section} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{section}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.views} vistas • {formatTime(Math.round(data.total_time / Math.max(data.count, 1)))} promedio
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {Math.round((data.views / totals.page_views) * 100)}% del tráfico
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Utilizados</CardTitle>
                <CardDescription>
                  Distribución de visitantes por tipo de dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(deviceBreakdown).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay datos de dispositivos disponibles
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(deviceBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .map(([device, count]) => {
                        const percentage = Math.round((count / totals.unique_sessions) * 100);
                        return (
                          <div key={device} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <Smartphone className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium capitalize">{device}</p>
                                <p className="text-sm text-muted-foreground">{count} visitantes</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{percentage}%</Badge>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}