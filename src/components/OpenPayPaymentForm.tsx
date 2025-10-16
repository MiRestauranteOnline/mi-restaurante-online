import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const cardSchema = z.object({
  cardNumber: z.string()
    .min(14, 'Card number must be at least 14 digits')
    .max(16, 'Card number must be at most 16 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
  holderName: z.string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  expirationMonth: z.string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Month must be 01-12'),
  expirationYear: z.string()
    .regex(/^\d{2}$/, 'Year must be 2 digits')
    .refine((year) => parseInt(year) >= parseInt(new Date().getFullYear().toString().slice(-2)), 'Card is expired'),
  cvv2: z.string()
    .min(3, 'CVV must be 3 or 4 digits')
    .max(4, 'CVV must be 3 or 4 digits')
    .regex(/^\d+$/, 'CVV must contain only digits'),
});

const customerSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().min(7, 'Phone must be at least 7 characters').max(20),
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
}: OpenPayPaymentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    holderName: '',
    expirationMonth: '',
    expirationYear: '',
    cvv2: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
            title: 'Coupon applied',
            description: `Discount: S/${discountAmount.toFixed(2)}`,
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
        throw new Error(errorMessage);
      }

      // Increment coupon usage if applied
      if (couponCode) {
        await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode });
      }

      toast({
        title: 'Payment successful!',
        description: 'Your subscription is now active.',
      });

      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: 'Payment failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Enter your card details to complete your {planType} plan subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234567890123456"
              value={cardData.cardNumber}
              onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
              maxLength={16}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderName">Cardholder Name</Label>
            <Input
              id="holderName"
              placeholder="John Doe"
              value={cardData.holderName}
              onChange={(e) => setCardData({ ...cardData, holderName: e.target.value })}
              maxLength={100}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expirationMonth">Month</Label>
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
              <Label htmlFor="expirationYear">Year</Label>
              <Input
                id="expirationYear"
                placeholder="YY"
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

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay & Subscribe`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
