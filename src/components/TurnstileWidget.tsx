import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

/**
 * Cloudflare Turnstile CAPTCHA Widget
 *
 * SETUP REQUIRED:
 * 1. Go to Supabase Dashboard → Authentication → CAPTCHA Protection
 * 2. Enable Cloudflare Turnstile
 * 3. Add your Turnstile Site Key and Secret Key
 * 4. Save changes
 *
 * This component will automatically render the CAPTCHA challenge.
 */
export const TurnstileWidget = ({ onVerify, onError, onExpire }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Wait for Turnstile to be loaded
    const checkTurnstile = setInterval(() => {
      if (window.turnstile && containerRef.current) {
        clearInterval(checkTurnstile);

        // Render the Turnstile widget
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: "0x4AAAAAAB8sp2mX6aDFMYJP", // Replace with the Site Key from Cloudflare
            callback: (token: string) => {
              onVerify(token);
            },
            "error-callback": () => {
              onError?.();
            },
            "expired-callback": () => {
              onExpire?.();
            },
            theme: "light",
            size: "normal",
          });
        } catch (error) {
          console.error("Failed to render Turnstile:", error);
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
        } catch (error) {
          console.error("Failed to remove Turnstile widget:", error);
        }
      }
    };
  }, [onVerify, onError, onExpire]);

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} id="turnstile-container"></div>
    </div>
  );
};

// Type definition for Turnstile
declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}
