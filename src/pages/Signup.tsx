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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";
import OpenPayPaymentForm from "@/components/OpenPayPaymentForm";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { TutorialVideoButton } from "@/components/signup/TutorialVideoButton";
import { TutorialStep } from "@/config/tutorialVideos";

export interface SignupData {
  email: string;
  password: string;
  restaurantName: string;
  subdomain: string;
  phone: string;
  phone_country_code?: string;
  whatsapp_country_code?: string;
  address: string | string[];
  ruc?: string;
  razonSocial?: string;
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
        // First, check localStorage for saved progress (most recent state)
        const stored = localStorage.getItem('signup_progress');
        if (stored) {
          try {
            const p = JSON.parse(stored);
            if (p?.step >= 2 && p?.clientId) {
              console.log('Recovered signup progress from localStorage:', p);
              setCreatedClientId(p.clientId);
              setSelectedPlan(p.selectedPlan || 'basic');
              setSignupData(prev => ({
                ...prev,
                email: p.email || prev.email,
                restaurantName: p.restaurantName || prev.restaurantName,
                phone: p.phone || prev.phone,
              }));
              setCurrentStep(p.step);
              setIsAuthChecking(false);
              window.scrollTo(0, 0);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse signup_progress:', e);
          }
        }
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not logged in and no stored progress - show step 1
          console.log('No session or stored progress, showing step 1');
          setCurrentStep(1);
          setIsAuthChecking(false);
          return;
        }

        console.log('Session found, fetching client data for user:', session.user.id);

