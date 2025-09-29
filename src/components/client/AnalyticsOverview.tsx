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
  }), {
    page_views: 0,
    unique_sessions: 0,
    whatsapp_clicks: 0,
    phone_clicks: 0,
    menu_downloads: 0,
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
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vistas de Página</CardTitle>
                <div className="p-2 bg-primary/10 rounded-md">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totals.page_views.toLocaleString()}</div>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {Math.round(totals.page_views / Math.max(analytics.length, 1))} promedio diario
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Visitantes Únicos</CardTitle>
                <div className="p-2 bg-amber-600/10 rounded-md">
                  <Users className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{totals.unique_sessions.toLocaleString()}</div>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {Math.round(totals.unique_sessions / Math.max(analytics.length, 1))} promedio diario
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tiempo Promedio</CardTitle>
                <div className="p-2 bg-orange-600/10 rounded-md">
                  <Clock className="h-4 w-4 text-orange-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{formatTime(avgTimeOnPage)}</div>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((avgTimeOnPage / 300) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {Math.round((avgTimeOnPage / 300) * 100)}%
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-stone-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Rebote</CardTitle>
                <div className="p-2 bg-stone-600/10 rounded-md">
                  <Mouse className="h-4 w-4 text-stone-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stone-700">{avgBounceRate}%</div>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-stone-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${avgBounceRate}%` }}
                    ></div>
                  </div>
                  {avgBounceRate < 40 ? 'Excelente' : avgBounceRate < 60 ? 'Bueno' : 'Mejorable'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interaction Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-primary to-amber-600 rounded-md">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Interacciones de Usuarios
              </CardTitle>
              <CardDescription>Acciones importantes que los visitantes realizan en tu sitio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-700" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </div>
                    <span className="text-lg font-bold text-green-700">{totals.whatsapp_clicks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-600 to-green-700 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((totals.whatsapp_clicks / Math.max(totals.whatsapp_clicks, totals.phone_clicks, totals.menu_downloads, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{Math.round(totals.whatsapp_clicks / Math.max(analytics.length, 1))} por día</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-700" />
                      <span className="text-sm font-medium">Llamadas</span>
                    </div>
                    <span className="text-lg font-bold text-amber-700">{totals.phone_clicks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-amber-600 to-amber-700 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((totals.phone_clicks / Math.max(totals.whatsapp_clicks, totals.phone_clicks, totals.menu_downloads, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{Math.round(totals.phone_clicks / Math.max(analytics.length, 1))} por día</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-orange-700" />
                      <span className="text-sm font-medium">Descargas</span>
                    </div>
                    <span className="text-lg font-bold text-orange-700">{totals.menu_downloads}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-600 to-orange-700 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((totals.menu_downloads / Math.max(totals.whatsapp_clicks, totals.phone_clicks, totals.menu_downloads, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{Math.round(totals.menu_downloads / Math.max(analytics.length, 1))} por día</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-stone-600 to-stone-700 rounded-md">
                    <Smartphone className="h-4 w-4 text-white" />
                  </div>
                  Dispositivos Utilizados
                </CardTitle>
                <CardDescription>Distribución de visitantes por tipo de dispositivo</CardDescription>
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
                      .map(([device, count], index) => {
                        const percentage = Math.round((count / totals.unique_sessions) * 100);
                        const colors = ['from-primary to-amber-600', 'from-amber-600 to-orange-600', 'from-orange-600 to-stone-600'];
                        const iconColors = ['text-primary', 'text-amber-700', 'text-orange-700'];
                        return (
                          <div key={device} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Smartphone className={`h-4 w-4 ${iconColors[index % 3]}`} />
                                <span className="text-sm font-medium capitalize">{device}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold">{percentage}%</span>
                                <p className="text-xs text-muted-foreground">{count} visitantes</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`bg-gradient-to-r ${colors[index % 3]} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-md">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  Popularidad del Menú
                </CardTitle>
                <CardDescription>Secciones más vistas y tiempo promedio</CardDescription>
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
                      .slice(0, 4)
                      .map(([section, data], index) => {
                        const percentage = Math.round((data.views / totals.page_views) * 100);
                        const colors = ['from-primary to-amber-600', 'from-amber-600 to-orange-600', 'from-orange-600 to-stone-600', 'from-stone-600 to-primary'];
                        return (
                          <div key={section} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{section}</span>
                              <div className="text-right">
                                <span className="text-lg font-bold">{percentage}%</span>
                                <p className="text-xs text-muted-foreground">{data.views} vistas</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`bg-gradient-to-r ${colors[index]} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(Math.round(data.total_time / Math.max(data.count, 1)))} tiempo promedio
                            </p>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}