import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SignupStep1 } from "@/components/signup/SignupStep1";
import { SignupStep2 } from "@/components/signup/SignupStep2";
import { SignupStep3Combined, type CombinedData } from "@/components/signup/SignupStep3Combined";
import { SignupStep4OpeningHours, type OpeningHoursData } from "@/components/signup/SignupStep4OpeningHours";
import { SignupStep5Images, type ImagesData } from "@/components/signup/SignupStep5Images";
import { SignupStep6FAQs, type FAQsData } from "@/components/signup/SignupStep6FAQs";
import { SignupSuccess } from "@/components/signup/SignupSuccess";
import { CouponInput } from "@/components/signup/CouponInput";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";
import OpenPayPaymentForm from "@/components/OpenPayPaymentForm";

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
  locked_basic_price?: number;
  locked_advanced_price?: number;
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
  faviconUrl?: string;
  additionalInfo: string;
  websiteStyle: string;
  template_id?: string;
  theme: string;
  primary_color: string;
  title_font: string;
  title_font_weight: string;
  body_font: string;
}

const Signup = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced'>('basic');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [createdClientId, setCreatedClientId] = useState<string>("");
  
  // Fetch client data and determine current step from database
  useEffect(() => {
    const initializeSignupFlow = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not logged in - show step 1
          console.log('No session found, showing step 1');
          setCurrentStep(1);
          setIsAuthChecking(false);
          return;
        }

        console.log('Session found, fetching client data for user:', session.user.id);

        // Fetch client associated with this user
        const { data: userClient, error: clientError } = await supabase
          .from('user_clients')
          .select(`
            client_id,
            clients!inner(
              id,
              restaurant_name,
              subdomain,
              email,
              phone,
              address,
              plan_type,
              subscription_status,
              opening_hours,
              signup_completed
            )
          `)
          .eq('user_id', session.user.id)
          .single();

        if (clientError || !userClient) {
          console.log('No client found for user, showing step 1');
          setCurrentStep(1);
          setIsAuthChecking(false);
          return;
        }

        const client = userClient.clients as any;
        console.log('Client found:', client);

        setCreatedClientId(client.id);
        setSelectedPlan(client.plan_type || 'basic');
        setSignupData(prev => ({
          ...prev,
          email: client.email || session.user.email,
          restaurantName: client.restaurant_name,
          subdomain: client.subdomain,
          phone: client.phone || '',
          address: client.address || '',
          plan_type: client.plan_type,
        }));

        // Determine current step based on database state
        if (client.signup_completed) {
          // Signup fully completed - redirect to dashboard
          console.log('Signup completed, redirecting to dashboard');
          navigate('/client', { replace: true });
          return;
        }

        // Step 2: Payment pending
        if (client.subscription_status === 'pending') {
          console.log('Payment pending, showing step 2');
          setCurrentStep(2);
          setIsAuthChecking(false);
          return;
        }

        // Step 3: No opening hours
        if (!client.opening_hours || Object.keys(client.opening_hours).length === 0) {
          console.log('No opening hours, showing step 3');
          setCurrentStep(3);
          setIsAuthChecking(false);
          return;
        }

        // Step 4: Check for images
        const { data: images } = await supabase
          .from('carousel_images')
          .select('id')
          .eq('client_id', client.id)
          .eq('is_active', true);

        if (!images || images.length === 0) {
          console.log('No images, showing step 4');
          setCurrentStep(4);
          setIsAuthChecking(false);
          return;
        }

        // Step 5: Check for FAQs
        const { data: faqs } = await supabase
          .from('faqs')
          .select('id')
          .eq('client_id', client.id)
          .eq('is_active', true);

        if (!faqs || faqs.length === 0) {
          console.log('No FAQs, showing step 5');
          setCurrentStep(5);
          setIsAuthChecking(false);
          return;
        }

        // All steps complete - call complete-signup edge function
        console.log('All steps appear complete, calling complete-signup function');
        const { error: completeError } = await supabase.functions.invoke('complete-signup');
        
        if (completeError) {
          console.error('Error completing signup:', completeError);
          toast({
            title: "Error",
            description: "No se pudo completar el registro. Contacta soporte.",
            variant: "destructive",
          });
        } else {
          console.log('Signup marked as completed, redirecting to dashboard');
          navigate('/client', { replace: true });
          return;
        }

      } catch (error) {
        console.error('Error initializing signup flow:', error);
        setCurrentStep(1);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initializeSignupFlow();
  }, [navigate, toast]);
  
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
    websiteStyle: "",
    theme: "dark",
    primary_color: "#FFD700",
    title_font: "Cormorant Garamond",
    title_font_weight: "400",
    body_font: "Inter",
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
    image_preference: 'ai_only',
    carousel_enabled: false,
    carousel_images: [],
    custom_images_enabled: false,
    custom_images: [],
  });
  const [faqsData, setFaqsData] = useState<FAQsData>({
    faqs: [],
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingFinalStep, setIsProcessingFinalStep] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalAmount: number } | null>(null);

  // Update URL to show current step (for UX only, not used for state)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('step', currentStep.toString());
    setSearchParams(params, { replace: true });
  }, [currentStep, setSearchParams]);

  const handleStep1Complete = async (formData: SignupData, plan: 'basic' | 'advanced') => {
    const updatedData = { ...formData, plan_type: plan };
    setSignupData(updatedData);
    setSelectedPlan(plan);
    setIsProcessingPayment(true);
    
    // Fetch plan pricing from database - both plans for locking
    try {
      const { data: planData, error } = await supabase
        .from('subscription_plans')
        .select('plan_key, monthly_price')
        .eq('is_active', true)
        .in('plan_key', ['basic', 'advanced']);

      if (error) throw error;

      const basicPrice = planData?.find(p => p.plan_key === 'basic')?.monthly_price || 49;
      const advancedPrice = planData?.find(p => p.plan_key === 'advanced')?.monthly_price || 99;
      
      const amount = plan === 'basic' ? basicPrice : advancedPrice;
      setOriginalAmount(amount);
      setPaymentAmount(amount);
      
      // Store both prices for later use when creating the client
      signupData.locked_basic_price = basicPrice;
      signupData.locked_advanced_price = advancedPrice;
    } catch (error) {
      console.error('Error fetching plan price:', error);
      const amount = plan === 'basic' ? 49 : 99;
      setOriginalAmount(amount);
      setPaymentAmount(amount);
      signupData.locked_basic_price = 49;
      signupData.locked_advanced_price = 99;
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
          locked_basic_price: updatedData.locked_basic_price,
          locked_advanced_price: updatedData.locked_advanced_price,
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
        console.log('✅ Account created successfully');
        const newClientId = data.client.id;
        setCreatedClientId(newClientId);
        const finalData = { ...updatedData, paymentId: newClientId };
        setSignupData(finalData);
        
        // CRITICAL: Set session using OTP token from server (bypasses CAPTCHA)
        if (data.loginToken) {
          console.log('🔐 Verifying OTP token from server...');
          const { error: otpError } = await supabase.auth.verifyOtp({
            email: data.loginToken.email,
            token_hash: data.loginToken.token_hash,
            type: 'magiclink',
          });
          
          if (otpError) {
            console.error('❌ Failed to verify OTP:', otpError);
            toast({
              title: "Error de sesión",
              description: "Cuenta creada pero hubo un problema con la sesión. Por favor inicia sesión.",
              variant: "destructive",
            });
          } else {
            console.log('✅ Session established successfully via OTP');
            // Ensure session is persisted
            let tries = 0;
            let sessionOk = false;
            while (tries < 5 && !sessionOk) {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                sessionOk = true;
                break;
              }
              await new Promise(r => setTimeout(r, 200));
              tries++;
            }
          }
        }
        
        setIsProcessingPayment(false);
        setCurrentStep(2);
        window.scrollTo(0, 0); // Scroll to top when moving to payment step
        toast({
          title: "¡Bienvenido!",
          description: "Ahora completa el pago para activar tu suscripción.",
        });
      } else {
        console.error('❌ Unexpected server response format:', data);
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
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
    console.log('✅ Payment successful, moving to step 3');
    setCurrentStep(3);
  };
  
  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
    toast({
      title: "Pago cancelado",
      description: "Puedes intentar nuevamente cuando estés listo.",
    });
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast({
      title: "Error en el pago",
      description: error || "Hubo un problema procesando tu pago. Por favor intenta nuevamente.",
      variant: "destructive",
    });
  };

  const handleStep2Complete = async (requirements: WebsiteRequirements) => {
    setWebsiteRequirements(requirements);
    setCurrentStep(4); // Skip to menu step (step 4 in old flow is step 3 in new flow)
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
    setCurrentStep(7); // Move to FAQs step
    window.scrollTo(0, 0);
  };

  const handleStep6Complete = async (faqs: FAQsData) => {
    setIsProcessingFinalStep(true);
    setFaqsData(faqs);
    
    try {
      console.log('✅ All steps completed, calling complete-signup function');
      
      const { error } = await supabase.functions.invoke('complete-signup');
      
      if (error) {
        console.error('Error completing signup:', error);
        throw error;
      }
      
      console.log('✅ Signup completed successfully');
      setIsProcessingFinalStep(false);
      
      // Redirect to success page
      navigate('/signup-success');
    } catch (error: any) {
      console.error('Error in final step:', error);
      setIsProcessingFinalStep(false);
      toast({
        title: "Error",
        description: error.message || "No se pudo completar el registro. Por favor contacta soporte.",
        variant: "destructive",
      });
    }
  };

  // Fallback: ensure payment amount is set if needed
  useEffect(() => {
    const ensureAmount = async () => {
      if (currentStep >= 2 && paymentAmount === 0) {
        try {
          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('plan_key, monthly_price')
            .eq('is_active', true)
            .in('plan_key', ['basic', 'advanced']);
          if (planData) {
            const basicPrice = planData.find(p => p.plan_key === 'basic')?.monthly_price || 49;
            const advancedPrice = planData.find(p => p.plan_key === 'advanced')?.monthly_price || 99;
            const amount = selectedPlan === 'basic' ? basicPrice : advancedPrice;
            setOriginalAmount(amount);
            setPaymentAmount(amount);
          }
        } catch (e) {
          console.error('Failed to ensure payment amount:', e);
        }
      }
    };
    ensureAmount();
  }, [currentStep, paymentAmount, selectedPlan]);

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

  const handleBackToStep5 = () => {
    setCurrentStep(6);
    window.scrollTo(0, 0);
  };

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
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
                  7
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">FAQs</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep > 7 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 8 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 8 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
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

                  {createdClientId ? (
                    paymentAmount > 0 ? (
                      <DebugErrorBoundary>
                        <OpenPayPaymentForm
                          clientId={createdClientId}
                          planType={selectedPlan}
                          customerName={signupData.restaurantName || ''}
                          customerEmail={signupData.email || ''}
                          customerPhone={signupData.phone || ''}
                          couponCode={appliedCoupon?.code}
                          onSuccess={handlePaymentSuccess}
                          onCancel={handlePaymentCancel}
                        />
                      </DebugErrorBoundary>
                    ) : (
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">Cargando información de pago...</p>
                        </CardContent>
                      </Card>
                    )
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
              />
              )}
              
              {currentStep === 7 && (
                <SignupStep6FAQs
                  onComplete={handleStep6Complete}
                  onBack={handleBackToStep5}
                  initialData={faqsData}
                  isProcessing={isProcessingFinalStep}
                />
              )}
              
              {currentStep === 8 && (() => {
                // Navigate to success page with data
                navigate('/registro-exitoso', {
                  state: {
                    signupData,
                    websiteRequirements
                  },
                  replace: true
                });
                return null;
              })()}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signup;