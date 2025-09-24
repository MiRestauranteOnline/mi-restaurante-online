import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ProblemSolutionSection } from "@/components/ProblemSolutionSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { CTASection } from "@/components/CTASection";
import { PricingSection } from "@/components/PricingSection";
import { ApplicationForm } from "@/components/ApplicationForm";
import { FAQSection } from "@/components/FAQSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <section id="hero">
        <Hero />
      </section>
      
      {/* Problem/Solution Section */}
      <ProblemSolutionSection />
      
      {/* Benefits Grid */}
      <section id="benefits">
        <BenefitsSection />
      </section>
      
      {/* How It Works Process */}
      <section id="how-it-works">
        <HowItWorksSection />
      </section>
      
      {/* CTA Section with Parallax */}
      <CTASection />
      
      {/* Pricing Plans */}
      <section id="pricing">
        <PricingSection />
      </section>
      
      {/* Application Form */}
      <section id="application">
        <ApplicationForm />
      </section>
      
      {/* FAQ Section */}
      <section id="faq">
        <FAQSection />
      </section>
      
      {/* Footer */}
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default Index;