import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  Clock, 
  Globe, 
  Server, 
  Shield, 
  Copy,
  RefreshCw,
  ExternalLink,
  Info,
  AlertCircle
} from "lucide-react";

interface OutletContext {
  selectedClientId: string;
  selectedClient?: {
    id: string;
    restaurant_name: string;
    subdomain: string;
  };
}

export default function CustomDomainPage() {
  const { selectedClientId } = useOutletContext<OutletContext>();
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [step, setStep] = useState(1); // 1: Setup, 2: NS Update, 3: Verification, 4: Complete
  const [nameservers, setNameservers] = useState<string[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [polling, setPolling] = useState(false);

  // Fetch client data
  useEffect(() => {
    if (selectedClientId) {
      fetchClientData();
    }
  }, [selectedClientId]);

  const fetchClientData = async () => {
    if (!selectedClientId) return;

    const { data, error } = await supabase
      .from('clients')
      .select('id, restaurant_name, subdomain, domain, email, phone')
      .eq('id', selectedClientId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching client data:', error);
      return;
    }

    // Cast data to any to bypass type checking for columns not yet in types
    const clientInfo = data as any;
    setClientData(clientInfo);
    
    // Determine current step based on data
    if (clientInfo?.custom_domain) {
      setDomain(clientInfo.custom_domain);
      if (clientInfo.ssl_status === 'issued') {
        setStep(4);
      } else if (clientInfo.domain_verified) {
        setStep(3);
      } else if (clientInfo.dns_records_status?.nameservers) {
        setStep(2);
        setNameservers(clientInfo.dns_records_status.nameservers);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Nameserver copied to clipboard" });
  };

  // Step 1: Setup Cloudflare Zone
  const handleSetupDomain = async () => {
    if (!domain.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)) {
      toast({ 
        title: "Invalid Domain", 
        description: "Please enter a valid domain (e.g., mirestaurante.com)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke('setup-cloudflare-zone', {
      body: { client_id: selectedClientId, custom_domain: domain }
    });
    
    setLoading(false);

    if (error || !data?.success) {
      toast({ 
        title: "Setup Failed", 
        description: error?.message || "Could not setup Cloudflare zone",
        variant: "destructive"
      });
      return;
    }

    setNameservers(data.nameservers);
    setStep(2);
    toast({ 
      title: "Cloudflare Configured!", 
      description: "Now update your nameservers at your registrar" 
    });
  };

  // Step 2: Verify Domain
  const handleVerifyDomain = async () => {
    setLoading(true);
    
    const { data, error } = await supabase.functions.invoke('add-vercel-domain', {
      body: { client_id: selectedClientId, custom_domain: domain }
    });
    
    setLoading(false);

    if (error || !data?.success) {
      toast({ 
        title: "Verification Failed", 
        description: "DNS not propagated yet. Wait 5-10 minutes and try again.",
        variant: "destructive"
      });
      return;
    }

    if (data.verified) {
      setStep(3);
      startPolling();
      toast({ 
        title: "Domain Verified!", 
        description: "SSL certificate is being provisioned" 
      });
    } else {
      toast({ 
        title: "Not Ready Yet", 
        description: "DNS propagation can take 5-60 minutes. Please try again shortly.",
      });
    }
  };

  // Step 3: Poll for SSL status
  const startPolling = () => {
    setPolling(true);
    
    const interval = setInterval(async () => {
      const { data } = await supabase.functions.invoke('check-domain-status', {
        body: { client_id: selectedClientId }
      });
      
      if (data?.status === 'active' && data?.ssl_status === 'issued') {
        setStep(4);
        setPolling(false);
        clearInterval(interval);
        toast({ 
          title: "Domain Active! 🎉", 
          description: "Your custom domain is now live with SSL" 
        });
        fetchClientData();
      }
    }, 30000); // Check every 30 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 600000);
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    await fetchClientData();
    setLoading(false);
    toast({ title: "Status Updated", description: "Domain status refreshed" });
  };

  if (!selectedClientId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a client from the dropdown to manage their custom domain.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header with Guidance */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Globe className="w-8 h-8" />
          Custom Domain Setup
        </h1>
        <p className="text-muted-foreground">
          Connect a custom domain (e.g., mirestaurante.com) to the selected client's website
        </p>
      </div>

      {/* Admin Guidance Card */}
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm">
          <strong>How it works:</strong> This process automatically configures DNS through Cloudflare 
          and adds the domain to Vercel with SSL. The client will need access to their domain registrar 
          (GoDaddy, Namecheap, etc.) to update nameservers.
        </AlertDescription>
      </Alert>

      {/* Progress Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TimelineStep 
              number={1}
              completed={step > 1}
              current={step === 1}
              title="Configure DNS"
              description="Setup Cloudflare zone and get nameservers"
            />
            <TimelineStep 
              number={2}
              completed={step > 2}
              current={step === 2}
              title="Update Nameservers"
              description="Change nameservers at the domain registrar"
            />
            <TimelineStep 
              number={3}
              completed={step > 3}
              current={step === 3}
              title="Domain Verification"
              description="Verify DNS and add domain to Vercel"
            />
            <TimelineStep 
              number={4}
              completed={step === 4}
              current={step === 4}
              title="SSL Provisioning"
              description="Secure the site with HTTPS certificate"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Domain Input */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Custom Domain</CardTitle>
            <CardDescription>
              Enter the domain to use (without www or https://)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="mirestaurante.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.toLowerCase().trim())}
                  disabled={loading}
                />
                <Button 
                  onClick={handleSetupDomain} 
                  disabled={loading || !domain}
                  size="lg"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Setup Domain"}
                </Button>
              </div>
              
              {/* Detailed Process Explanation */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm space-y-3">
                  <div>
                    <strong className="text-blue-700 dark:text-blue-300">¿Cómo funciona el proceso de dominio personalizado?</strong>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li><strong>Configuración DNS automática:</strong> Al hacer clic en "Setup Domain", el sistema crea automáticamente una zona DNS en Cloudflare para tu dominio y genera nameservers únicos.</li>
                    <li><strong>Actualización de nameservers:</strong> El cliente debe ir a su registrador de dominios (GoDaddy, Namecheap, etc.) y actualizar los nameservers con los proporcionados por Cloudflare.</li>
                    <li><strong>Verificación de DNS:</strong> Una vez propagados los DNS (5-60 min), el sistema verifica la configuración y agrega el dominio a Vercel automáticamente.</li>
                    <li><strong>Certificado SSL:</strong> Vercel emite un certificado SSL gratuito para el dominio. Este proceso toma 1-5 minutos y se hace automáticamente.</li>
                    <li><strong>Dominio activo:</strong> El sitio web del cliente estará disponible en su dominio personalizado con HTTPS seguro.</li>
                  </ol>
                  <div className="pt-2 text-xs text-muted-foreground border-t border-blue-200 dark:border-blue-800 mt-3">
                    <strong>Nota:</strong> El cliente necesitará acceso a su cuenta de registrador de dominios para completar el paso 2. Todo el proceso toma aproximadamente 15-30 minutos en total.
                  </div>
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Before starting:</strong> Ensure the client has access to their domain registrar 
                  account to update nameservers in the next step.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Nameserver Update */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Update Nameservers at Domain Registrar
            </CardTitle>
            <CardDescription>
              Follow these steps to point the domain to Cloudflare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h4 className="font-semibold">Step-by-Step Guide:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Log in to the domain registrar (GoDaddy, Namecheap, etc.)</li>
                <li>Find the <strong>DNS Settings</strong> or <strong>Nameservers</strong> section</li>
                <li>Choose <strong>"Custom Nameservers"</strong> or <strong>"Change Nameservers"</strong></li>
                <li>Replace existing nameservers with the ones below</li>
                <li>Save changes (can take 5-60 minutes to propagate)</li>
              </ol>
            </div>

            {/* Nameservers */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Copy these nameservers:
              </label>
              <div className="space-y-2">
                {nameservers.map((ns, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <code className="flex-1 bg-background border p-3 rounded font-mono text-sm">
                      {ns}
                    </code>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(ns)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm">
                <strong>DNS propagation takes time.</strong> After updating nameservers, 
                wait 5-10 minutes before clicking "Verify Domain" below. It can take up to 
                48 hours in rare cases.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleVerifyDomain} 
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Nameservers Updated - Verify Now"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Verification in Progress */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 animate-pulse" />
              SSL Certificate Provisioning
            </CardTitle>
            <CardDescription>
              Domain is verified. SSL certificate is being issued...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-16 h-16 animate-spin text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              This usually takes 1-5 minutes. The page will update automatically when complete.
            </p>
            <Button 
              variant="outline" 
              onClick={handleCheckStatus}
              disabled={loading}
              className="w-full"
            >
              Check Status Manually
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              Domain Active!
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-500">
              The custom domain is now live with SSL certificate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-background p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm mb-2">
                <strong>Domain:</strong> <code className="bg-muted px-2 py-1 rounded">{domain}</code>
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  <Shield className="w-3 h-3 mr-1" />
                  SSL Issued
                </Badge>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  DNS Verified
                </Badge>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(`https://${domain}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Site
            </Button>

            {clientData?.vercel_dashboard_url && (
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => window.open(clientData.vercel_dashboard_url, '_blank')}
              >
                View in Vercel Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Status Card (always visible) */}
      {clientData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Domain:</span>
                <p className="font-medium">{clientData.custom_domain || 'Not set'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">SSL Status:</span>
                <p className="font-medium capitalize">{clientData.ssl_status || 'Pending'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Verified:</span>
                <p className="font-medium">{clientData.domain_verified ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Checked:</span>
                <p className="font-medium text-xs">
                  {clientData.last_domain_check 
                    ? new Date(clientData.last_domain_check).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Timeline Step Component
function TimelineStep({ 
  number, 
  completed, 
  current, 
  title, 
  description 
}: {
  number: number;
  completed: boolean;
  current: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold
        ${completed ? 'bg-green-500 text-white' : ''}
        ${current ? 'bg-primary text-primary-foreground animate-pulse' : ''}
        ${!completed && !current ? 'bg-muted text-muted-foreground' : ''}
      `}>
        {completed ? <CheckCircle2 className="w-5 h-5" /> : number}
      </div>
      <div className="flex-1 pt-1">
        <h4 className={`font-semibold ${current ? 'text-primary' : ''}`}>
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
