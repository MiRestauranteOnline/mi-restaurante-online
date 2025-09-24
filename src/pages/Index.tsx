import { Hero } from "@/components/Hero";
import { ProblemSolutionSection } from "@/components/ProblemSolutionSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { PricingSection } from "@/components/PricingSection";
import { ApplicationForm } from "@/components/ApplicationForm";
import { FAQSection } from "@/components/FAQSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Problem/Solution Section */}
      <ProblemSolutionSection />
      
      {/* Benefits Grid */}
      <BenefitsSection />
      
      {/* How It Works Process */}
      <HowItWorksSection />
      
      {/* Pricing Plans */}
      <PricingSection />
      
      {/* Application Form */}
      <ApplicationForm />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default Index;