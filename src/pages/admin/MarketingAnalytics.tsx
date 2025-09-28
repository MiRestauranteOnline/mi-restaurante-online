import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Target, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralData {
  source: string;
  count: number;
  percentage: number;
}

const COLORS = [
  '#FFD700', // Primary gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light yellow
  '#BB8FCE'  // Light purple
];

const SOURCE_LABELS: Record<string, string> = {
  'google': 'Google',
  'tiktok': 'TikTok',
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'advertisement': 'Publicidad Online',
  'flyers': 'Volantes',
  'recommendations': 'Recomendación de amigos',
  'youtube': 'YouTube',
  'radio': 'Radio',
  'other': 'Otro'
};

const MarketingAnalytics = () => {
  const [referralData, setReferralData] = useState<ReferralData[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Fetch all clients with referral source data
      const { data, error } = await supabase
        .from('clients')
        .select('referral_source')
        .not('referral_source', 'is', null);

      if (error) {
        console.error('Error fetching referral data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de marketing",
          variant: "destructive",
        });
        return;
      }

      // Count referrals by source
      const sourceCounts: Record<string, number> = {};
      const total = data?.length || 0;
      
      data?.forEach(client => {
        if (client.referral_source) {
          sourceCounts[client.referral_source] = (sourceCounts[client.referral_source] || 0) + 1;
        }
      });

      // Convert to chart format
      const chartData = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source: SOURCE_LABELS[source] || source,
          count,
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      setReferralData(chartData);
      setTotalClients(total);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCustomizedLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.source}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} clientes ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Marketing Analytics</h1>
            <p className="text-muted-foreground">
              Análisis de fuentes de referencia de clientes
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const topSource = referralData[0];
  const averagePerSource = totalClients > 0 ? Math.round(totalClients / referralData.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Analytics</h1>
          <p className="text-muted-foreground">
            Análisis de fuentes de referencia de clientes
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Con datos de referencia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuente Principal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topSource?.source || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {topSource?.count || 0} clientes ({topSource?.percentage || 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuentes Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralData.length}</div>
            <p className="text-xs text-muted-foreground">
              Canales diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Fuente</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePerSource}</div>
            <p className="text-xs text-muted-foreground">
              Clientes por canal
            </p>
          </CardContent>
        </Card>
      </div>

      {totalClients === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
              <p className="text-sm">
                Los datos de marketing aparecerán aquí cuando los clientes completen el registro 
                con información sobre cómo nos encontraron.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Fuente</CardTitle>
              <CardDescription>
                Porcentaje de clientes por canal de referencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={referralData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {referralData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Clientes por Fuente</CardTitle>
              <CardDescription>
                Número absoluto de clientes por canal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={referralData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="source" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#FFD700" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Table */}
      {referralData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle por Fuente</CardTitle>
            <CardDescription>
              Información detallada de cada canal de referencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Fuente</th>
                    <th className="text-right p-2 font-medium">Clientes</th>
                    <th className="text-right p-2 font-medium">Porcentaje</th>
                    <th className="text-right p-2 font-medium">Efectividad</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.map((item, index) => (
                    <tr key={item.source} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {item.source}
                        </div>
                      </td>
                      <td className="text-right p-2 font-medium">{item.count}</td>
                      <td className="text-right p-2">{item.percentage}%</td>
                      <td className="text-right p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.percentage >= 20 ? 'bg-green-100 text-green-800' :
                          item.percentage >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.percentage >= 20 ? 'Alta' :
                           item.percentage >= 10 ? 'Media' : 'Baja'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketingAnalytics;