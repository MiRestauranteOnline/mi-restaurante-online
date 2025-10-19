import { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  Star,
  BarChart3,
  Shield,
  Calendar,
  ShieldAlert,
  X,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardLanguage } from '@/contexts/DashboardLanguageContext';
import { useAdminImpersonation } from '@/hooks/useAdminImpersonation';
import { useIsMobile } from '@/hooks/use-mobile';

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
  plan_type: string;
  email: string;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: toastHook } = useToast();
  const { t } = useDashboardLanguage();
  const { isImpersonating, impersonatedClientId, endImpersonation } = useAdminImpersonation();
  const isMobile = useIsMobile();

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
            subdomain,
            plan_type,
            email
          )
        `)
        .eq('user_id', session.user.id);

      if (error) {
        toastHook({ title: "Error", description: 'Error al cargar restaurantes', variant: "destructive" });
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
      toastHook({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSwitchBack = () => {
    endImpersonation();
    navigate('/admin');
    toastHook({ title: "Switched back to admin", description: "You are now viewing as admin" });
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
    { href: `/client/reservations/${selectedClientId}`, icon: Calendar, label: t('nav.reservations') },
    { href: `/client/analytics/${selectedClientId}`, icon: BarChart3, label: 'Analíticas' },
    { href: `/client/support/${selectedClientId}`, icon: Shield, label: 'Soporte' },
    { href: '/client/subscription', icon: CreditCard, label: t('nav.subscription') },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        {(sidebarOpen || isMobile) && (
          <h2 className="text-xl font-bold">Mi Restaurante</h2>
        )}
        {!isMobile && (
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
        )}
      </div>

      {/* Restaurant Selector */}
      {(sidebarOpen || isMobile) && clients.length > 1 && (
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
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted",
              !sidebarOpen && !isMobile && "justify-center"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {(sidebarOpen || isMobile) && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
        
        {/* External Guides Link */}
        <a
          href="/guias/primeros-pasos/introduccion"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
        >
          <BookOpen className="h-4 w-4 flex-shrink-0" />
          {(sidebarOpen || isMobile) && <span className="ml-3">Guías</span>}
        </a>
      </nav>
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Admin Impersonation Banner */}
      {isImpersonating && impersonatedClientId === selectedClientId && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-warning/10">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-sm">You are viewing this account as an admin</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchBack}
            >
              Switch Back to Admin
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 h-full overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className={cn(
            "bg-card border-r transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-16"
          )}>
            <div className="p-4">
              <SidebarContent />
            </div>
          </aside>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-64 p-4">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        )}
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(true)}
                  className="mr-2"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              )}

              <div className="flex-1 min-w-0">
                {selectedClient && (
                  <div>
                    <h1 className="text-base sm:text-xl font-semibold truncate">
                      {selectedClient.restaurant_name}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {selectedClient.subdomain}.mirestaurante.online
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* View Website Button - Hidden on mobile */}
                {selectedClient && !isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://${selectedClient.subdomain}.mirestaurante.online`, '_blank')}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Ver Sitio Web
                  </Button>
                )}

                {/* View Website Button - Icon only on mobile */}
                {selectedClient && isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://${selectedClient.subdomain}.mirestaurante.online`, '_blank')}
                  >
                    <Store className="h-4 w-4" />
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
                      {t('button.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <Outlet context={{ selectedClientId, selectedClient }} />
          </main>
        </div>
      </div>
    </div>
  );
}