import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SignupStep1 } from "@/components/signup/SignupStep1";
import { SignupStep2 } from "@/components/signup/SignupStep2";
import { SignupStep3Combined, type CombinedData } from "@/components/signup/SignupStep3Combined";
import { SignupStep4OpeningHours, type OpeningHoursData } from "@/components/signup/SignupStep4OpeningHours";
import { SignupStep5Images, type ImagesData } from "@/components/signup/SignupStep5Images";
import { SignupSuccess } from "@/components/signup/SignupSuccess";
import { Card, CardContent } from "@/components/ui/card";
// import { EmbeddedPayment } from "@/components/signup/EmbeddedPayment";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SignupData {
  email: string;
  password: string;
  restaurantName: string;
  subdomain: string;
  phone: string;
  phone_country_code?: string;
  whatsapp_country_code?: string;
  address: string; // New address field
  paymentId?: string;
  hasCustomDomain?: boolean;
  customDomain?: string;
  referralSource?: string;
  plan_type?: 'basic' | 'advanced';
}

export interface SocialMedia {
  platform: string;
  url: string;
}

export interface WebsiteRequirements {
  businessType: string;
  targetAudience: string;
  downloadableMenuUrl?: string;
  socialMedia: SocialMedia[];
  hasDelivery: boolean;
  deliveryPlatforms: {
    rappi?: string;
    pedidosya?: string;
    didifood?: string;
  };
  deliveryPhoneWhatsapp: string;
  logoUrl: string;
  additionalInfo: string;
  brandInfo?: string;
  websiteStyle: string;
}

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced'>('basic');
  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    password: "",
    restaurantName: "",
    subdomain: "",
    phone: "",
    address: "", // New address field
    hasCustomDomain: false,
    customDomain: "",
    referralSource: "",
  });
  const [websiteRequirements, setWebsiteRequirements] = useState<WebsiteRequirements>({
    businessType: "",
    targetAudience: "",
    socialMedia: [],
    hasDelivery: false,
    deliveryPlatforms: {},
    deliveryPhoneWhatsapp: "",
    logoUrl: "",
    additionalInfo: "",
    brandInfo: "",
    websiteStyle: "",
  });
  const [combinedData, setCombinedData] = useState<CombinedData>({
    categories: [],
    items: [],
    reviews: [],
    teamMembers: [],
  });
  const [openingHoursData, setOpeningHoursData] = useState<OpeningHoursData>({
    opening_hours: {},
  });
  const [imagesData, setImagesData] = useState<ImagesData>({
    carousel_enabled: false,
    carousel_images: [],
    custom_images_enabled: false,
    custom_images: [],
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingFinalStep, setIsProcessingFinalStep] = useState(false);
  const { toast } = useToast();

  const handleStep1Complete = async (formData: SignupData, plan: 'basic' | 'advanced') => {
    const updatedData = { ...formData, plan_type: plan };
    setSignupData(updatedData);
    setSelectedPlan(plan);
    setIsProcessingPayment(true);
    
    try {
      console.log('Creating account and initiating payment for:', formData, 'with plan:', plan);
      
      // Fetch payment settings to check test mode
      const { data: paymentSettings } = await supabase
        .from('payment_settings')
        .select('test_mode, test_payer_email')
        .single();

      console.log('Payment settings:', paymentSettings);

      // Create account using public signup function
      const { data, error } = await supabase.functions.invoke('signup-client', {
        body: {
          email: formData.email,
          password: formData.password,
          restaurantName: formData.restaurantName,
          subdomain: formData.subdomain.toLowerCase(),
          phone: formData.phone,
          phone_country_code: formData.phone_country_code,
          whatsapp_country_code: formData.whatsapp_country_code,
          address: formData.address,
          paymentId: 'pending-mercadopago',
          customDomain: formData.customDomain,
          referralSource: formData.referralSource,
          plan_type: plan,
          signupFormData: formData,
          websiteRequirements: websiteRequirements,
        },
      });

      console.log('Signup response received:', { data, error });

      if (error) {
        console.error('Edge function error:', error, 'response data:', data);
        // Try to surface backend error (we return 200 on handled errors)
        const backendMsg = data && (data as any).error ? (data as any).error : error.message;
        throw new Error(backendMsg || 'Error en el servidor');
      }
      
      if ((data as any)?.error) {
        console.error('Response contains error:', (data as any).error);
        throw new Error((data as any).error);
      }
      
      if (data?.success && data?.client?.id) {
        console.log('Account created successfully:', data);
        // Save client id to use during payment
        setSignupData({ ...updatedData, paymentId: data.client.id });
        setIsProcessingPayment(false);
        // Go to embedded payment step
        // setCurrentStep(2); // Payment shown within Step 1
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error: any) {
      console.error('Account creation/payment error:', error);
      setIsProcessingPayment(false);
      const errorMessage = (error && error.message) || 'Error al procesar el registro. Por favor contacta soporte.';
      toast({ title: 'No pudimos crear tu cuenta', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleStep2Complete = async (requirements: WebsiteRequirements) => {
    setWebsiteRequirements(requirements);
    setCurrentStep(4); // Move to menu step
    window.scrollTo(0, 0);
  };

  const handleStep3Complete = async (combined: CombinedData) => {
    setCombinedData(combined);
    setCurrentStep(5); // Move to opening hours step
    window.scrollTo(0, 0);
  };

  const handleStep4Complete = async (openingHours: OpeningHoursData) => {
    setOpeningHoursData(openingHours);
    setCurrentStep(6); // Move to images step
    window.scrollTo(0, 0);
  };

  const handleStep5Complete = async (images: ImagesData) => {
    setImagesData(images);
    setIsProcessingFinalStep(true);
    
    try {
      // Create briefing summaries from accumulated data
      const contentBriefing = `${websiteRequirements.additionalInfo}\n\nTipo de restaurante: ${websiteRequirements.businessType}\nPúblico objetivo: ${websiteRequirements.targetAudience}\nEstilo del sitio web: ${websiteRequirements.websiteStyle}`;
      
      const styleBriefing = `Estilo del sitio web: ${websiteRequirements.websiteStyle}\nInformación de marca: ${websiteRequirements.brandInfo || 'No especificado'}\nLogo: ${websiteRequirements.logoUrl ? 'Proporcionado' : 'No proporcionado'}`;
      
      const contactDeliveryBriefing = `Nombre del restaurante: ${signupData.restaurantName}\nTeléfono: ${signupData.phone}\nEmail: ${signupData.email}\nDirección: ${signupData.address}\nTiene delivery: ${websiteRequirements.hasDelivery ? 'Sí' : 'No'}\nPlatformas de delivery: ${Object.entries(websiteRequirements.deliveryPlatforms).filter(([_, url]) => url).map(([platform, _]) => platform).join(', ')}\nDelivery por WhatsApp/Teléfono: ${websiteRequirements.deliveryPhoneWhatsapp}\nRedes sociales: ${websiteRequirements.socialMedia.map(sm => `${sm.platform}: ${sm.url}`).join(', ')}`;

      // Store the briefings and initial data in the database
      const { error } = await supabase.functions.invoke('store-briefings', {
        body: {
          clientId: signupData.subdomain, // We'll use subdomain to identify the client
          contentBriefing,
          styleBriefing,
          contactDeliveryBriefing,
          signupData,
          websiteRequirements: { ...websiteRequirements, plan_type: signupData.plan_type || 'basic' },
          menuData: { categories: combinedData.categories, items: combinedData.items },
          reviewsData: { reviews: combinedData.reviews },
          teamData: { teamMembers: combinedData.teamMembers },
          openingHoursData,
          imagesData: images
        }
      });

      if (error) {
        console.error('Error storing briefings:', error);
      } else {
        // Automatically trigger content generation after successful registration
        console.log('Briefings stored successfully, triggering automatic content generation...');
        
        // Trigger content generation in the background (don't wait for it)
        supabase.functions.invoke('generate-client-content', {
          body: {
            briefing: contentBriefing,
            clientId: signupData.subdomain,
            restaurantName: signupData.restaurantName,
            address: signupData.address
          }
        }).then(({ error: contentError }) => {
          if (contentError) {
            console.error('Error triggering automatic content generation:', contentError);
          } else {
            console.log('Automatic content generation triggered successfully');
          }
        });
      }
    } catch (error) {
      console.error('Error processing briefings:', error);
    } finally {
      setIsProcessingFinalStep(false);
    }
    
    setCurrentStep(7); // Move to success step
  };

  const startCheckout = async () => {
    try {
      setIsProcessingPayment(true);
      const { data, error } = await supabase.functions.invoke('create-mercadopago-checkout', {
        body: {
          customerEmail: signupData.email,
          customerName: signupData.restaurantName,
          clientId: signupData.paymentId,
          planType: selectedPlan,
        },
      });
      if (error || !data?.success) {
        throw new Error((data as any)?.error || (error as any)?.message || 'No se pudo iniciar el pago');
      }
      const url = (data as any).initPoint || (data as any).sandbox_init_point;
      if (!url) throw new Error('URL de pago no recibida');
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout redirect error:', err);
      toast({ title: 'Error al iniciar pago', description: err.message || 'Inténtalo nuevamente', variant: 'destructive' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(3);
    window.scrollTo(0, 0);
  };

  const handleBackToStep3 = () => {
    setCurrentStep(4);
    window.scrollTo(0, 0);
  };

  const handleBackToStep4 = () => {
    setCurrentStep(5);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 overflow-x-auto">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  1
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Información</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep > 1 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Pago</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep > 2 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Requisitos</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep > 3 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 4 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  4
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Contenido</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep > 4 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 5 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  5
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Horarios</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep > 5 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 6 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 6 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  6
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Imágenes</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep > 6 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 7 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 7 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  ✓
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Listo</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <Card className="border-border">
            <CardContent className="p-8">
              {currentStep === 1 && (
                <>
                  <SignupStep1 
                    onComplete={handleStep1Complete}
                    initialData={signupData}
                    isProcessingPayment={isProcessingPayment}
                  />
                  {signupData.paymentId && (
                    <div className="mt-8 flex items-center justify-between border rounded-lg p-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan seleccionado</p>
                        <p className="text-lg font-semibold">{selectedPlan === 'basic' ? 'Básico' : 'Avanzado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-semibold">S/ {selectedPlan === 'basic' ? 297 : 497} / mes</p>
                      </div>
                      <Button onClick={startCheckout} disabled={isProcessingPayment}>
                        {isProcessingPayment ? 'Redirigiendo…' : 'Pagar con tarjeta'}
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {currentStep === 2 && null}
              
              {currentStep === 3 && (
                <SignupStep2 
                  onComplete={handleStep2Complete}
                  onBack={() => setCurrentStep(2)}
                  signupData={signupData}
                  initialData={websiteRequirements}
                />
              )}

              {currentStep === 4 && (
                <SignupStep3Combined 
                  onComplete={handleStep3Complete}
                  onBack={() => setCurrentStep(3)}
                  onSkip={() => setCurrentStep(5)}
                  initialData={combinedData}
                />
              )}

              {currentStep === 5 && (
                <SignupStep4OpeningHours 
                  onComplete={handleStep4Complete}
                  onBack={() => setCurrentStep(4)}
                  initialData={openingHoursData}
                />
              )}

              {currentStep === 6 && (
              <SignupStep5Images
                onComplete={handleStep5Complete}
                onBack={() => setCurrentStep(5)}
                initialData={imagesData}
                isProcessingFinalStep={isProcessingFinalStep}
              />
              )}
              
              {currentStep === 7 && (
                <SignupSuccess 
                  signupData={signupData}
                  websiteRequirements={websiteRequirements}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signup;