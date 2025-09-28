import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogGenerationAdmin from "./components/BlogGenerationAdmin";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import RebillAdmin from "./pages/RebillAdmin";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import UnifiedDashboard from "./pages/dashboard/UnifiedDashboard";
import ClientManagement from "./pages/admin/ClientManagement";
import ClientSettings from "./pages/admin/ClientSettings";
import ProjectConfiguration from "./pages/admin/ProjectConfiguration";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardLayout from "./components/admin/AdminDashboardLayout";
import ClientDashboardLayout from "./components/client/ClientDashboardLayout";
import ClientDashboard from "./pages/client/ClientDashboard";
// import ClientSettingsPage from "./pages/client/ClientSettings";
import ClientSubscription from "./pages/client/ClientSubscription";
import { RecoveryRedirect } from "@/components/RecoveryRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RecoveryRedirect />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/acerca-de" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/guia" element={<Blog />} />
            <Route path="/guia/:category/:slug" element={<BlogPost />} />
            <Route path="/admin/blog-generation" element={<BlogGenerationAdmin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/registro" element={<Signup />} />
            <Route path="/admin/rebill" element={<RebillAdmin />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<UnifiedDashboard />} />
            </Route>
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="client-management" element={<ClientManagement />} />
              <Route path="client-settings/:clientId" element={<ClientSettings />} />
              <Route path="project-config" element={<ProjectConfiguration />} />
              <Route path="subscription-management" element={<SubscriptionManagement />} />
            </Route>
            <Route path="/client" element={<ClientDashboardLayout />}>
              <Route index element={<ClientDashboard />} />
              <Route path="dashboard/:clientId" element={<ClientSettings allowedTabs={["basic","hours","social","delivery","branding","content","menu","team","reviews","carousel"]} />} />
              <Route path="subscription" element={<ClientSubscription />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;