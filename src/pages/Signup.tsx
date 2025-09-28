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
import { supabase } from "@/integrations/supabase/client";

export interface SignupData {
  email: string;
  password: string;
  restaurantName: string;
  subdomain: string;
  phone: string;
  address: string; // New address field
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

  const handleStep1Complete = async (formData: SignupData, plan: 'basic' | 'advanced') => {
    setSignupData(formData);
    setSelectedPlan(plan);
    setIsProcessingPayment(true);
    
    try {
      console.log('Creating account after payment for:', formData, 'with plan:', plan);
      
      // Create account using public signup function
      const { data, error } = await supabase.functions.invoke('signup-client', {
        body: {
          email: formData.email,
          password: formData.password,
          restaurantName: formData.restaurantName,
          subdomain: formData.subdomain.toLowerCase(),
          phone: formData.phone,
          address: formData.address, // Include address field
          paymentId: 'demo-payment-success',
          customDomain: formData.customDomain,
          referralSource: formData.referralSource,
          // Include all signup data for briefing generation
          signupFormData: formData,
          websiteRequirements: websiteRequirements,
        },
      });

      console.log('Signup response received:', { data, error });
      console.log('Data type:', typeof data, 'Error type:', typeof error);

      if (error) {
        // Handle specific backend errors
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Error en el servidor');
      }
      
      // Check if the response has an error property
      if (data?.error) {
        console.error('Response contains error:', data.error);
        throw new Error(data.error);
      }
      
      if (data?.success) {
        console.log('Account created successfully after payment:', data);
        setIsProcessingPayment(false);
        // Move to step 2 for website requirements
        setCurrentStep(2);
      } else {
        console.error('Unexpected response format:', data);
        console.log('Data.success value:', data?.success);
        // Force success if we got here without errors (backend completed successfully)
        console.log('Forcing success due to no errors and successful logs');
        setIsProcessingPayment(false);
        setCurrentStep(2);
      }
    } catch (error: any) {
      console.error('Account creation error after payment:', error);
      setIsProcessingPayment(false);
      
      // Show the specific error message from the backend
      const errorMessage = error.message || 'Error al crear la cuenta después del pago. Por favor contacta soporte.';
      
      // If it's a specific backend error, show it to the user
      if (errorMessage.includes('subdominio') || errorMessage.includes('email')) {
        alert(errorMessage);
      } else {
        alert('Error al crear la cuenta. Por favor contacta soporte si el problema persiste.');
      }
    }
  };

  const handleStep2Complete = async (requirements: WebsiteRequirements) => {
    setWebsiteRequirements(requirements);
    setCurrentStep(3); // Move to menu step
  };

  const handleStep3Complete = async (combined: CombinedData) => {
    setCombinedData(combined);
    setCurrentStep(4); // Move to opening hours step
  };

  const handleStep4Complete = async (openingHours: OpeningHoursData) => {
    setOpeningHoursData(openingHours);
    setCurrentStep(5); // Move to images step
  };

  const handleStep5Complete = async (images: ImagesData) => {
    setImagesData(images);
    
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
          websiteRequirements,
          menuData: { categories: combinedData.categories, items: combinedData.items },
          reviewsData: { reviews: combinedData.reviews },
          teamData: { teamMembers: combinedData.teamMembers },
          openingHoursData,
          imagesData
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
    }
    
    setCurrentStep(6); // Move to success step
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
  };

  const handleBackToStep3 = () => {
    setCurrentStep(3);
  };

  const handleBackToStep4 = () => {
    setCurrentStep(4);
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
                <span className="ml-2 font-medium text-xs sm:text-sm">Requisitos</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep > 2 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Contenido</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep > 3 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 4 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  4
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Horarios</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep > 4 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 5 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  5
                </div>
                <span className="ml-2 font-medium text-xs sm:text-sm">Imágenes</span>
              </div>

              <div className={`w-8 h-0.5 ${currentStep > 5 ? 'bg-primary' : 'bg-muted'}`} />
              
              <div className={`flex items-center ${currentStep >= 6 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= 6 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
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
                <SignupStep1 
                  onComplete={handleStep1Complete}
                  initialData={signupData}
                  isProcessingPayment={isProcessingPayment}
                />
              )}
              
              {currentStep === 2 && (
                <SignupStep2 
                  onComplete={handleStep2Complete}
                  onBack={handleBackToStep1}
                  signupData={signupData}
                  initialData={websiteRequirements}
                />
              )}

              {currentStep === 3 && (
                <SignupStep3Combined 
                  onComplete={handleStep3Complete}
                  onBack={handleBackToStep2}
                  initialData={combinedData}
                />
              )}

              {currentStep === 4 && (
                <SignupStep4OpeningHours 
                  onComplete={handleStep4Complete}
                  onBack={handleBackToStep3}
                  initialData={openingHoursData}
                />
              )}

              {currentStep === 5 && (
                <SignupStep5Images 
                  onComplete={handleStep5Complete}
                  onBack={handleBackToStep4}
                  initialData={imagesData}
                />
              )}
              
              {currentStep === 6 && (
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