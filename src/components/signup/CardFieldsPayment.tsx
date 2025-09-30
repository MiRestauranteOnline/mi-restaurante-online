import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  initMercadoPago,
  CardNumber,
  ExpirationDate,
  SecurityCode,
  getIdentificationTypes,
  createCardToken,
  getPaymentMethods,
  getIssuers,
} from "@mercadopago/sdk-react";

interface CardFieldsPaymentProps {
  signupData: { email: string; restaurantName: string; paymentId?: string };
  selectedPlan: "basic" | "advanced";
  onSuccess: () => void;
  onBack: () => void;
}

export const CardFieldsPayment: React.FC<CardFieldsPaymentProps> = ({
  signupData,
  selectedPlan,
  onSuccess,
  onBack,
}) => {
  const { toast } = useToast();
  const [loadingInit, setLoadingInit] = useState(true);
  const [creating, setCreating] = useState(false);
  const [idTypes, setIdTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [idType, setIdType] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [cardholderName, setCardholderName] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [issuerId, setIssuerId] = useState<string>("");
  const [mpMode, setMpMode] = useState<'test' | 'live' | null>(null);
  const [cardNumberInstance, setCardNumberInstance] = useState<any>(null);

  const amount = selectedPlan === "basic" ? 297 : 497;

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-mercadopago-public-key");
        if (error || !data?.success) throw new Error(data?.error || error?.message || "No se pudo obtener la clave pública");

        initMercadoPago(data.publicKey, { locale: "es-PE" });
        setMpMode(data.mode || null);

        // Load identification types for the region (e.g., DNI, C.E, RUC)
        try {
          const types = await getIdentificationTypes();
          const mapped = (types || []).map((t: any) => ({ id: t.id, name: t.name }));
          setIdTypes(mapped);
          if (mapped.length) setIdType(mapped[0].id);
        } catch (e) {
          console.warn("Failed to load identification types", e);
        }
        setLoadingInit(false);
      } catch (e: any) {
        console.error("Mercado Pago init error:", e);
        toast({ title: "Error", description: e.message || "No se pudo iniciar el pago", variant: "destructive" });
        setLoadingInit(false);
      }
    };
    init();
  }, [toast]);

  // Handle BIN change to get payment method and issuer
  const handleBinChange = async (bin: string) => {
    if (!bin || bin.length < 6) {
      setPaymentMethodId("");
      setIssuerId("");
      return;
    }

    try {
      console.log("Getting payment methods for BIN:", bin);
      const { results } = await getPaymentMethods({ bin });
      const paymentMethod = results?.[0];

      if (paymentMethod) {
        console.log("Payment method found:", paymentMethod);
        setPaymentMethodId(paymentMethod.id);

        // Get issuers if needed
        if (paymentMethod.additional_info_needed?.includes("issuer_id")) {
          const issuers = await getIssuers({ paymentMethodId: paymentMethod.id, bin });
        if (issuers?.[0]) {
          setIssuerId(String(issuers[0].id));
          console.log("Issuer found:", issuers[0]);
        }
        } else if (paymentMethod.issuer) {
          setIssuerId(String(paymentMethod.issuer.id));
          console.log("Using default issuer:", paymentMethod.issuer);
        }
      }
    } catch (e) {
      console.warn("Failed to get payment method:", e);
    }
  };

  const handlePay = async () => {
    try {
      setCreating(true);

      if (!cardholderName.trim()) throw new Error("Ingresa el nombre del titular de la tarjeta");
      if (!idType || !idNumber.trim()) throw new Error("Completa el documento del titular");
      if (!paymentMethodId) throw new Error("No se pudo detectar el método de pago. Verifica el número de tarjeta.");

      // Create token from mounted secure fields
      const token = await createCardToken({
        cardholderName: cardholderName.trim(),
        identificationType: idType,
        identificationNumber: idNumber.trim(),
      });

      console.log('Card token generated:', token);

      if (!token?.id) throw new Error("No se pudo generar el token de la tarjeta");

      const { data, error } = await supabase.functions.invoke("process-mercadopago-card-payment", {
        body: {
          token: token.id,
          amount,
          installments: 1,
          description: `${selectedPlan === "basic" ? "Plan Básico" : "Plan Avanzado"} - Mi Restaurante Online`,
          payment_method_id: paymentMethodId,
          issuer_id: issuerId || undefined,
          payer: {
            email: signupData.email,
            first_name: signupData.restaurantName,
            identification: { type: idType, number: idNumber.trim() },
          },
          metadata: { client_id: signupData.paymentId || null, plan_type: selectedPlan },
        },
      });

      if (error || !data?.success) throw new Error(data?.error || error?.message || "Pago rechazado");

      const status = (data as any)?.payment?.status;
      if (status === "approved") {
        toast({ title: "Pago exitoso", description: "Tu suscripción ha sido activada." });
        onSuccess();
      } else {
        toast({ title: "Pago en proceso", description: "Te avisaremos cuando se apruebe." });
      }
    } catch (e: any) {
      console.error("Card fields payment error:", e);
      toast({ title: "Error en el pago", description: e.message || "No se pudo procesar el pago", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Completa tu pago</h2>
        <p className="text-muted-foreground">Ingresa los datos de tu tarjeta, sin crear cuenta ni salir del sitio.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              S/ {amount}
              <span className="text-sm text-muted-foreground font-normal">/mes</span>
            </div>
            <ul className="mt-4 text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Diseño profesional</li>
              <li>Menú digital</li>
              <li>{selectedPlan === "advanced" ? "Cambios ilimitados y soporte prioritario" : "Soporte estándar"}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarjeta de crédito o débito</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingInit ? (
              <div className="py-4 text-sm text-muted-foreground">Cargando campos seguros…</div>
            ) : (
              <div className="space-y-4">
                {mpMode === 'test' && (
                  <div className="text-xs text-muted-foreground">Modo prueba: usa tarjetas de prueba de Mercado Pago.</div>
                )}
                <div className="space-y-2">
                  <Label>Nombre del titular</Label>
                  <Input
                    placeholder="Como figura en la tarjeta"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número de tarjeta</Label>
                  <div className="border rounded-md px-3 py-2">
                    <CardNumber 
                      placeholder="1234 1234 1234 1234" 
                      onBinChange={(data: any) => handleBinChange(data?.bin)}
                    />
                  </div>
                  {paymentMethodId && (
                    <div className="text-xs text-green-600">
                      ✓ Método de pago detectado
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Vencimiento</Label>
                    <div className="border rounded-md px-3 py-2">
                      <ExpirationDate placeholder="MM/AA" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <div className="border rounded-md px-3 py-2">
                      <SecurityCode placeholder="123" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Documento</Label>
                    <Select value={idType} onValueChange={setIdType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {idTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name || t.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={onBack} disabled={creating}>Volver</Button>
                  <Button onClick={handlePay} disabled={creating}>{creating ? "Procesando…" : "Pagar"}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
