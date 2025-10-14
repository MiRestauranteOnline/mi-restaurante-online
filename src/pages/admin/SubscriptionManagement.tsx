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
  plan_type: string;
  subscription_status: string;
  next_billing_date: string | null;
  subscription_end_date: string | null;
  subscription_pause_date: string | null;
  pending_plan_change: string | null;
  pending_plan_change_date: string | null;
  openpay_customer_id: string | null;
  openpay_subscription_id: string | null;
}

export default function SubscriptionManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [planPrices, setPlanPrices] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchClients();
    fetchPlanPrices();
  }, []);

  const fetchPlanPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('plan_key, monthly_price')
        .eq('is_active', true);

      if (error) throw error;
      
      const prices: Record<string, number> = {};
      data?.forEach(plan => {
        prices[plan.plan_key] = plan.monthly_price;
      });
      setPlanPrices(prices);
    } catch (error: any) {
      console.error('Error fetching plan prices:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, restaurant_name, subdomain, email, plan_type, subscription_status, next_billing_date, subscription_end_date, subscription_pause_date, pending_plan_change, pending_plan_change_date, openpay_customer_id, openpay_subscription_id')
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
    try {
      setLoading(true);
      const { error } = await supabase
        .from('clients')
        .update({
          subscription_status: 'cancelled',
          cancellation_date: new Date().toISOString(),
          cancellation_reason: 'admin_action'
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "The subscription has been cancelled successfully.",
      });

      await fetchClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeDowngrade = async (clientId: string, newPlan: 'basic' | 'advanced') => {
    try {
      setLoading(true);
      
      const client = clients.find(c => c.id === clientId);
      if (!client) throw new Error('Client not found');

      const isUpgrade = (client.plan_type === 'basic' && newPlan === 'advanced');
      
      // Call OpenPay edge function to handle plan change
      const { data, error } = await supabase.functions.invoke('change-openpay-plan', {
        body: {
          clientId,
          newPlanType: newPlan,
          immediate: isUpgrade, // Upgrades are immediate, downgrades are scheduled
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to change plan');

      if (data.immediate) {
        toast({
          title: "Plan Upgraded!",
          description: `Plan has been immediately upgraded to ${newPlan}. You've been charged for the new plan.`,
        });
      } else {
        toast({
          title: "Plan Change Scheduled",
          description: `Plan will be changed to ${newPlan} on ${new Date(data.scheduledDate).toLocaleDateString()}`,
        });
      }

      await fetchClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async (clientId: string, action: 'pause' | 'resume') => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('pause-openpay-subscription', {
        body: { clientId, action },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || `Failed to ${action} subscription`);

      toast({
        title: action === 'pause' ? 'Subscription Paused' : 'Subscription Resumed',
        description: action === 'pause' 
          ? 'The subscription has been paused. No charges will be made.'
          : 'The subscription has been resumed and will be charged monthly.',
      });

      await fetchClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} subscription`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanAmount = (planType: string) => {
    return planPrices[planType] || 0;
  };

  const totalRevenue = clients.reduce((sum, client) => sum + getPlanAmount(client.plan_type), 0);
  const basicCount = clients.filter(c => c.plan_type === 'basic').length;
  const advancedCount = clients.filter(c => c.plan_type === 'advanced').length;

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
                  S/ {totalRevenue.toLocaleString()}
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
                  {basicCount} / {advancedCount}
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
                  const planAmount = getPlanAmount(client.plan_type);
                  return (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{client.restaurant_name}</p>
                          <p className="text-sm text-muted-foreground">{client.subdomain}.mirestaurante.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(client.subscription_status)}>
                          {client.subscription_status}
                        </Badge>
                        <Badge variant="outline">
                          {client.plan_type} - S/ {planAmount}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {client.next_billing_date 
                            ? `Next: ${new Date(client.next_billing_date).toLocaleDateString()}`
                            : 'No billing date'}
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
          {selectedClient && clients.find(c => c.id === selectedClient) && (
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.subscriptionManagement')}</CardTitle>
                <CardDescription>
                  Manage subscription for {clients.find(c => c.id === selectedClient)?.restaurant_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const client = clients.find(c => c.id === selectedClient);
                  if (!client) return null;
                  const planAmount = getPlanAmount(client.plan_type);
                  
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Current Plan</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge>
                              {client.plan_type} - S/ {planAmount}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(client.subscription_status)}>
                              {client.subscription_status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Next Billing Date</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {client.next_billing_date 
                              ? new Date(client.next_billing_date).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'No billing date set'}
                          </p>
                        </div>
                        <div>
                          <Label>Subscription End Date</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {client.subscription_end_date 
                              ? new Date(client.subscription_end_date).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'No end date'}
                          </p>
                        </div>
                      </div>

                      {client.subscription_status === 'cancelled' && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Cancellation Active:</strong> Service continues until {
                              client.subscription_end_date 
                                ? new Date(client.subscription_end_date).toLocaleDateString('es-PE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : 'end of billing period'
                            }
                          </p>
                        </div>
                      )}

                      {client.subscription_status === 'paused' && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Subscription Paused:</strong> Paused on {
                              client.subscription_pause_date 
                                ? new Date(client.subscription_pause_date).toLocaleDateString('es-PE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : 'unknown date'
                            }
                          </p>
                        </div>
                      )}

                      {client.pending_plan_change && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                          <p className="text-sm text-orange-800 dark:text-orange-200">
                            <strong>Pending Plan Change:</strong> Will change to {client.pending_plan_change} on {
                              client.pending_plan_change_date 
                                ? new Date(client.pending_plan_change_date).toLocaleDateString('es-PE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : 'next billing date'
                            }
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleUpgradeDowngrade(selectedClient, 'advanced')}
                          disabled={client.plan_type === 'advanced' || loading}
                        >
                          Upgrade to Advanced
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUpgradeDowngrade(selectedClient, 'basic')}
                          disabled={client.plan_type === 'basic' || loading}
                        >
                          Downgrade to Basic
                        </Button>
                        {client.subscription_status === 'active' && (
                          <Button
                            variant="secondary"
                            onClick={() => handlePauseResume(selectedClient, 'pause')}
                            disabled={loading}
                          >
                            Pause Subscription
                          </Button>
                        )}
                        {client.subscription_status === 'paused' && (
                          <Button
                            variant="secondary"
                            onClick={() => handlePauseResume(selectedClient, 'resume')}
                            disabled={loading}
                          >
                            Resume Subscription
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelSubscription(selectedClient)}
                          disabled={loading}
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}