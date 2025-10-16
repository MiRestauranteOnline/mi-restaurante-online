import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { BillingInfoForm, BillingInfo } from '@/components/BillingInfoForm';

const cardSchema = z.object({
  cardNumber: z.string()
    .min(14, 'El número de tarjeta debe tener al menos 14 dígitos')
    .max(16, 'El número de tarjeta debe tener como máximo 16 dígitos')
    .regex(/^\d+$/, 'El número de tarjeta debe contener solo dígitos'),
  holderName: z.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre debe tener menos de 100 caracteres'),
  expirationMonth: z.string()
    .regex(/^(0[1-9]|1[0-2])$/, 'El mes debe ser 01-12'),
  expirationYear: z.string()
    .regex(/^\d{2}$/, 'El año debe tener 2 dígitos')
    .refine((year) => parseInt(year) >= parseInt(new Date().getFullYear().toString().slice(-2)), 'La tarjeta está vencida'),
  cvv2: z.string()
    .min(3, 'El CVV debe tener 3 o 4 dígitos')
    .max(4, 'El CVV debe tener 3 o 4 dígitos')
    .regex(/^\d+$/, 'El CVV debe contener solo dígitos'),
});

const customerSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  email: z.string().trim().email('Correo electrónico inválido').max(255),
  phone: z.string().trim().min(7, 'El teléfono debe tener al menos 7 caracteres').max(20),
});

interface OpenPayPaymentFormProps {
  clientId: string;
  planType: 'basic' | 'advanced';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  couponCode?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onBillingInfoSaved?: (billingInfo: BillingInfo) => void;
}

