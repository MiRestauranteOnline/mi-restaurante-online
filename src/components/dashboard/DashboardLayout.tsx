import { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Settings, 
  Menu as MenuIcon, 
  Users, 
  Store,
  LogOut,
  ChevronLeft,
  LayoutDashboard,
  UtensilsCrossed,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
}

interface UserClient {
  client_id: string;
  clients: Client;
}

export default function DashboardLayout() {
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<UserClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!roleData);
      
      // Fetch user's accessible restaurants
      const { data: userClients, error } = await (supabase as any)
        .from('user_clients')
        .select(`
          client_id,
          clients (
            id,
            restaurant_name,
            subdomain
          )
        `)
        .eq('user_id', session.user.id);

      if (error) {
        toast.error('Error al cargar restaurantes');
        return;
      }

      setClients(userClients || []);
      if (userClients && userClients.length > 0) {
        setSelectedClientId(userClients[0].client_id);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada');
      navigate('/');
    }
  };

  const selectedClient = clients.find(c => c.client_id === selectedClientId)?.clients;

  const sidebarItems = [
    ...(isAdmin ? [{
      title: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: Shield,
    }] : []),
    {
      title: 'Configuración del Restaurante',
      href: '/dashboard/settings',
      icon: Settings,
    },
    {
      title: 'Categorías del Menú',
      href: '/dashboard/categories',
      icon: Users,
    },
    {
      title: 'Elementos del Menú',
      href: '/dashboard/menu-items',
      icon: UtensilsCrossed,
    },
  ];

  if (!user || clients.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-lg font-semibold text-foreground">Mi Restaurante</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Restaurant Selector */}
        {sidebarOpen && clients.length > 1 && (
          <div className="p-4 border-b border-border">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar restaurante" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.client_id} value={client.client_id}>
                    {client.clients.restaurant_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedClient && (
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {selectedClient.restaurant_name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.subdomain}.mirestaurante.com
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {selectedClient && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://${selectedClient.subdomain}.mirestaurante.com`, '_blank')}
                  className="hidden sm:flex"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Ver Sitio Web
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet context={{ selectedClientId, selectedClient }} />
        </main>
      </div>
    </div>
  );
}