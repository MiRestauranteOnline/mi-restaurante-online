import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, UtensilsCrossed, Users, Settings, Eye, Calendar } from 'lucide-react';

interface DashboardContext {
  selectedClientId: string;
  selectedClient: {
    id: string;
    restaurant_name: string;
    subdomain: string;
  };
}

interface Stats {
  totalMenuItems: number;
  activeMenuItems: number;
  totalCategories: number;
  activeCategories: number;
  homepageItems: number;
}

export default function Dashboard() {
  const { selectedClientId, selectedClient } = useOutletContext<DashboardContext>();
  const [stats, setStats] = useState<Stats>({
    totalMenuItems: 0,
    activeMenuItems: 0,
    totalCategories: 0,
    activeCategories: 0,
    homepageItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedClientId) return;

      setLoading(true);
      try {
        // Fetch menu items stats
        const { data: menuItems } = await (supabase as any)
          .from('menu_items')
          .select('is_active, show_on_homepage')
          .eq('client_id', selectedClientId);

        // Fetch categories stats  
        const { data: categories } = await (supabase as any)
          .from('menu_categories')
          .select('is_active')
          .eq('client_id', selectedClientId);

        const menuItemsData = menuItems || [];
        const categoriesData = categories || [];

        setStats({
          totalMenuItems: menuItemsData.length,
          activeMenuItems: menuItemsData.filter(item => item.is_active).length,
          totalCategories: categoriesData.length,
          activeCategories: categoriesData.filter(cat => cat.is_active).length,
          homepageItems: menuItemsData.filter(item => item.show_on_homepage).length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedClientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenido al panel de administración de tu restaurante
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="w-20 h-4 bg-muted animate-pulse rounded"></div>
                <div className="w-4 h-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="w-8 h-8 bg-muted animate-pulse rounded mb-2"></div>
                <div className="w-16 h-3 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al panel de administración de {selectedClient?.restaurant_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elementos del Menú</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMenuItems}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalMenuItems} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCategories}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalCategories} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Página de Inicio</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.homepageItems}</div>
            <p className="text-xs text-muted-foreground">
              máximo 8 elementos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitio Web</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Activo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedClient?.subdomain}.mirestaurante.com
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-primary" />
              Configurar Restaurante
            </CardTitle>
            <CardDescription>
              Actualiza información básica, horarios y datos de contacto
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Gestionar Categorías
            </CardTitle>
            <CardDescription>
              Organiza y reordena las categorías de tu menú
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Administrar Menú
            </CardTitle>
            <CardDescription>
              Agrega, edita o elimina elementos de tu menú
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividad reciente</p>
            <p className="text-sm">Los cambios en tu restaurante aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}