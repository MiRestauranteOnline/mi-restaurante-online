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
  Shield,
  CreditCard,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DashboardLanguageSwitcher } from '@/components/DashboardLanguageSwitcher';
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

export default function DashboardLayout() {
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<UserClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { t } = useDashboardLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      
      // Check if user is admin using secure RPC
      const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });
      
      setIsAdmin(!roleError && isAdmin === true);
      
      // Fetch user's accessible restaurants
      const { data: userClients, error: clientsError } = await (supabase as any)
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

      if (clientsError) {
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

  // Redirect non-admin users to the client portal
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/client', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      // Clear signup flow state on logout
      try {
        localStorage.removeItem('signup_progress');
        localStorage.removeItem('signup_form_data');
      } catch (e) {
        console.warn('Failed to clear signup state:', e);
      }
      toast.success('Sesión cerrada');
      navigate('/');
    }
  };

  const selectedClient = clients.find(c => c.client_id === selectedClientId)?.clients;

  const mainSidebarItems = [
    { href: '/dashboard', icon: LayoutDashboard, title: t('nav.dashboard') },
    { href: '/dashboard/menu-categories', icon: UtensilsCrossed, title: t('nav.categories') },
    { href: '/dashboard/menu-items', icon: MenuIcon, title: t('nav.items') },
    { href: '/dashboard/reviews', icon: Star, title: t('nav.reviews') },
    { href: '/dashboard/team-members', icon: Users, title: t('nav.team') },
    { href: '/dashboard/restaurant-settings', icon: Settings, title: t('nav.settings') },
  ];

  const adminSidebarItems = [
    { href: '/admin/client-management', icon: Shield, title: t('admin.clientManagement') },
    { href: '/admin/subscription-management', icon: CreditCard, title: t('admin.subscriptionManagement') },
  ];

  if (!user || (!isAdmin && clients.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.loading')}</h1>
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

        {/* Admin Notice */}
        {sidebarOpen && isAdmin && clients.length === 0 && (
          <div className="p-4 border-b border-border">
            <p className="text-sm text-muted-foreground">{t('admin.panel')}</p>
          </div>
        )}

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Client items are managed in the Client Portal now */}

          {/* Admin items */}
          {isAdmin && adminSidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
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
              {selectedClient ? (
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {selectedClient.restaurant_name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.subdomain}.mirestaurante.online
                  </p>
                </div>
              ) : isAdmin ? (
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {t('admin.panel')}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Sistema de administración
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <DashboardLanguageSwitcher />

              {selectedClient && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://${selectedClient.subdomain}.mirestaurante.online`, '_blank')}
                  className="hidden sm:flex"
                >
                  <Store className="h-4 w-4 mr-2" />
                  {t('button.viewWebsite')}
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
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.logout')}</span>
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