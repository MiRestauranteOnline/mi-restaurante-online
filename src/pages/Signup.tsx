import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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
  additionalInfo: string;
  brandInfo?: string;
  websiteStyle: string;
}

const Signup = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get step from URL or default to 1
  const urlStep = parseInt(searchParams.get('step') || '1');
  const urlPlan = searchParams.get('plan') as 'basic' | 'advanced' | null;
  const urlClient = searchParams.get('client');
  const [currentStep, setCurrentStep] = useState(urlStep);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced'>(urlPlan || 'basic');
  
  // Check auth and restore signup data
  useEffect(() => {
    const checkAuthAndRestoreData = async () => {
      try {
        // 1) Load any saved local progress
        const savedDataRaw = localStorage.getItem('signupProgress');
        let parsedData: any = null;
        if (savedDataRaw) {
          try {
            parsedData = JSON.parse(savedDataRaw);
          } catch (e) {
            console.error('Error parsing saved signupProgress:', e);
          }
        }

        // 2) Ensure user is authenticated; if not, try auto sign-in from saved credentials
        let { data: { session } } = await supabase.auth.getSession();
        if (!session?.user && parsedData?.signupData?.email && parsedData?.signupData?.password) {
          try {
            const { error: signInErr } = await supabase.auth.signInWithPassword({
              email: parsedData.signupData.email,
              password: parsedData.signupData.password,
            });
            if (!signInErr) {
              ({ data: { session } } = await supabase.auth.getSession());
            }
          } catch (autoErr) {
            console.warn('Auto sign-in failed:', autoErr);
          }
        }
        
        // 3) Restore local progress if available
        if (parsedData) {
          if (parsedData.signupData) setSignupData(parsedData.signupData);
          if (parsedData.websiteRequirements) setWebsiteRequirements(parsedData.websiteRequirements);
          if (parsedData.combinedData) setCombinedData(parsedData.combinedData);
          if (parsedData.openingHoursData) setOpeningHoursData(parsedData.openingHoursData);
          if (parsedData.imagesData) setImagesData(parsedData.imagesData);
          if (parsedData.faqsData) setFaqsData(parsedData.faqsData);
          if (parsedData.selectedPlan) setSelectedPlan(parsedData.selectedPlan);
          if (parsedData.createdClientId) setCreatedClientId(parsedData.createdClientId);
          if (parsedData.currentStep) setCurrentStep(Math.max(parsedData.currentStep, urlStep));

          // If we already have a created client from saved progress, recompute payment amounts
          if (parsedData.createdClientId) {
            const b = parsedData.signupData?.locked_basic_price;
            const a = parsedData.signupData?.locked_advanced_price;
            const chosen = (parsedData.selectedPlan as 'basic' | 'advanced') || selectedPlan;
            if (b && a) {
              const amt = chosen === 'basic' ? b : a;
              setOriginalAmount(amt);
              setPaymentAmount(amt);
            }
          }
        }

        // 4) If we are on step 2+ but don't have a client id, resolve it via clients (RLS will scope to current user)
        if (session?.user && urlStep >= 2 && !parsedData?.createdClientId) {
          console.log('Resolving client via clients RLS for user:', session.user.id);
          try {
            const { data: client, error: clientErr } = await supabase
              .from('clients')
              .select('id, restaurant_name, subdomain, email, phone, plan_type, address')
              .order('created_at', { ascending: false })
              .maybeSingle();

            if (!clientErr && client) {
              setCreatedClientId(client.id);
              setSignupData(prev => ({
                ...prev,
                email: client.email || session.user.email || '',
                restaurantName: client.restaurant_name,
                subdomain: client.subdomain,
                phone: client.phone || '',
                address: client.address || '',
                paymentId: client.id,
                plan_type: (client.plan_type as 'basic' | 'advanced') || prev.plan_type,
              }));
              setSelectedPlan((client.plan_type as 'basic' | 'advanced') || 'basic');

              // Fetch current pricing to set payment amounts
              const { data: planData } = await supabase
                .from('subscription_plans')
                .select('plan_key, monthly_price')
                .eq('is_active', true)
                .in('plan_key', ['basic', 'advanced']);
              if (planData) {
                const basicPrice = planData.find(p => p.plan_key === 'basic')?.monthly_price || 49;
                const advancedPrice = planData.find(p => p.plan_key === 'advanced')?.monthly_price || 99;
                const amount = client.plan_type === 'basic' ? basicPrice : advancedPrice;
                setOriginalAmount(amount);
                setPaymentAmount(amount);
              }

              // Persist resolved clientId so future refreshes are instant
              saveProgress(
                {
                  ...signupData,
                  email: client.email || session.user.email || signupData.email,
                  restaurantName: client.restaurant_name || signupData.restaurantName,
                  subdomain: client.subdomain || signupData.subdomain,
                  phone: client.phone || signupData.phone,
                  address: client.address || signupData.address,
                  paymentId: client.id,
                  plan_type: (client.plan_type as 'basic' | 'advanced') || signupData.plan_type,
                },
                websiteRequirements,
                combinedData,
                openingHoursData,
                imagesData,
                faqsData,
                (client.plan_type as 'basic' | 'advanced') || selectedPlan,
                client.id,
                Math.max(2, currentStep)
              );
            } else if (clientErr) {
              console.warn('No client found for current user or access denied:', clientErr);
            }
          } catch (fetchError) {
            console.error('Error resolving client via clients table:', fetchError);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuthAndRestoreData();
  }, [urlStep]);
  
  // URL params sync handled after state declarations
  const [isAuthChecking, setIsAuthChecking] = useState(true);
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
  const [faqsData, setFaqsData] = useState<FAQsData>({
    faqs: [],
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingFinalStep, setIsProcessingFinalStep] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [createdClientId, setCreatedClientId] = useState<string>(urlClient || "");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalAmount: number } | null>(null);
  const { toast } = useToast();

  // Update URL when step, plan or client changes (preserve params)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('step', currentStep.toString());
    if (selectedPlan) params.set('plan', selectedPlan);
    if (createdClientId) params.set('client', createdClientId);
    setSearchParams(params);
  }, [currentStep, selectedPlan, createdClientId, searchParams, setSearchParams]);

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
    saveProgress(updatedData, websiteRequirements, combinedData, openingHoursData, imagesData, faqsData, plan, createdClientId, 1);
    
    setIsProcessingPayment(true);

    // Safety timeout to reset loading state if step transition fails
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ Safety timeout triggered - resetting loading state');
      setIsProcessingPayment(false);
    }, 10000); // 10 seconds
    
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
        console.log('✅ Account created successfully, moving to step 2:', data);
        clearTimeout(safetyTimeout);
        const newClientId = data.client.id;
        setCreatedClientId(newClientId);
        const finalData = { ...updatedData, paymentId: newClientId };
        setSignupData(finalData);
        
        // Sign in the user so they stay authenticated
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: finalData.email,
            password: finalData.password,
          });
          
          if (signInError) {
            console.error('Sign in error:', signInError);
            // Continue anyway, session might still work
          } else {
            console.log('✅ User signed in successfully');
          }
        } catch (signInErr) {
          console.error('Failed to sign in user:', signInErr);
        }
        
        // Save progress before moving to payment
        saveProgress(finalData, websiteRequirements, combinedData, openingHoursData, imagesData, faqsData, plan, newClientId, 2);
        
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
    saveProgress(signupData, websiteRequirements, combinedData, openingHoursData, imagesData, faqsData, selectedPlan, createdClientId, 3);
    setCurrentStep(3);
  };
  
  // Helper function to save progress
  const saveProgress = (
    signup: SignupData,
    requirements: WebsiteRequirements,
    combined: CombinedData,
    hours: OpeningHoursData,
    images: ImagesData,
    faqs: FAQsData,
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
      faqsData: faqs,
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
    saveProgress(signupData, requirements, combinedData, openingHoursData, imagesData, faqsData, selectedPlan, createdClientId, 4);
    setCurrentStep(4); // Move to menu step
    window.scrollTo(0, 0);
  };

  const handleStep3Complete = async (combined: CombinedData) => {
    setCombinedData(combined);
    saveProgress(signupData, websiteRequirements, combined, openingHoursData, imagesData, faqsData, selectedPlan, createdClientId, 5);
    setCurrentStep(5); // Move to opening hours step
    window.scrollTo(0, 0);
  };

  const handleStep4Complete = async (openingHours: OpeningHoursData) => {
    setOpeningHoursData(openingHours);
    saveProgress(signupData, websiteRequirements, combinedData, openingHours, imagesData, faqsData, selectedPlan, createdClientId, 6);
    setCurrentStep(6); // Move to images step
    window.scrollTo(0, 0);
  };

  const handleStep5Complete = async (images: ImagesData) => {
    setImagesData(images);
    saveProgress(signupData, websiteRequirements, combinedData, openingHoursData, images, faqsData, selectedPlan, createdClientId, 7);
    setCurrentStep(7); // Move to FAQs step
    window.scrollTo(0, 0);
  };

  const handleStep6Complete = async (faqs: FAQsData) => {
    setFaqsData(faqs);
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
          imagesData,
          faqsData: faqs
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
    
    setCurrentStep(8); // Move to success step
  };

  // Fallback: ensure payment amount is set on step 2+ even if local data is missing
  useEffect(() => {
    const ensureAmount = async () => {
      if (urlStep >= 2 && paymentAmount === 0) {
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
  }, [urlStep, paymentAmount, selectedPlan]);

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