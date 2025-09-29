import { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
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
  CreditCard,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDashboardLanguage } from '@/contexts/DashboardLanguageContext';

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
}

interface UserClient {
  client_id: string;
  clients: Client;
}

export default function ClientDashboardLayout() {
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<UserClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useDashboardLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      
      // Fetch user's accessible restaurants (no admin check for client portal)
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

  useEffect(() => {
    if (selectedClientId) {
      if (location.pathname === '/client') {
        navigate(`/client/dashboard/${selectedClientId}`, { replace: true });
      }
    }
  }, [selectedClientId, location.pathname, navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const selectedClient = clients.find(uc => uc.client_id === selectedClientId)?.clients;

  if (!user || clients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.loading')}</h1>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { href: selectedClientId ? `/client/dashboard/${selectedClientId}` : '/client', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/client/subscription', icon: CreditCard, label: t('nav.subscription') },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "bg-card border-r transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {sidebarOpen && (
              <h2 className="text-xl font-bold">Mi Restaurante</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                !sidebarOpen && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Restaurant Selector */}
          {sidebarOpen && clients.length > 1 && (
            <div className="mb-6">
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((uc) => (
                    <SelectItem key={uc.client_id} value={uc.client_id}>
                      {uc.clients.restaurant_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted",
                  !sidebarOpen && "justify-center"
                )}
              >
                <item.icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {selectedClient && (
                <div>
                  <h1 className="text-xl font-semibold">{selectedClient.restaurant_name}</h1>
                  <p className="text-sm text-muted-foreground">{selectedClient.subdomain}.mirestaurante.com</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Website Button */}
              {selectedClient && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://${selectedClient.subdomain}.mirestaurante.com`, '_blank')}
                >
                  <Store className="h-4 w-4 mr-2" />
                  Ver Sitio Web
                </Button>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet context={{ selectedClientId, selectedClient }} />
        </main>
      </div>
    </div>
  );
}