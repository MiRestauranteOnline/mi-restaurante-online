import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, CreditCard, Users, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
  email?: string;
}

interface Subscription {
  id: string;
  client_id: string;
  plan: 'basic' | 'advanced';
  status: 'active' | 'cancelled' | 'expired';
  next_billing: string;
  amount: number;
  currency: string;
}

export default function SubscriptionManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, restaurant_name, subdomain, email')
        .order('restaurant_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error loading clients: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (clientId: string) => {
    // In real implementation, call Rebill API to cancel subscription
    toast({
      title: "Subscription Cancelled",
      description: "The subscription has been cancelled successfully.",
    });
  };

  const handleUpgradeDowngrade = async (clientId: string, newPlan: 'basic' | 'advanced') => {
    // In real implementation, call Rebill API to change plan
    toast({
      title: "Plan Updated",
      description: `Plan has been updated to ${newPlan}.`,
    });
  };

  const filteredClients = clients.filter(client =>
    client.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock subscription data - in real implementation, fetch from Rebill API
  const mockSubscriptions: Record<string, Subscription> = {};
  clients.forEach(client => {
    mockSubscriptions[client.id] = {
      id: `sub_${client.id}`,
      client_id: client.id,
      plan: Math.random() > 0.5 ? 'basic' : 'advanced',
      status: 'active',
      next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: Math.random() > 0.5 ? 297 : 497,
      currency: 'PEN'
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'cancelled': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.subscriptionManagement')}</h1>
          <p className="text-muted-foreground">
            Manage client subscriptions and billing
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
                <p className="text-xs text-muted-foreground">
                  active subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  S/ {Object.values(mockSubscriptions).reduce((sum, sub) => sum + sub.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  per month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Basic vs Advanced</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(mockSubscriptions).filter(s => s.plan === 'basic').length} / {Object.values(mockSubscriptions).filter(s => s.plan === 'advanced').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  basic / advanced
                </p>
              </CardContent>
            </Card>
          </div>

          {/* All Clients Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Client Subscriptions</CardTitle>
              <CardDescription>Overview of all client subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => {
                  const subscription = mockSubscriptions[client.id];
                  return (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{client.restaurant_name}</p>
                          <p className="text-sm text-muted-foreground">{client.subdomain}.mirestaurante.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                        <Badge variant="outline">
                          {subscription.plan} - S/ {subscription.amount}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Next: {new Date(subscription.next_billing).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          {/* Search and Select Client */}
          <Card>
            <CardHeader>
              <CardTitle>Select Client</CardTitle>
              <CardDescription>Choose a client to manage their subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.restaurant_name} ({client.subdomain})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Individual Client Management */}
          {selectedClient && mockSubscriptions[selectedClient] && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  Manage subscription for {clients.find(c => c.id === selectedClient)?.restaurant_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Plan</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge>
                        {mockSubscriptions[selectedClient].plan} - S/ {mockSubscriptions[selectedClient].amount}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(mockSubscriptions[selectedClient].status)}>
                        {mockSubscriptions[selectedClient].status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpgradeDowngrade(selectedClient, 'advanced')}
                    disabled={mockSubscriptions[selectedClient].plan === 'advanced'}
                  >
                    Upgrade to Advanced
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpgradeDowngrade(selectedClient, 'basic')}
                    disabled={mockSubscriptions[selectedClient].plan === 'basic'}
                  >
                    Downgrade to Basic
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelSubscription(selectedClient)}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}