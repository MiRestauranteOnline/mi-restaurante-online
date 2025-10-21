import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
}

export default function DataCopyTool() {
  const [clients, setClients] = useState<Client[]>([]);
  const [sourceClientId, setSourceClientId] = useState<string>("");
  const [targetClientIds, setTargetClientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, restaurant_name, subdomain")
      .order("restaurant_name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
      return;
    }

    setClients(data || []);
  };

  const handleCopyData = async () => {
    if (!sourceClientId || targetClientIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select source and target clients",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("copy-client-data", {
        body: { sourceClientId, targetClientIds },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to copy data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableTargets = clients.filter((c) => c.id !== sourceClientId);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Copy Client Data</CardTitle>
          <CardDescription>
            Copy data from one client to multiple target clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Source Client</label>
            <Select value={sourceClientId} onValueChange={setSourceClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select source client" />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Client(s)</label>
            <Select
              value={targetClientIds[0] || ""}
              onValueChange={(value) => setTargetClientIds([value])}
              disabled={!sourceClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target client" />
              </SelectTrigger>
              <SelectContent>
                {availableTargets.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.restaurant_name} ({client.subdomain})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCopyData} disabled={loading || !sourceClientId || targetClientIds.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Copy Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