        // Helper to respect ?step= from URL if it's not ahead of allowed baseStep
        const urlParams = new URLSearchParams(window.location.search);
        const requestedStepNum = Number(urlParams.get('step'));
        const targetStep = (baseStep: number) => (
          Number.isFinite(requestedStepNum) && requestedStepNum >= 1 && requestedStepNum <= baseStep
            ? requestedStepNum
            : baseStep
        );

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
          address: Array.isArray(client.address) ? client.address : client.address ? [client.address] : [],
          plan_type: client.plan_type,
        }));

        // Determine current step based on database state
        if (client.signup_completed) {
          // Signup fully completed - redirect to dashboard
          console.log('Signup completed, redirecting to dashboard');
          try { localStorage.removeItem('signup_progress'); } catch {}
          navigate('/client', { replace: true });
          return;
        }

        // Step 2: Payment pending
        if (client.subscription_status === 'pending') {
          console.log('Payment pending, showing step 2');
          setCurrentStep(targetStep(2));
          setIsAuthChecking(false);
          return;
        }

        // Step 3: No opening hours
        if (!client.opening_hours || Object.keys(client.opening_hours).length === 0) {
          console.log('No opening hours, showing step 3');
          setCurrentStep(targetStep(3));
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
          setCurrentStep(targetStep(4));
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
          setCurrentStep(targetStep(5));
          setIsAuthChecking(false);
          return;
        }

        // All steps complete so far; do NOT auto-complete. Show final step (7) and let user finalize.
        console.log('All steps appear complete; moving to final step (7)');
        setCurrentStep(targetStep(7));
        setIsAuthChecking(false);
        return;

      } catch (error) {
        console.error('Error initializing signup flow:', error);
        setCurrentStep(1);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initializeSignupFlow();
  }, [navigate, toast]);
  
  // Load all signup data from localStorage on mount
  const loadSignupData = () => {
    try {
      const stored = localStorage.getItem('signup_form_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load signup form data:', e);
    }
    return null;
  };

  const storedData = loadSignupData();

  const [signupData, setSignupData] = useState<SignupData>(storedData?.signupData || {
    email: "",
    password: "",
    restaurantName: "",
    subdomain: "",
    phone: "",
    address: [],
    hasCustomDomain: false,
    customDomain: "",
    referralSource: "",
  });
  const [websiteRequirements, setWebsiteRequirements] = useState<WebsiteRequirements>(storedData?.websiteRequirements || {
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
  const [combinedData, setCombinedData] = useState<CombinedData>(storedData?.combinedData || {
    categories: [],
    items: [],
    reviews: [],
    teamMembers: [],
  });
  const [openingHoursData, setOpeningHoursData] = useState<OpeningHoursData>(storedData?.openingHoursData || {
    opening_hours: {},
  });
  const [imagesData, setImagesData] = useState<ImagesData>(storedData?.imagesData || {
    image_preference: 'ai_only',
    carousel_enabled: false,
    carousel_images: [],
    custom_images_enabled: false,
    custom_images: [],
  });
  const [faqsData, setFaqsData] = useState<FAQsData>(storedData?.faqsData || {
    faqs: [],
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingFinalStep, setIsProcessingFinalStep] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalAmount: number } | null>(null);
  const [hasPaymentSession, setHasPaymentSession] = useState<boolean | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCaptchaToken, setLoginCaptchaToken] = useState<string | null>(null);
  // Update URL to show current step (for UX only, not used for state)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('step', currentStep.toString());
    setSearchParams(params, { replace: true });
  }, [currentStep, setSearchParams]);

  // Check session when entering Step 2
  useEffect(() => {
    const checkPaymentSession = async () => {
      if (currentStep === 2) {
        const { data: { session } } = await supabase.auth.getSession();
        setHasPaymentSession(!!session);
      }
    };
    checkPaymentSession();
  }, [currentStep]);

  const handleLoginForPayment = async () => {
    if (!loginPassword) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu contraseña",
        variant: "destructive",
      });
      return;
    }
    if (!loginCaptchaToken) {
      toast({
        title: "Verificación requerida",
        description: "Completa el CAPTCHA para continuar.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: signupData.email,
      password: loginPassword,
      options: { captchaToken: loginCaptchaToken },
    });
    if (error) {
      toast({
        title: "Error",
        description: error.message.includes('captcha') ? "Verificación CAPTCHA fallida. Intenta de nuevo." : "Contraseña incorrecta. Intenta nuevamente.",
        variant: "destructive",
      });
    } else {
      setHasPaymentSession(true);
      toast({
        title: "Sesión iniciada",
        description: "Ahora puedes continuar con el pago.",
      });
    }
  };

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
          ruc: formData.ruc,
          razonSocial: formData.razonSocial,
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
                console.log('Session ready after OTP');
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
        // Persist minimal progress to survive refreshes
        try {
          localStorage.setItem('signup_progress', JSON.stringify({
            clientId: newClientId,
            step: 2,
            selectedPlan,
            email: finalData.email,
            restaurantName: finalData.restaurantName,
            phone: finalData.phone,
          }));
        } catch {}
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
    try {
      const stored = JSON.parse(localStorage.getItem('signup_progress') || '{}');
      localStorage.setItem('signup_progress', JSON.stringify({ ...stored, step: 3 }));
    } catch {}
  };
  
  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
      toast({
        title: "Pago cancelado",
        description: "Puedes intentar nuevamente cuando estés listo.",
      });
      try {
        const stored = JSON.parse(localStorage.getItem('signup_progress') || '{}');
        localStorage.setItem('signup_progress', JSON.stringify({ ...stored, step: 2 }));
      } catch {}
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
    setCurrentStep(4);
    
    // Save all form data to localStorage
    const formData = {
      signupData,
      websiteRequirements: requirements,
      combinedData,
      openingHoursData,
      imagesData,
      faqsData,
    };
    localStorage.setItem('signup_form_data', JSON.stringify(formData));
    
    // Save progress to localStorage
    const progress = {
      step: 4,
      clientId: createdClientId,
      selectedPlan,
      email: signupData.email,
      restaurantName: signupData.restaurantName,
      phone: signupData.phone,
    };
    localStorage.setItem('signup_progress', JSON.stringify(progress));
    console.log('✅ Step 3 complete, progress saved:', progress);
    
    window.scrollTo(0, 0);
  };

  const handleStep3Complete = async (combined: CombinedData) => {
    setCombinedData(combined);
    setCurrentStep(5);
    
    // Save all form data to localStorage
    const formData = {
      signupData,
      websiteRequirements,
      combinedData: combined,
      openingHoursData,
      imagesData,
      faqsData,
    };
    localStorage.setItem('signup_form_data', JSON.stringify(formData));
    
    // Save progress to localStorage
    const progress = {
      step: 5,
      clientId: createdClientId,
      selectedPlan,
      email: signupData.email,
      restaurantName: signupData.restaurantName,
      phone: signupData.phone,
    };
    localStorage.setItem('signup_progress', JSON.stringify(progress));
    console.log('✅ Step 4 complete, progress saved:', progress);
    
    window.scrollTo(0, 0);
  };

  const handleStep3Skip = () => {
    // Skip but still save progress
    setCurrentStep(5);
    
    // Save all form data to localStorage
    const formData = {
      signupData,
      websiteRequirements,
      combinedData,
      openingHoursData,
      imagesData,
      faqsData,
    };
    localStorage.setItem('signup_form_data', JSON.stringify(formData));
    
    const progress = {
      step: 5,
      clientId: createdClientId,
      selectedPlan,
      email: signupData.email,
      restaurantName: signupData.restaurantName,
      phone: signupData.phone,
    };
    localStorage.setItem('signup_progress', JSON.stringify(progress));
    console.log('✅ Step 4 skipped, progress saved:', progress);
    
    window.scrollTo(0, 0);
  };

  const handleStep4Complete = async (openingHours: OpeningHoursData) => {
    setOpeningHoursData(openingHours);
    setCurrentStep(6);
    
    // Save all form data to localStorage
    const formData = {
      signupData,
      websiteRequirements,
      combinedData,
      openingHoursData: openingHours,
      imagesData,
      faqsData,
    };
    localStorage.setItem('signup_form_data', JSON.stringify(formData));
    
    // Save progress to localStorage
    const progress = {
      step: 6,
      clientId: createdClientId,
      selectedPlan,
      email: signupData.email,
      restaurantName: signupData.restaurantName,
      phone: signupData.phone,
    };
    localStorage.setItem('signup_progress', JSON.stringify(progress));
    console.log('✅ Step 5 complete, progress saved:', progress);
    
    window.scrollTo(0, 0);
  };

  const handleStep5Complete = async (images: ImagesData) => {
    setImagesData(images);
    setCurrentStep(7);
    
    // Save all form data to localStorage
    const formData = {
      signupData,
      websiteRequirements,
      combinedData,
      openingHoursData,
      imagesData: images,
      faqsData,
    };
    localStorage.setItem('signup_form_data', JSON.stringify(formData));
    
    // Save progress to localStorage
    const progress = {
      step: 7,
      clientId: createdClientId,
      selectedPlan,
      email: signupData.email,
      restaurantName: signupData.restaurantName,
      phone: signupData.phone,
    };
    localStorage.setItem('signup_progress', JSON.stringify(progress));
    console.log('✅ Step 6 complete, progress saved:', progress);
    
    window.scrollTo(0, 0);
  };

  const handleStep6Complete = async (faqs: FAQsData) => {
    setIsProcessingFinalStep(true);
    setFaqsData(faqs);
    
    // Save all form data to localStorage
    const formData = {
      signupData,
      websiteRequirements,
      combinedData,
      openingHoursData,
      imagesData,
      faqsData: faqs,
    };
    localStorage.setItem('signup_form_data', JSON.stringify(formData));
    
    try {
      console.log('✅ All steps completed, storing data and finalizing signup');

      // First, store all the collected data via store-briefings
      const { error: storeError } = await supabase.functions.invoke('store-briefings', {
        body: {
          clientId: createdClientId,
          contentBriefing: { source: 'signup_flow', note: 'auto from final step' },
          signupData,
          websiteRequirements,
          menuData: {
            categories: combinedData.categories || [],
            items: combinedData.items || [],
          },
          reviewsData: combinedData.reviews || [],
          teamData: combinedData.teamMembers || [],
          openingHoursData,
          imagesData,
        },
      });

      if (storeError) {
        console.error('Error storing briefing data:', storeError);
        throw new Error(storeError.message || 'No se pudo guardar la información');
      }

      console.log('✅ Briefing data stored successfully');

      // Prepare FAQs payload (optional)
      const cleanFaqs = (faqs.faqs || [])
        .filter(f => f.question.trim() && f.answer.trim())
        .map(f => ({ question: f.question.trim(), answer: f.answer.trim() }));

      // Then validate and complete signup
      const { error } = await supabase.functions.invoke('complete-signup', {
        body: { clientId: createdClientId, faqs: cleanFaqs },
      });

      if (error) {
        console.error('Error completing signup:', error);
        throw new Error(error.message || 'No se pudo completar el registro');
      }

      console.log('✅ Signup completed successfully');

      // Clear localStorage progress
      localStorage.removeItem('signup_progress');

      setIsProcessingFinalStep(false);
      setCurrentStep(8);
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error('Error in final step:', error);
      setIsProcessingFinalStep(false);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo completar el registro. Por favor contacta soporte.',
        variant: 'destructive',
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
    // Save progress to localStorage when going back
    const progress = {
      step: 6,
      clientId: createdClientId,
      selectedPlan,
      email: signupData.email,
      restaurantName: signupData.restaurantName,
      phone: signupData.phone,
    };
    localStorage.setItem('signup_progress', JSON.stringify(progress));
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

                  {hasPaymentSession === null ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Verificando sesión...</p>
                      </CardContent>
                    </Card>
                  ) : !hasPaymentSession ? (
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-2">⚠️ Sesión expirada</h3>
                        <p className="text-sm mb-4">Tu sesión ha expirado. Por favor inicia sesión para continuar con el pago.</p>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="login-email">Email</Label>
                            <Input
                              id="login-email"
                              type="email"
                              value={signupData.email}
                              disabled
                            />
                          </div>
                          <div>
                            <Label htmlFor="login-password">Contraseña</Label>
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="Ingresa tu contraseña"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleLoginForPayment();
                                }
                              }}
                            />
                          </div>
                          <TurnstileWidget
                            onVerify={(token) => setLoginCaptchaToken(token)}
                            onError={() => setLoginCaptchaToken(null)}
                            onExpire={() => setLoginCaptchaToken(null)}
                          />
                          <Button 
                            className="w-full"
                            onClick={handleLoginForPayment}
                            disabled={!loginPassword || !loginCaptchaToken}
                          >
                            Iniciar Sesión
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : createdClientId ? (
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
                          Volver al Paso 1
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
                  onSkip={handleStep3Skip}
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
      
      {/* Tutorial Video Button - Shows on steps 1-7 */}
      {currentStep >= 1 && currentStep <= 7 && (
        <TutorialVideoButton step={`step${currentStep}` as TutorialStep} />
      )}
      
      <Footer />
    </div>
  );
};

export default Signup;