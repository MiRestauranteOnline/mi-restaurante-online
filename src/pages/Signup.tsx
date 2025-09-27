import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SignupStep1 } from "@/components/signup/SignupStep1";
import { RebillPayment } from "@/components/signup/RebillPayment";
import { SignupStep2 } from "@/components/signup/SignupStep2";
import { SignupSuccess } from "@/components/signup/SignupSuccess";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export interface SignupData {
  email: string;
  password: string;
  restaurantName: string;
  subdomain: string;
  phone: string;
  paymentId?: string;
  hasCustomDomain?: boolean;
  customDomain?: string;
  referralSource?: string;
}

export interface SocialMedia {
  platform: string;
  url: string;
}

export interface WebsiteRequirements {
  businessType: string;
  targetAudience: string;
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleStep1Complete = async (formData: SignupData) => {
    // For now, we'll assume 'basic' plan. We can add plan selection to Step1 later
    setSignupData(formData);
    setSelectedPlan('basic');
    setCurrentStep(2); // Move to payment step
  };

  const handlePaymentSuccess = async () => {
    setIsProcessingPayment(true);
    
    try {
      console.log('Payment successful, creating account for:', signupData);
      
      // Create account using public signup function
      const { data, error } = await supabase.functions.invoke('signup-client', {
        body: {
          email: signupData.email,
          password: signupData.password,
          restaurantName: signupData.restaurantName,
          subdomain: signupData.subdomain.toLowerCase(),
          phone: signupData.phone,
          paymentId: 'rebill-payment-success',
          customDomain: signupData.customDomain,
          referralSource: signupData.referralSource,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.success) {
        console.log('Account created successfully after payment:', data);
        setIsProcessingPayment(false);
        // Move to step 3 for website requirements
        setCurrentStep(3);
      } else {
        throw new Error(data?.error || 'Account creation failed');
      }
    } catch (error) {
      console.error('Account creation error after payment:', error);
      setIsProcessingPayment(false);
      alert('Error al crear la cuenta después del pago. Por favor contacta soporte.');
    }
  };

  const handleStep3Complete = (requirements: WebsiteRequirements) => {
    setWebsiteRequirements(requirements);
    setCurrentStep(4);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleBackToPayment = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  1
                </div>
                <span className="ml-2 font-medium">Información</span>
              </div>
              
              <div className={`w-16 h-0.5 ${currentStep > 1 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">Pago</span>
              </div>
              
              <div className={`w-16 h-0.5 ${currentStep > 2 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium">Requisitos del Sitio</span>
              </div>
              
              <div className={`w-16 h-0.5 ${currentStep > 3 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 4 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  ✓
                </div>
                <span className="ml-2 font-medium">Confirmación</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <Card className="border-border">
            <CardContent className="p-8">
              {currentStep === 1 && (
                <SignupStep1 
                  onComplete={handleStep1Complete}
                  initialData={signupData}
                  isProcessingPayment={isProcessingPayment}
                />
              )}
              
              {currentStep === 2 && (
                <RebillPayment 
                  signupData={signupData}
                  selectedPlan={selectedPlan}
                  onSuccess={handlePaymentSuccess}
                  onBack={handleBackToStep1}
                />
              )}
              
              {currentStep === 3 && (
                <SignupStep2 
                  onComplete={handleStep3Complete}
                  onBack={handleBackToPayment}
                  signupData={signupData}
                  initialData={websiteRequirements}
                />
              )}
              
              {currentStep === 4 && (
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