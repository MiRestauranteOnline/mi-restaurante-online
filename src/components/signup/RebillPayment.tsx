import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import type { SignupData } from "@/pages/Signup";

interface RebillPaymentProps {
  signupData: SignupData;
  selectedPlan: 'basic' | 'advanced';
  onSuccess: () => void;
  onBack: () => void;
}

declare global {
  interface Window {
    Rebill: any;
  }
}

export const RebillPayment = ({ signupData, selectedPlan, onSuccess, onBack }: RebillPaymentProps) => {
  const rebillRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutInstance, setCheckoutInstance] = useState<any>(null);

  useEffect(() => {
    const loadRebillSDK = () => {
      // Check if Rebill script is already loaded
      if (window.Rebill) {
        initializeCheckout();
        return;
      }

      // Load Rebill SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.rebill.com/v3/rebill.js';
      script.async = true;
      script.onload = () => {
        console.log('Rebill SDK loaded');
        initializeCheckout();
      };
      script.onerror = () => {
        console.error('Failed to load Rebill SDK');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    };

    const initializeCheckout = async () => {
      try {
        // Get the public key and plan IDs from environment or fetch from your backend
        const publicKey = 'pk_test_55aa330e-134e-4885-9a2f-438ce6899e49';
        const planId = selectedPlan === 'basic' 
          ? '7b84fcc7-e894-42a8-b2df-7fad0c3c5000' 
          : '204fc36f-ed5b-4925-9182-76d3b371e444';

        if (!window.Rebill) {
          throw new Error('Rebill SDK not loaded');
        }

        // Initialize Rebill
        const rebill = new window.Rebill(publicKey);
        
        // Create checkout instance
        const checkout = rebill.checkout.create({
          id: planId,
          currency: 'USD',
          quantity: 1,
        });

        // Hide some sections since we'll manage customer data externally
        checkout.display({
          customerInformation: false,
          billing: false,
          userLogin: false,
        });

        // Set customer data
        checkout.set({
          customerInformation: {
            email: signupData.email,
            name: signupData.restaurantName,
            phone: signupData.phone,
          },
          billing: {
            address: signupData.customDomain || '',
            city: '',
            country: 'PE',
            zipCode: '',
          }
        });

        // Mount the checkout
        await checkout.mount('rebill-checkout');
        
        setCheckoutInstance(checkout);
        setIsLoading(false);

        // Listen for successful payment
        checkout.on('success', (data: any) => {
          console.log('Payment successful:', data);
          onSuccess();
        });

        checkout.on('error', (error: any) => {
          console.error('Payment error:', error);
        });

      } catch (error) {
        console.error('Error initializing Rebill checkout:', error);
        setIsLoading(false);
      }
    };

    loadRebillSDK();
  }, [signupData, selectedPlan, onSuccess]);

  const planDetails = selectedPlan === 'basic' 
    ? { name: 'Plan Básico', price: '$29', features: ['Sitio web profesional', 'Dominio personalizado', 'Soporte por email'] }
    : { name: 'Plan Avanzado', price: '$49', features: ['Sitio web profesional', 'Dominio personalizado', 'Soporte prioritario', 'Analytics avanzados', 'Integraciones premium'] };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Completar Pago
          </h1>
          <p className="text-muted-foreground">
            Para {signupData.restaurantName} • {signupData.subdomain}.mirestaurante.online
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Summary */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {planDetails.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-primary">{planDetails.price}/mes</div>
            <div className="space-y-2">
              <h4 className="font-semibold">Incluye:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Información de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Cargando formulario de pago...</p>
                </div>
              </div>
            ) : (
              <div id="rebill-checkout" ref={rebillRef} className="min-h-[400px]">
                {/* Rebill checkout will be mounted here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};