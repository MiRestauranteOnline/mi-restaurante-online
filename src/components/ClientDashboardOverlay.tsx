import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ClientDashboardOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDashboardStatus = async () => {
      try {
        console.log('[ClientDashboardOverlay] Checking dashboard status...');
        
        // Get current user's client
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[ClientDashboardOverlay] No user found');
          setLoading(false);
          return;
        }

        console.log('[ClientDashboardOverlay] User found:', user.id);

        const { data: userClient, error: userClientError } = await supabase
          .from("user_clients")
          .select("client_id")
          .eq("user_id", user.id)
          .single();

        if (userClientError || !userClient) {
          console.error('[ClientDashboardOverlay] Error fetching user_client:', userClientError);
          setLoading(false);
          return;
        }

        console.log('[ClientDashboardOverlay] Client ID:', userClient.client_id);

        // Check if dashboard is deactivated
        const { data: client, error: clientError } = await supabase
          .from("clients")
          .select("dashboard_is_deactivated, email")
          .eq("id", userClient.client_id)
          .single();

        if (clientError) {
          console.error('[ClientDashboardOverlay] Error fetching client:', clientError);
          setLoading(false);
          return;
        }

        console.log('[ClientDashboardOverlay] Client data:', { 
          dashboard_is_deactivated: client.dashboard_is_deactivated,
          email: client.email 
        });

        setShowOverlay(client.dashboard_is_deactivated || false);
        setClientEmail(client.email || "");
        setLoading(false);
      } catch (error) {
        console.error('[ClientDashboardOverlay] Error checking dashboard status:', error);
        setLoading(false);
      }
    };

    checkDashboardStatus();

    // Set up realtime subscription to detect when dashboard is activated
    const channel = supabase
      .channel("dashboard-status-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "clients",
        },
        (payload) => {
          console.log('[ClientDashboardOverlay] Realtime update received:', payload);
          if (payload.new.dashboard_is_deactivated !== undefined) {
            setShowOverlay(payload.new.dashboard_is_deactivated);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  console.log('[ClientDashboardOverlay] Render state:', { showOverlay, loading, clientEmail });

  if (loading) {
    console.log('[ClientDashboardOverlay] Still loading...');
    return null;
  }

  if (!showOverlay) {
    console.log('[ClientDashboardOverlay] Not showing overlay');
    return null;
  }

  console.log('[ClientDashboardOverlay] Showing overlay!');

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-4 text-primary">
            <div className="p-3 rounded-full bg-primary/10">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Su sitio web está siendo configurado
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Nuestro equipo está trabajando en su proyecto
              </p>
            </div>
          </div>

          <div className="space-y-4 text-foreground/90">
            <p className="text-lg leading-relaxed">
              Estamos realizando una revisión de calidad manual de su sitio web para
              garantizar que todo esté perfecto antes de publicarlo.
            </p>
            
            <p className="text-lg leading-relaxed">
              <strong className="text-primary">
                Recibirá un correo de confirmación cuando su sitio web esté listo
              </strong>
              {clientEmail && (
                <span className="block mt-2 text-base text-muted-foreground">
                  en: <span className="font-mono text-foreground">{clientEmail}</span>
                </span>
              )}
            </p>

            <div className="pt-4 border-t border-border">
              <p className="text-base font-medium mb-3">
                ¿Tiene alguna pregunta?
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:support@mirestaurante.online"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <Mail className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium">support@mirestaurante.online</span>
                </a>
                <a
                  href="https://wa.me/51952040074"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <MessageCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium">WhatsApp: +51 952 040 074</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Tiempo estimado de configuración: <strong>hasta 72 horas</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
