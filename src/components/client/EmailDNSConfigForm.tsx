import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

const emailDNSSchema = z.object({
  dkim_selector: z.string().min(1, "El selector DKIM es requerido"),
  dkim_value: z.string().min(10, "El valor DKIM es requerido"),
});

type EmailDNSFormData = z.infer<typeof emailDNSSchema>;

interface EmailDNSConfigFormProps {
  clientId: string;
}

export function EmailDNSConfigForm({ clientId }: EmailDNSConfigFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<{
    status?: "pending" | "processing" | "completed" | "failed";
    message?: string;
    requestId?: string;
  }>({});

  const form = useForm<EmailDNSFormData>({
    resolver: zodResolver(emailDNSSchema),
    defaultValues: {
      dkim_selector: "default._domainkey",
      dkim_value: "",
    },
  });

  const onSubmit = async (data: EmailDNSFormData) => {
    setIsSubmitting(true);
    setRequestStatus({});

    try {
      // Create the DNS request
      const { data: request, error: insertError } = await supabase
        .from("email_dns_requests")
        .insert({
          client_id: clientId,
          dkim_selector: data.dkim_selector,
          dkim_value: data.dkim_value,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setRequestStatus({
        status: "pending",
        message: "Solicitud creada. Configurando DNS...",
        requestId: request.id,
      });

      // Call the edge function to configure DNS
      const { error: functionError } = await supabase.functions.invoke(
        "configure-email-dns",
        {
          body: { requestId: request.id },
        }
      );

      if (functionError) throw functionError;

      // Poll for status updates
      const checkStatus = async () => {
        const { data: statusData } = await supabase
          .from("email_dns_requests")
          .select("status, error_message")
          .eq("id", request.id)
          .single();

        if (statusData) {
          setRequestStatus({
            status: statusData.status as any,
            message: statusData.error_message || undefined,
            requestId: request.id,
          });

          if (statusData.status === "completed") {
            toast({
              title: "¡Configuración Completa!",
              description: "Los registros DNS de email han sido configurados exitosamente en Cloudflare.",
            });
            form.reset();
          } else if (statusData.status === "failed") {
            toast({
              title: "Error en Configuración",
              description: statusData.error_message || "No se pudieron configurar los registros DNS.",
              variant: "destructive",
            });
          }
        }
      };

      // Check status every 2 seconds for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 15;
      const interval = setInterval(async () => {
        attempts++;
        await checkStatus();
        
        if (attempts >= maxAttempts || requestStatus.status === "completed" || requestStatus.status === "failed") {
          clearInterval(interval);
        }
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting email DNS request:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud.",
        variant: "destructive",
      });
      setRequestStatus({
        status: "failed",
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (requestStatus.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "processing":
      case "pending":
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (requestStatus.status) {
      case "completed":
        return "✅ Registros DNS configurados exitosamente";
      case "failed":
        return `❌ Error: ${requestStatus.message || "No se pudieron configurar los registros"}`;
      case "processing":
        return "⏳ Configurando registros DNS en Cloudflare...";
      case "pending":
        return "📋 Solicitud creada, iniciando configuración...";
      default:
        return null;
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle>🚀 Configuración Automática de DNS para Email</CardTitle>
        <CardDescription>
          Introduce los datos de tu correo de NameCheap y configuraremos automáticamente los registros DNS en Cloudflare por ti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertDescription>
            <p className="font-medium mb-2">✨ Ventajas de la configuración automática:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>No necesitas configurar nada manualmente en Cloudflare</li>
              <li>Se configuran todos los registros (MX, SPF, DKIM) automáticamente</li>
              <li>Sin errores de copia o formato</li>
              <li>Configuración completa en segundos</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dkim_selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selector DKIM</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="default._domainkey" />
                  </FormControl>
                  <FormDescription>
                    Generalmente es "default._domainkey". Lo encuentras en la configuración de DNS de NameCheap.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dkim_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor DKIM</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA..."
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Copia el valor completo del registro DKIM que te proporciona NameCheap (empieza con "v=DKIM1;").
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requestStatus.status && (
              <Alert className={
                requestStatus.status === "completed" ? "border-green-600 bg-green-50 dark:bg-green-950" :
                requestStatus.status === "failed" ? "border-red-600 bg-red-50 dark:bg-red-950" :
                "border-blue-600 bg-blue-50 dark:bg-blue-950"
              }>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <AlertDescription className="font-medium">
                    {getStatusMessage()}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting || requestStatus.status === "completed"}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando DNS...
                </>
              ) : requestStatus.status === "completed" ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Configuración Completa
                </>
              ) : (
                "Configurar DNS Automáticamente"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">ℹ️ Nota importante:</p>
          <p className="text-sm text-muted-foreground">
            Los registros MX y SPF se configuran automáticamente con los valores estándar de NameCheap Private Email. 
            Solo necesitas proporcionar el valor DKIM que es único para tu dominio.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
