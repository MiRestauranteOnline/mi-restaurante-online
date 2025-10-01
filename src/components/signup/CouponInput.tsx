import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tag, Loader2 } from "lucide-react";

interface CouponInputProps {
  planType: string;
  onCouponApplied: (coupon: {
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null) => void;
  amount: number;
}

export const CouponInput = ({ planType, onCouponApplied, amount }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const { toast } = useToast();

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de cupón",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        coupon_code: couponCode.toUpperCase(),
        plan_type: planType,
        amount: amount,
      });

      if (error) throw error;

      const result = data as any;

      if (result?.valid) {
        setAppliedCoupon(result);
        onCouponApplied({
          code: couponCode.toUpperCase(),
          discountAmount: result.discount_amount,
          finalAmount: result.final_amount,
        });
        toast({
          title: "¡Cupón aplicado!",
          description: `Descuento de S/${result.discount_amount.toFixed(2)} aplicado`,
        });
      } else {
        toast({
          title: "Cupón inválido",
          description: result?.error || "El cupón no es válido para este plan",
          variant: "destructive",
        });
        onCouponApplied(null);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Error",
        description: "No se pudo validar el cupón",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    onCouponApplied(null);
    toast({
      title: "Cupón removido",
    });
  };

  return (
    <div className="space-y-3 border border-border rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <label className="text-sm font-medium">¿Tienes un cupón de descuento?</label>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Código de cupón"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          disabled={isValidating || !!appliedCoupon}
          className="uppercase"
        />
        {!appliedCoupon ? (
          <Button
            onClick={validateCoupon}
            disabled={isValidating || !couponCode.trim()}
            variant="outline"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Aplicar"
            )}
          </Button>
        ) : (
          <Button onClick={removeCoupon} variant="destructive">
            Remover
          </Button>
        )}
      </div>

      {appliedCoupon && (
        <div className="text-sm space-y-1 bg-primary/10 p-3 rounded-md">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>S/{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-primary font-medium">
            <span>Descuento:</span>
            <span>-S/{appliedCoupon.discount_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>Total:</span>
            <span>S/{appliedCoupon.final_amount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
