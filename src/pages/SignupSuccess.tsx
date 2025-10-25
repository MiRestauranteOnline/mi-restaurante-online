import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SignupSuccess } from "@/components/signup/SignupSuccess";
import { Card, CardContent } from "@/components/ui/card";
import type { SignupData, WebsiteRequirements } from "@/pages/Signup";

const SignupSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { signupData?: SignupData; websiteRequirements?: WebsiteRequirements } | null;

  useEffect(() => {
    // Redirect to home if no signup data is available
    if (!state?.signupData || !state?.websiteRequirements) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.signupData || !state?.websiteRequirements) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <SignupSuccess 
                signupData={state.signupData}
                websiteRequirements={state.websiteRequirements}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignupSuccessPage;