export default function OpenPayPaymentForm({
  clientId,
  planType,
  customerName,
  customerEmail,
  customerPhone,
  couponCode,
  onSuccess,
  onCancel,
  onBillingInfoSaved,
}: OpenPayPaymentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    holderName: '',
    expirationMonth: '',
    expirationYear: '',
    cvv2: '',
  });

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    documentType: 'boleta',
  });
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});

  const validateBillingInfo = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (billingInfo.documentType === 'boleta' && billingInfo.dni) {
      if (!/^\d{8}$/.test(billingInfo.dni)) {
        errors.dni = 'El DNI debe tener 8 dígitos';
      }
    }
    
    if (billingInfo.documentType === 'factura') {
      if (!billingInfo.ruc || !/^\d{11}$/.test(billingInfo.ruc)) {
        errors.ruc = 'El RUC debe tener 11 dígitos';
      }
      if (!billingInfo.businessName || billingInfo.businessName.trim().length < 3) {
        errors.businessName = 'La razón social es requerida';
      }
      if (!billingInfo.fiscalAddress || billingInfo.fiscalAddress.trim().length < 10) {
        errors.fiscalAddress = 'La dirección fiscal es requerida';
      }
    }
    
    setBillingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveBillingInfo = async () => {
    try {
      const { error } = await supabase
        .from('client_billing_info')
        .upsert({
          client_id: clientId,
          document_type: billingInfo.documentType,
          dni: billingInfo.documentType === 'boleta' ? billingInfo.dni : null,
          ruc: billingInfo.documentType === 'factura' ? billingInfo.ruc : null,
          business_name: billingInfo.documentType === 'factura' ? billingInfo.businessName : null,
          fiscal_address: billingInfo.documentType === 'factura' ? billingInfo.fiscalAddress : null,
        });

      if (error) throw error;
      
      if (onBillingInfoSaved) {
        onBillingInfoSaved(billingInfo);
      }
    } catch (error) {
      console.error('Error saving billing info:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCardError('');
    setBillingErrors({});

    try {
      // Validate billing info first
      if (!validateBillingInfo()) {
        toast({
          title: "Error de validación",
          description: "Por favor complete correctamente la información de facturación",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      // Validate card data
      const validatedCard = cardSchema.parse(cardData);
      
      // Validate customer data
      const validatedCustomer = customerSchema.parse({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      });

      // Apply coupon if provided
      let discountAmount = 0;
      if (couponCode) {
        const { data: couponResult, error: couponError } = await supabase
          .rpc('validate_coupon', {
            coupon_code: couponCode,
            plan_type: planType,
            amount: planType === 'basic' ? 49.99 : 99.99,
          });

        if (couponError) {
          console.error('Coupon validation error:', couponError);
        } else if (couponResult && typeof couponResult === 'object' && 'valid' in couponResult && couponResult.valid) {
          discountAmount = (couponResult as any).discount_amount;
          toast({
            title: 'Cupón aplicado',
            description: `Descuento: S/${discountAmount.toFixed(2)}`,
          });
        }
      }

      // Create OpenPay subscription
      const { data, error } = await supabase.functions.invoke('create-openpay-subscription', {
        body: {
          clientId,
          planType,
          customerData: validatedCustomer,
          cardData: {
            cardNumber: validatedCard.cardNumber,
            holderName: validatedCard.holderName,
            expirationYear: validatedCard.expirationYear,
            expirationMonth: validatedCard.expirationMonth,
            cvv2: validatedCard.cvv2,
          },
          couponCode: couponCode || null,
          discountAmount,
        },
      });

      if (error || !data?.success) {
        const errorMessage = data?.error || error?.message || "Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.";
        console.error('OpenPay payment error:', { error, data });
        throw new Error(errorMessage);
      }

      // Save billing info after successful payment
      await saveBillingInfo();

      // Increment coupon usage if applied
      if (couponCode) {
        await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode });
      }

      toast({
        title: '¡Pago exitoso!',
        description: 'Tu suscripción está activa.',
      });

      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      
      let title = 'Pago rechazado';
      let description = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // Check for card rejection scenarios
        if (errorMsg.includes('declined') || errorMsg.includes('rejected') || 
            errorMsg.includes('insufficient') || errorMsg.includes('invalid card') ||
            errorMsg.includes('stolen') || errorMsg.includes('lost')) {
          title = 'Tarjeta rechazada';
          description = 'Tu tarjeta fue rechazada por tu banco. Por favor, verifica los datos de tu tarjeta o intenta con otro método de pago.';
        } else if (errorMsg.includes('expired')) {
          title = 'Tarjeta vencida';
          description = 'Tu tarjeta ha vencido. Por favor, utiliza otro método de pago.';
        } else if (errorMsg.includes('cvv') || errorMsg.includes('security code')) {
          title = 'Código de seguridad inválido';
          description = 'El código CVV es incorrecto. Por favor, verifica e intenta nuevamente.';
        } else if (errorMsg.includes('card number')) {
          title = 'Número de tarjeta inválido';
          description = 'El número de tarjeta es inválido. Por favor, verifica e intenta nuevamente.';
        } else {
          description = error.message;
        }
      }
      
      setCardError(description);
      
      toast({
        title,
        description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Pago</CardTitle>
        <CardDescription>
          Ingresa los datos de tu tarjeta para completar tu suscripción al plan {planType === 'basic' ? 'básico' : 'avanzado'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número de Tarjeta</Label>
            <Input
              id="cardNumber"
              placeholder="1234567890123456"
              value={cardData.cardNumber}
              onChange={(e) => {
                setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) });
                setCardError('');
              }}
              maxLength={16}
              required
              className={cardError ? 'border-red-500' : ''}
            />
            {cardError && (
              <p className="text-sm text-red-500 mt-1">{cardError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderName">Nombre del Titular</Label>
            <Input
              id="holderName"
              placeholder="Juan Pérez"
              value={cardData.holderName}
              onChange={(e) => setCardData({ ...cardData, holderName: e.target.value })}
              maxLength={100}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expirationMonth">Mes</Label>
              <Input
                id="expirationMonth"
                placeholder="MM"
                value={cardData.expirationMonth}
                onChange={(e) => setCardData({ ...cardData, expirationMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                maxLength={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationYear">Año</Label>
              <Input
                id="expirationYear"
                placeholder="AA"
                value={cardData.expirationYear}
                onChange={(e) => setCardData({ ...cardData, expirationYear: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                maxLength={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv2">CVV</Label>
              <Input
                id="cvv2"
                type="password"
                placeholder="123"
                value={cardData.cvv2}
                onChange={(e) => setCardData({ ...cardData, cvv2: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                maxLength={4}
                required
              />
            </div>
          </div>

          <BillingInfoForm
            billingInfo={billingInfo}
            onChange={setBillingInfo}
            errors={billingErrors}
          />

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                `Pagar y Suscribirse`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
