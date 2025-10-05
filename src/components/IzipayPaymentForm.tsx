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
  isSubscription?: boolean; // Flag to indicate subscription payment
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
  isSubscription = true, // Default to subscription
}: IzipayPaymentFormProps) => {
  const [loading, setLoading] = useState(true);
  const [formToken, setFormToken] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // First, get the payment session to retrieve public key
    initializePayment();
  }, []);

  useEffect(() => {
    // Load Izipay JavaScript library once we have the public key
    if (!publicKey) return;

    const script = document.createElement("script");
    script.src = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
    script.async = true;
    script.setAttribute("kr-public-key", publicKey);
    
    script.onload = () => {
      console.log("Izipay library loaded with public key");
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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [publicKey]);

  useEffect(() => {
    // Setup form after the kr-embedded div has been rendered
    if (formToken && window.KR && publicKey && !loading) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setupSmartForm();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [formToken, publicKey, loading]);

  const initializePayment = async () => {
    try {
      console.log("Initializing payment with:", { amount, currency, orderId, email: customerEmail });
      
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
          isSubscription, // Pass subscription flag
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to initialize payment",
          variant: "destructive",
        });
        setLoading(false);
        onError?.(error.message || "Edge function error");
        return;
      }

      console.log("Payment session created:", data);

      if (data?.success === false) {
        const msg = data?.detailedErrorMessage || data?.errorMessage || (data?.errorCode ? `Izipay error ${data.errorCode}` : "Payment initialization failed");
        toast({ title: "Error", description: msg, variant: "destructive" });
        setLoading(false);
        onError?.(msg);
        return;
      }

      if (!data?.formToken || !data?.publicKey) {
        const errMsg = "No se recibió formToken o publicKey de Izipay";
        toast({ title: "Error", description: errMsg, variant: "destructive" });
        setLoading(false);
        onError?.(errMsg);
        return;
      }

      setFormToken(data.formToken);
      setPublicKey(data.publicKey);
      // Set loading to false so the kr-embedded div can render
      setLoading(false);
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

  const setupSmartForm = async () => {
    try {
      console.log("Setting up SmartForm with Spanish language");
      await window.KR.setFormConfig({
        formToken: formToken,
        "kr-language": "es-ES",
        "kr-spa-mode": "true",
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
        
        return false;
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

      console.log("SmartForm setup completed");
    } catch (error: any) {
      console.error("Error setting up SmartForm:", error);
      toast({
        title: "Error",
        description: "Failed to setup payment form",
        variant: "destructive",
      });
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-lg border-2 border-primary/20 bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Información de Pago</h2>
          <p className="text-sm text-muted-foreground">Complete los datos de su tarjeta para activar su suscripción</p>
        </div>
        <div className="kr-embedded" kr-form-token={formToken}></div>
      </div>
    </div>
  );
};
