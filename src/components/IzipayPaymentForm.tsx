import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface IzipayPaymentFormProps {
  amount: number; // Amount in cents
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, any>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    KR: any;
  }
}

export const IzipayPaymentForm = ({
  amount,
  currency,
  orderId,
  customerEmail,
  metadata,
  onSuccess,
  onError,
}: IzipayPaymentFormProps) => {
  const [loading, setLoading] = useState(true);
  const [formToken, setFormToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load Izipay JavaScript library
    const script = document.createElement("script");
    script.src = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
    script.async = true;
    script.setAttribute("kr-public-key", "77392801:testpublickey_blTsYOjwDxCriZGNwoJVFLxe9N7BkQKEML8mvNSh3rSZE");
    
    script.onload = () => {
      console.log("Izipay library loaded");
      initializePayment();
    };

    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load payment library",
        variant: "destructive",
      });
      setLoading(false);
      onError?.("Failed to load payment library");
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayment = async () => {
    try {
      console.log("Initializing payment...");
      
      // Create payment session via edge function
      const { data, error } = await supabase.functions.invoke("create-izipay-payment", {
        body: {
          amount,
          currency,
          orderId,
          customer: {
            email: customerEmail,
          },
          metadata,
        },
      });

      if (error) {
        throw error;
      }

      console.log("Payment session created:", data);
      setFormToken(data.formToken);

      // Initialize SmartForm
      if (window.KR) {
        await window.KR.setFormConfig({
          formToken: data.formToken,
          "kr-language": "es-ES",
        });

        // Handle payment events
        window.KR.onSubmit((paymentResponse: any) => {
          console.log("Payment submitted:", paymentResponse);
          
          if (paymentResponse.clientAnswer.orderStatus === "PAID") {
            toast({
              title: "¡Pago exitoso!",
              description: "Tu pago ha sido procesado correctamente",
            });
            onSuccess?.();
          } else {
            toast({
              title: "Pago no completado",
              description: "El pago no pudo ser procesado",
              variant: "destructive",
            });
            onError?.("Payment not completed");
          }
          
          return false; // Prevent form submission
        });

        window.KR.onError((error: any) => {
          console.error("Payment error:", error);
          toast({
            title: "Error",
            description: "Ocurrió un error durante el pago",
            variant: "destructive",
          });
          onError?.(error.detailedErrorMessage || "Payment error");
        });

        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error initializing payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
      setLoading(false);
      onError?.(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando formulario de pago...</span>
      </div>
    );
  }

  if (!formToken) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-destructive font-medium">Error al cargar el formulario de pago</p>
        <p className="text-sm text-muted-foreground">Por favor, contacta a soporte si el problema persiste.</p>
      </div>
    );
  }

  return (
    <div className="izipay-payment-container">
      <div className="kr-embedded" kr-form-token={formToken}></div>
    </div>
  );
};
