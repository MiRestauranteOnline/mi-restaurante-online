import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Eye, Users, Check, ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
  email?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  created_at: string;
  updated_at: string;
}

interface ClientStats {
  menuItems: number;
  categories: number;
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientStats, setClientStats] = useState<Record<string, ClientStats>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientStats(selectedClientId);
    }
  }, [selectedClientId]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('restaurant_name', { ascending: true });

      if (error) throw error;
      
      setClients(data || []);
      if (data && data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load clients: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async (clientId: string) => {
    try {
      const [menuItemsResult, categoriesResult] = await Promise.all([
        supabase.from('menu_items').select('id', { count: 'exact' }).eq('client_id', clientId),
        supabase.from('menu_categories').select('id', { count: 'exact' }).eq('client_id', clientId)
      ]);

      setClientStats(prev => ({
        ...prev,
        [clientId]: {
          menuItems: menuItemsResult.count || 0,
          categories: categoriesResult.count || 0
        }
      }));
    } catch (error) {
      console.error('Error fetching client stats:', error);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const stats = selectedClientId ? clientStats[selectedClientId] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <Button 
          onClick={() => navigate('/admin/dashboard')}
          variant="outline"
        >
          Back to Admin Dashboard
        </Button>
      </div>

      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedClientId
                  ? clients.find((client) => client.id === selectedClientId)?.restaurant_name + 
                    ` (${clients.find((client) => client.id === selectedClientId)?.subdomain})`
                  : "Choose a client to manage"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search clients..." />
                <CommandList>
                  <CommandEmpty>No client found.</CommandEmpty>
                  <CommandGroup>
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={`${client.restaurant_name} ${client.subdomain}`}
                        onSelect={() => {
                          setSelectedClientId(client.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedClientId === client.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {client.restaurant_name} ({client.subdomain})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Selected Client Info */}
      {selectedClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {selectedClient.restaurant_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Subdomain</p>
                <p className="font-medium">{selectedClient.subdomain}</p>
              </div>
              {selectedClient.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedClient.email}</p>
                </div>
              )}
              {selectedClient.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
              )}
              {selectedClient.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedClient.address}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(selectedClient.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => navigate(`/admin/client-settings/${selectedClient.id}`)}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`https://${selectedClient.subdomain}.mirestaurante.online`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Client Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Menu Categories</span>
                    <span className="font-bold text-2xl">{stats.categories}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Menu Items</span>
                    <span className="font-bold text-2xl">{stats.menuItems}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {clients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No clients found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}