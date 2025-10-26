import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DashboardLanguageProvider } from "@/contexts/DashboardLanguageContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Soporte from "./pages/Soporte";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Terms from "./pages/Terms";
import LibroReclamaciones from "./pages/LibroReclamaciones";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogGenerationAdmin from "./components/BlogGenerationAdmin";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import SignupSuccessPage from "./pages/SignupSuccess";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import UnifiedDashboard from "./pages/dashboard/UnifiedDashboard";
import ClientManagement from "./pages/admin/ClientManagement";
import AdminClientSettings from "./pages/admin/ClientSettings";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import CouponManagement from "./pages/admin/CouponManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardLayout from "./components/admin/AdminDashboardLayout";
import ClientImages from "./pages/admin/ClientImages";
import TicketManagement from "./pages/admin/TicketManagement";
import MarketingAnalytics from "./pages/admin/MarketingAnalytics";
import PlanManagement from "./pages/admin/PlanManagement";
import TemplatesManagement from "./pages/admin/TemplatesManagement";
import CustomDomainPage from "./pages/admin/CustomDomainPage";
import CustomDNS from "./pages/admin/CustomDNS";
import ClientDashboardLayout from "./components/client/ClientDashboardLayout";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientSettingsPage from "./pages/client/ClientSettings";
import ClientSubscription from "./pages/client/ClientSubscription";
import ClientSupport from "./pages/client/ClientSupport";
import ClientGuides from "./pages/client/ClientGuides";
import ClientPolicies from "./pages/client/ClientPolicies";
// Reuse ClientGuides for public docs (renamed internally)
const Guias = ClientGuides;
import { RecoveryRedirect } from "@/components/RecoveryRedirect";
import ClientAnalytics from "./pages/client/ClientAnalytics";
import ClientReservations from "./pages/client/ClientReservations";
import CloudflareMonitoring from "./pages/admin/CloudflareMonitoring";
import BillingInvoicing from "./pages/admin/BillingInvoicing";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentError from "./pages/PaymentError";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/client');

  return (
    <>
      {/* Skip Links for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to navigation
      </a>
      <ScrollToTop />
      <RecoveryRedirect />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/soporte" element={<Soporte />} />
        <Route path="/acerca-de" element={<About />} />
        <Route path="/libro-reclamaciones" element={<LibroReclamaciones />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:category/:slug" element={<BlogPost />} />
        <Route path="/admin/blog-generation" element={<BlogGenerationAdmin />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/registro" element={<Signup />} />
        <Route path="/registro-exitoso" element={<SignupSuccessPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-error" element={<PaymentError />} />
        <Route path="/dashboard" element={<DashboardLanguageProvider><DashboardLayout /></DashboardLanguageProvider>}>
          <Route index element={<UnifiedDashboard />} />
        </Route>
        {/* SECURITY: All admin routes protected with server-side role validation */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <DashboardLanguageProvider>
              <AdminDashboardLayout />
            </DashboardLanguageProvider>
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="client-management" element={<ClientManagement />} />
          <Route path="custom-domains" element={<CustomDomainPage />} />
          <Route path="custom-dns" element={<CustomDNS />} />
          <Route path="cloudflare-monitoring" element={<CloudflareMonitoring />} />
          <Route path="billing" element={<BillingInvoicing />} />
          <Route path="tickets" element={<TicketManagement />} />
          <Route path="client-images" element={<ClientImages />} />
          <Route path="marketing-analytics" element={<MarketingAnalytics />} />
          <Route path="client-settings/:clientId" element={<AdminClientSettings />} />
          <Route path="subscription-management" element={<SubscriptionManagement />} />
          <Route path="coupon-management" element={<CouponManagement />} />
          <Route path="plan-management" element={<PlanManagement />} />
          <Route path="templates-management" element={<TemplatesManagement />} />
        </Route>
        <Route path="/client" element={<DashboardLanguageProvider><ClientDashboardLayout /></DashboardLanguageProvider>}>
          <Route index element={<ClientDashboard />} />
          <Route path="dashboard/:clientId" element={<AdminClientSettings allowedTabs={["basic","hours","social","delivery","branding","navigation-visibility","content","menu","team","reviews","faqs","carousel","custom-images"]} />} />
          <Route path="reservations/:clientId" element={<ClientReservations />} />
          <Route path="analytics/:clientId" element={<ClientAnalytics />} />
          <Route path="policies/:clientId" element={<ClientPolicies />} />
          <Route path="support/:clientId" element={<ClientSupport />} />
          <Route path="subscription" element={<ClientSubscription />} />
        </Route>
        <Route path="/guias" element={<Guias />} />
        <Route path="/guias/:category/:guide" element={<Guias />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboardRoute && <WhatsAppButton />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;