import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Info, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
}

export default function ProjectConfiguration() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [currentProjectClient, setCurrentProjectClient] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
    getCurrentProjectClient();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, restaurant_name, subdomain')
        .order('restaurant_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load clients: " + error.message,
        variant: "destructive"
      });
    }
  };

  const getCurrentProjectClient = () => {
    // Check localStorage for current project client configuration
    const stored = localStorage.getItem('project_client_id');
    if (stored) {
      setCurrentProjectClient(stored);
      setSelectedClientId(stored);
    } else {
      // Default to demo client if none set
      const demoClient = 'demo'; // subdomain
      setCurrentProjectClient(demoClient);
      setSelectedClientId(demoClient);
    }
    setLoading(false);
  };

  const handleSave = () => {
    setSaving(true);
    
    // Save to localStorage
    localStorage.setItem('project_client_id', selectedClientId);
    setCurrentProjectClient(selectedClientId);
    
    toast({
      title: "Success",
      description: "Project configuration updated! The frontend will now use this client's data.",
    });
    
    // Simulate saving delay
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId || c.subdomain === selectedClientId);
  const currentClient = clients.find(c => c.id === currentProjectClient || c.subdomain === currentProjectClient);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Project Configuration</h1>
        <p className="text-muted-foreground">Configure which client data this project instance displays</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This setting controls which client's data (restaurant info, menu, etc.) is displayed on the public frontend. 
          When you duplicate/remix this template, you can easily switch to a different client's data using this interface.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentClient ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Restaurant</p>
                  <p className="font-medium">{currentClient.restaurant_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subdomain</p>
                  <p className="font-medium">{currentClient.subdomain}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://${currentClient.subdomain}.mirestaurante.com`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Site
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No client configured</p>
            )}
          </CardContent>
        </Card>

        {/* Change Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Change Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Select New Client</p>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.restaurant_name} ({client.subdomain})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClient && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-sm text-muted-foreground">
                  The frontend will display: <span className="font-medium">{selectedClient.restaurant_name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Accessible at: <span className="font-medium">{selectedClient.subdomain}.mirestaurante.com</span>
                </p>
              </div>
            )}

            <Button 
              onClick={handleSave} 
              disabled={saving || selectedClientId === currentProjectClient}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Template Duplication Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">For New Projects:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Duplicate/remix this project in Lovable</li>
              <li>Create a new client in the Admin Dashboard</li>
              <li>Use this Project Configuration page to switch to the new client</li>
              <li>The frontend will now display the new client's data</li>
              <li>Deploy the project with the new configuration</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Database Connection:</h4>
            <p className="text-sm text-muted-foreground">
              All duplicated projects share the same Supabase database, so you can manage multiple restaurant 
              websites from one admin panel while each project displays different client data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}