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
  Star,
  Images,
  TrendingUp,
  MessageSquare,
  Tag,
  Globe,
  BarChart3,
  Receipt,
  Monitor,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
}

interface UserClient {
  client_id: string;
  clients: Client;
}

export default function AdminDashboardLayout() {
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<UserClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      
      const userIsAdmin = !!roleData;
      setIsAdmin(userIsAdmin);
      
      // If not admin, redirect to client dashboard
      if (!userIsAdmin) {
        navigate('/client', { replace: true });
        return;
      }
      
      // Fetch user's accessible restaurants for admin
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
        console.error('Error loading clients:', error);
      } else {
        setClients(userClients || []);
        if (userClients && userClients.length > 0) {
          setSelectedClientId(userClients[0].client_id);
        }
      }
      
      setLoading(false);
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

  const mainSidebarItems = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/client-management', label: t('clientManagement'), icon: Users },
    { href: '/admin/project-config', label: t('projectConfig'), icon: Settings },
    { href: '/admin/subscription-management', label: t('subscriptions'), icon: CreditCard },
  ];

  const adminSidebarItems = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/client-management', label: t('clientManagement'), icon: Users },
    { href: '/admin/custom-domains', label: 'Custom Domains', icon: Globe },
    { href: '/admin/usage', label: 'Usage Monitoring', icon: BarChart3 },
    { href: '/admin/billing', label: 'Billing & Invoices', icon: Receipt },
    { href: '/admin/monitoring', label: 'Admin Monitoring', icon: Monitor, adminOnly: true },
    { href: '/admin/tickets', label: 'Tickets de Soporte', icon: MessageSquare },
    { href: '/admin/marketing-analytics', label: 'Marketing Analytics', icon: TrendingUp },
    { href: '/admin/templates-management', label: 'Plantillas', icon: LayoutDashboard },
    { href: '/admin/project-config', label: t('projectConfig'), icon: Settings },
    { href: '/admin/subscription-management', label: t('subscriptions'), icon: CreditCard },
    { href: '/admin/coupon-management', label: 'Cupones', icon: Tag },
    { href: '/admin/plan-management', label: 'Planes', icon: Store },
    { href: '/admin/data-copy', label: 'Copiar Datos', icon: Copy },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Unauthorized</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={cn(
          "bg-card border-r transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex flex-col">
                  <h2 className="font-semibold text-sm">Admin Panel</h2>
                  <p className="text-xs text-muted-foreground">
                    Global Admin View
                  </p>
                </div>
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


          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {adminSidebarItems
                .filter((item: any) => !item.adminOnly || isAdmin)
                .map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">
                  Admin Dashboard
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                
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
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet context={{ selectedClientId, selectedClient, setSelectedClientId }} />
          </main>
        </div>
      </div>
    </div>
  );
}