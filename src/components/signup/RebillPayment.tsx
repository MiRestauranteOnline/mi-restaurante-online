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
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutInstance, setCheckoutInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
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
        if (mounted) {
          // Add a small delay to ensure DOM is ready
          setTimeout(() => initializeCheckout(), 100);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Rebill SDK');
        if (mounted) {
          setError('Error al cargar el sistema de pago');
          setIsLoading(false);
        }
      };
      
      document.head.appendChild(script);
    };

    const initializeCheckout = async () => {
      try {
        if (!mounted) return;
        
        // Check if the container element exists
        const container = document.getElementById('rebill-checkout');
        if (!container) {
          console.error('Rebill container not found');
          setTimeout(() => initializeCheckout(), 100);
          return;
        }

        // Get the public key and plan IDs
        const publicKey = 'pk_test_55aa330e-134e-4885-9a2f-438ce6899e49';
        const planId = selectedPlan === 'basic' 
          ? '7b84fcc7-e894-42a8-b2df-7fad0c3c5000' 
          : '204fc36f-ed5b-4925-9182-76d3b371e444';

        if (!window.Rebill) {
          throw new Error('Rebill SDK not loaded');
        }

        console.log('Initializing Rebill with plan:', planId);

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

        console.log('Mounting checkout to container');
        
        // Mount the checkout
        await checkout.mount('rebill-checkout');
        
        if (mounted) {
          setCheckoutInstance(checkout);
          setIsLoading(false);
          console.log('Rebill checkout mounted successfully');
        }

        // Listen for successful payment
        checkout.on('success', (data: any) => {
          console.log('Payment successful:', data);
          onSuccess();
        });

        checkout.on('error', (error: any) => {
          console.error('Payment error:', error);
          if (mounted) {
            setError('Error en el procesamiento del pago');
          }
        });

      } catch (error) {
        console.error('Error initializing Rebill checkout:', error);
        if (mounted) {
          setError('Error al inicializar el sistema de pago');
          setIsLoading(false);
        }
      }
    };

    loadRebillSDK();

    return () => {
      mounted = false;
    };
  }, [signupData, selectedPlan, onSuccess]);

  const planDetails = selectedPlan === 'basic' 
    ? { name: 'Plan Básico', price: '$49', features: ['Sitio web profesional', 'Dominio personalizado', 'Soporte por email', 'Hasta 100 productos en menú'] }
    : { name: 'Plan Avanzado', price: '$79', features: ['Sitio web profesional', 'Dominio personalizado', 'Soporte prioritario', 'Analytics avanzados', 'Integraciones premium', 'Productos ilimitados', 'SEO optimizado'] };

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
                <div className="text-center space-y-4">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Cargando formulario de pago...</p>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Cuenta Rebill en revisión:</strong> Mientras se activa tu cuenta de pagos, 
                      puedes continuar creando tu sitio web sin pagar.
                    </p>
                    <Button 
                      className="mt-3" 
                      onClick={() => {
                        console.log('Bypassing payment for demo');
                        onSuccess();
                      }}
                      variant="outline"
                    >
                      Continuar sin Pago (Demo)
                    </Button>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <p className="text-red-500">{error}</p>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Problema con Rebill:</strong> Tu cuenta de pagos aún está en revisión. 
                      Puedes continuar creando tu sitio web mientras tanto.
                    </p>
                    <Button 
                      className="mt-3" 
                      onClick={() => {
                        console.log('Bypassing payment due to error');
                        onSuccess();
                      }}
                      variant="outline"
                    >
                      Continuar sin Pago (Demo)
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div id="rebill-checkout" className="min-h-[400px]">
                {/* Rebill checkout will be mounted here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};