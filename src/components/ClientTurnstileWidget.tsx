import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ClientTurnstileWidgetProps {
  clientId: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

/**
 * Client-Specific Cloudflare Turnstile CAPTCHA Widget
 * 
 * This component automatically fetches the client's unique Turnstile site key
 * and renders a CAPTCHA widget for forms on client restaurant websites.
 * 
 * Each client gets their own Turnstile widget created automatically during signup.
 * 
 * Usage:
 * ```tsx
 * <ClientTurnstileWidget
 *   clientId={clientId}
 *   onVerify={(token) => console.log('Verified:', token)}
 * />
 * ```
 */
export const ClientTurnstileWidget = ({ 
  clientId, 
  onVerify, 
  onError, 
  onExpire,
  theme = "light",
  size = "normal"
}: ClientTurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch client's Turnstile site key
  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('clients')
          .select('turnstile_site_key')
          .eq('id', clientId)
          .single();

        if (fetchError) {
          console.error('Error fetching Turnstile site key:', fetchError);
          setError('Failed to load security verification');
          onError?.();
          return;
        }

        // Type assertion needed until Supabase types are regenerated
        const clientData = data as any;
        if (!clientData?.turnstile_site_key) {
          console.warn('No Turnstile site key found for client:', clientId);
          setError('Security verification not configured');
          onError?.();
          return;
        }

        setSiteKey(clientData.turnstile_site_key);
      } catch (err) {
        console.error('Unexpected error fetching Turnstile site key:', err);
        setError('Failed to initialize security verification');
        onError?.();
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchSiteKey();
    }
  }, [clientId, onError]);

  // Render Turnstile widget once we have the site key
  useEffect(() => {
    if (!siteKey || loading) return;

    // Wait for Turnstile to be loaded
    const checkTurnstile = setInterval(() => {
      if (window.turnstile && containerRef.current) {
        clearInterval(checkTurnstile);

        // Render the Turnstile widget with client's site key
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              console.log('Turnstile verification successful');
              onVerify(token);
            },
            "error-callback": () => {
              console.error('Turnstile verification error');
              onError?.();
            },
            "expired-callback": () => {
              console.warn('Turnstile verification expired');
              onExpire?.();
            },
            theme,
            size,
          });
        } catch (err) {
          console.error("Failed to render Turnstile:", err);
          setError('Failed to render security verification');
          onError?.();
        }
      }
    }, 100);

    return () => {
      clearInterval(checkTurnstile);
      // Clean up widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (err) {
          console.error("Failed to remove Turnstile widget:", err);
        }
      }
    };
  }, [siteKey, loading, onVerify, onError, onExpire, theme, size]);

  if (loading) {
    return (
      <div className="flex justify-center items-center my-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading security verification...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-sm text-destructive text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} id="turnstile-container"></div>
    </div>
  );
};
