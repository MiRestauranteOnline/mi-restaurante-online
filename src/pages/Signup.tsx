import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SignupStep1 } from "@/components/signup/SignupStep1";
import { SignupStep2 } from "@/components/signup/SignupStep2";
import { SignupStep3Combined, type CombinedData } from "@/components/signup/SignupStep3Combined";
import { SignupStep4OpeningHours, type OpeningHoursData } from "@/components/signup/SignupStep4OpeningHours";
import { SignupStep5Images, type ImagesData } from "@/components/signup/SignupStep5Images";
import { SignupSuccess } from "@/components/signup/SignupSuccess";
import { CouponInput } from "@/components/signup/CouponInput";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";
import { IzipayPaymentForm } from "@/components/IzipayPaymentForm";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get step from URL or default to 1
  const urlStep = parseInt(searchParams.get('step') || '1');
  const [currentStep, setCurrentStep] = useState(urlStep);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced'>('basic');
  
  // Persist and restore signup data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('signupProgress');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.signupData) setSignupData(parsed.signupData);
        if (parsed.websiteRequirements) setWebsiteRequirements(parsed.websiteRequirements);
        if (parsed.combinedData) setCombinedData(parsed.combinedData);
        if (parsed.openingHoursData) setOpeningHoursData(parsed.openingHoursData);
        if (parsed.imagesData) setImagesData(parsed.imagesData);
        if (parsed.selectedPlan) setSelectedPlan(parsed.selectedPlan);
        if (parsed.createdClientId) setCreatedClientId(parsed.createdClientId);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      } catch (e) {
        console.error('Error restoring signup progress:', e);
      }
    }
  }, []);
  
  // Update URL when step changes
  useEffect(() => {
    const newStep = currentStep.toString();
    if (searchParams.get('step') !== newStep) {
      setSearchParams({ step: newStep });
    }
  }, [currentStep, searchParams, setSearchParams]);
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
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [createdClientId, setCreatedClientId] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalAmount: number } | null>(null);
  const { toast } = useToast();

  // Reset processing states on mount to prevent stuck loading states
  React.useEffect(() => {
    console.log('🔄 Resetting processing states on mount');
    setIsProcessingPayment(false);
    setIsProcessingFinalStep(false);
  }, []);

  const handleStep1Complete = async (formData: SignupData, plan: 'basic' | 'advanced') => {
    const updatedData = { ...formData, plan_type: plan };
    setSignupData(updatedData);
    setSelectedPlan(plan);
    
    // Save progress to localStorage
    saveProgress(updatedData, websiteRequirements, combinedData, openingHoursData, imagesData, plan, createdClientId, 1);
    
    setIsProcessingPayment(true);

    // Safety timeout to reset loading state if step transition fails
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ Safety timeout triggered - resetting loading state');
      setIsProcessingPayment(false);
    }, 10000); // 10 seconds
    
    // Fetch plan pricing from database
    try {
      const { data: planData, error } = await supabase
        .from('subscription_plans')
        .select('monthly_price')
        .eq('plan_key', plan)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      const amount = planData?.monthly_price || (plan === 'basic' ? 49 : 99);
      setOriginalAmount(amount);
      setPaymentAmount(amount);
    } catch (error) {
      console.error('Error fetching plan price:', error);
      const amount = plan === 'basic' ? 49 : 99;
      setOriginalAmount(amount);
      setPaymentAmount(amount);
    }
    
    try {
      console.log('Creating account for:', formData, 'with plan:', plan);

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
          paymentId: 'pending',
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
        const backendMsg = data && (data as any).error ? (data as any).error : error.message;
        throw new Error(backendMsg || 'Error en el servidor');
      }
      
      // Check if response contains an error (success: false cases)
      if ((data as any)?.error || (data as any)?.success === false) {
        console.error('Response contains error:', (data as any).error);
        throw new Error((data as any).error || 'Error desconocido del servidor');
      }
      
      if (data?.success && data?.client?.id) {
        console.log('✅ Account created successfully, moving to step 2:', data);
        clearTimeout(safetyTimeout);
        const newClientId = data.client.id;
        setCreatedClientId(newClientId);
        const finalData = { ...updatedData, paymentId: newClientId };
        setSignupData(finalData);
        
        // Save progress before moving to payment
        saveProgress(finalData, websiteRequirements, combinedData, openingHoursData, imagesData, plan, newClientId, 2);
        
        setIsProcessingPayment(false);
        console.log('🔄 Setting currentStep to 2');
        setCurrentStep(2);
        toast({
          title: "Cuenta creada",
          description: "Ahora completa el pago para activar tu suscripción.",
        });
      } else {
        console.error('❌ Unexpected server response format:', data);
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      clearTimeout(safetyTimeout); // Clear safety timeout on error
      setIsProcessingPayment(false);
      const errorMessage = (error && error.message) || 'Error al procesar el registro. Por favor contacta soporte.';
      toast({ title: 'No pudimos crear tu cuenta', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleCouponApplied = (coupon: { code: string; discountAmount: number; finalAmount: number } | null) => {
    setAppliedCoupon(coupon);
    if (coupon) {
      setPaymentAmount(coupon.finalAmount);
    } else {
      setPaymentAmount(originalAmount);
    }
  };

  const handlePaymentSuccess = () => {
    // Save progress and move to requirements step after successful payment
    saveProgress(signupData, websiteRequirements, combinedData, openingHoursData, imagesData, selectedPlan, createdClientId, 3);
    setCurrentStep(3);
  };
  
  // Helper function to save progress
  const saveProgress = (
    signup: SignupData,
    requirements: WebsiteRequirements,
    combined: CombinedData,
    hours: OpeningHoursData,
    images: ImagesData,
    plan: 'basic' | 'advanced',
    clientId: string,
    step: number
  ) => {
    localStorage.setItem('signupProgress', JSON.stringify({
      signupData: signup,
      websiteRequirements: requirements,
      combinedData: combined,
      openingHoursData: hours,
      imagesData: images,
      selectedPlan: plan,
      createdClientId: clientId,
      currentStep: step,
      timestamp: Date.now()
    }));
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Error en el pago",
      description: error,
      variant: "destructive",
    });
  };

  const handlePaymentCancel = () => {
    setCurrentStep(1);
  };

  const handleStep2Complete = async (requirements: WebsiteRequirements) => {
    setWebsiteRequirements(requirements);
    saveProgress(signupData, requirements, combinedData, openingHoursData, imagesData, selectedPlan, createdClientId, 4);
    setCurrentStep(4); // Move to menu step
    window.scrollTo(0, 0);
  };

  const handleStep3Complete = async (combined: CombinedData) => {
    setCombinedData(combined);
    saveProgress(signupData, websiteRequirements, combined, openingHoursData, imagesData, selectedPlan, createdClientId, 5);
    setCurrentStep(5); // Move to opening hours step
    window.scrollTo(0, 0);
  };

  const handleStep4Complete = async (openingHours: OpeningHoursData) => {
    setOpeningHoursData(openingHours);
    saveProgress(signupData, websiteRequirements, combinedData, openingHours, imagesData, selectedPlan, createdClientId, 6);
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
    
    // Clear saved progress on completion
    localStorage.removeItem('signupProgress');
    
    setCurrentStep(7); // Move to success step
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
                </>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Información de Pago</h2>
                    <p className="text-muted-foreground">
                      Completa tu pago para activar tu suscripción {selectedPlan === 'basic' ? 'Básica' : 'Avanzada'}
                    </p>
                  </div>

                  <CouponInput
                    planType={selectedPlan}
                    amount={originalAmount}
                    onCouponApplied={handleCouponApplied}
                  />

                  {createdClientId && signupData.email && paymentAmount > 0 ? (
                    <DebugErrorBoundary>
                      <IzipayPaymentForm
                        amount={paymentAmount * 100}
                        currency="PEN"
                        orderId={createdClientId}
                        customerEmail={signupData.email}
                        metadata={{
                          planType: selectedPlan,
                          restaurantName: signupData.restaurantName,
                        }}
                        isSubscription={true}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </DebugErrorBoundary>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-destructive">Error: Missing payment information. Please go back to step 1.</p>
                        <Button onClick={() => setCurrentStep(1)} className="mt-4">
                          Go Back
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              
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