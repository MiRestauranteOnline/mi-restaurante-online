import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Store, UtensilsCrossed, Star, Users, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientContext {
  selectedClientId: string;
  selectedClient: any;
}

interface Stats {
  menuItems: number;
  menuCategories: number;
  reviews: number;
  teamMembers: number;
}

export default function ClientDashboard() {
  const { selectedClientId, selectedClient } = useOutletContext<ClientContext>();
  const [stats, setStats] = useState<Stats>({ menuItems: 0, menuCategories: 0, reviews: 0, teamMembers: 0 });
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (selectedClientId) {
      fetchStats();
    }
  }, [selectedClientId]);

  const fetchStats = async () => {
    try {
      const [menuItemsResult, categoriesResult, reviewsResult, teamResult] = await Promise.all([
        supabase.from('menu_items').select('id', { count: 'exact' }).eq('client_id', selectedClientId),
        supabase.from('menu_categories').select('id', { count: 'exact' }).eq('client_id', selectedClientId),
        supabase.from('reviews').select('id', { count: 'exact' }).eq('client_id', selectedClientId),
        supabase.from('team_members').select('id', { count: 'exact' }).eq('client_id', selectedClientId)
      ]);

      setStats({
        menuItems: menuItemsResult.count || 0,
        menuCategories: categoriesResult.count || 0,
        reviews: reviewsResult.count || 0,
        teamMembers: teamResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de Control</h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de gestión de {selectedClient?.restaurant_name}
          </p>
        </div>
        {selectedClient && (
          <Button
            onClick={() => window.open(`https://${selectedClient.subdomain}.mirestaurante.com`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Sitio Web
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menuCategories}</div>
            <p className="text-xs text-muted-foreground">
              categorías de menú
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elementos del Menú</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menuItems}</div>
            <p className="text-xs text-muted-foreground">
              platos en el menú
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reseñas</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviews}</div>
            <p className="text-xs text-muted-foreground">
              testimonios de clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              miembros del equipo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gestionar Menú</CardTitle>
            <CardDescription>
              Añade, edita o elimina elementos del menú
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => window.location.href = '/client/menu-categories'}>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Gestionar Categorías
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/client/menu-items'}>
                <Store className="h-4 w-4 mr-2" />
                Gestionar Elementos
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contenido</CardTitle>
            <CardDescription>
              Gestiona reseñas y equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => window.location.href = '/client/reviews'}>
                <Star className="h-4 w-4 mr-2" />
                Gestionar Reseñas
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/client/team-members'}>
                <Users className="h-4 w-4 mr-2" />
                Gestionar Equipo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuración</CardTitle>
            <CardDescription>
              Personaliza tu sitio web
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => window.location.href = '/client/settings'}>
                <Settings className="h-4 w-4 mr-2" />
                Configuración General
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/client/subscription'}>
                <Badge className="h-4 w-4 mr-2" />
                Gestionar Suscripción
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Website Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sitio Web</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Activo</Badge>
              <span className="text-sm text-muted-foreground">
                Tu sitio web está en línea y funcionando correctamente
              </span>
            </div>
            {selectedClient && (
              <Button
                variant="outline"
                onClick={() => window.open(`https://${selectedClient.subdomain}.mirestaurante.com`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visitar Sitio
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}