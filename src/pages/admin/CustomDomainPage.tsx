import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Copy, Globe, Shield } from "lucide-react";
import { toast } from "sonner";

interface OutletContext {
  selectedClientId: string | null;
}

interface ClientData {
  id: string;
  restaurant_name: string;
  subdomain: string;
  custom_domain: string | null;
  domain_verified: boolean;
  ssl_status: string;
  domain_verification_date: string | null;
  ssl_issued_date: string | null;
}

export default function CustomDomainPage() {
  const { selectedClientId } = useOutletContext<OutletContext>();
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [customDomain, setCustomDomain] = useState("");

  useEffect(() => {
    if (selectedClientId) {
      fetchClientData();
    }
  }, [selectedClientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("id, restaurant_name, subdomain, custom_domain, domain_verified, ssl_status, domain_verification_date, ssl_issued_date")
        .eq("id", selectedClientId)
        .single();

      if (error) throw error;
      setClientData(data);
      setCustomDomain(data.custom_domain || "");
    } catch (error: any) {
      console.error("Error fetching client data:", error);
      toast.error("Error al cargar datos del cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!customDomain || !selectedClientId) {
      toast.error("Por favor ingresa un dominio válido");
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(customDomain)) {
      toast.error("Formato de dominio inválido");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("add-custom-domain-to-pages", {
        body: { clientId: selectedClientId, customDomain },
      });

      if (error) throw error;

      toast.success("Dominio añadido a Cloudflare Pages");
      await fetchClientData();
      startPolling();
    } catch (error: any) {
      console.error("Error adding domain:", error);
      toast.error(error.message || "Error al añadir dominio");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!selectedClientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("verify-custom-domain-status", {
        body: { clientId: selectedClientId },
      });

      if (error) throw error;

      if (data.verified && data.ssl_status === "active") {
        toast.success("¡Dominio verificado y SSL activo!");
      } else if (data.verified) {
        toast.success("Dominio verificado, SSL pendiente");
      } else {
        toast.info("Dominio aún no verificado");
      }

      await fetchClientData();
    } catch (error: any) {
      console.error("Error verifying domain:", error);
      toast.error(error.message || "Error al verificar dominio");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!selectedClientId) return;
    if (!confirm("¿Estás seguro de que quieres eliminar este dominio personalizado?")) return;

    try {
      setLoading(true);
      const { error } = await supabase.functions.invoke("remove-custom-domain", {
        body: { clientId: selectedClientId },
      });

      if (error) throw error;

      toast.success("Dominio personalizado eliminado");
      setCustomDomain("");
      await fetchClientData();
    } catch (error: any) {
      console.error("Error removing domain:", error);
      toast.error(error.message || "Error al eliminar dominio");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("verify-custom-domain-status", {
          body: { clientId: selectedClientId },
        });
        
        await fetchClientData();

        if (data?.verified && data?.ssl_status === "active") {
          setPolling(false);
          clearInterval(interval);
          toast.success("¡Dominio completamente configurado!");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 10000);

    setTimeout(() => {
      setPolling(false);
      clearInterval(interval);
    }, 300000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  if (!selectedClientId) {
    return (
      <div className="p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor selecciona un cliente de la lista para configurar su dominio personalizado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading && !clientData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasCustomDomain = clientData?.custom_domain;
  const isVerified = clientData?.domain_verified;
  const sslActive = clientData?.ssl_status === "active";

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dominio Personalizado</h1>
        <p className="text-muted-foreground">
          Configura un dominio personalizado para {clientData?.restaurant_name}
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Estado Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Subdominio</p>
              <p className="font-medium">{clientData?.subdomain}.mirestauranteonline.com</p>
            </div>
            {hasCustomDomain && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dominio Personalizado</p>
                  <p className="font-medium">{clientData?.custom_domain}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estado de Verificación</p>
                  <Badge variant={isVerified ? "default" : "secondary"}>
                    {isVerified ? "Verificado" : "Pendiente"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estado SSL</p>
                  <Badge variant={sslActive ? "default" : "secondary"}>
                    {sslActive ? "Activo" : "Pendiente"}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Domain or Instructions */}
      {!hasCustomDomain ? (
        <Card>
          <CardHeader>
            <CardTitle>Añadir Dominio Personalizado</CardTitle>
            <CardDescription>
              Ingresa el dominio que deseas usar (ej: restaurante.com)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ejemplo.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase().trim())}
                disabled={loading}
              />
              <Button onClick={handleAddDomain} disabled={loading || !customDomain}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Añadir Dominio
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* DNS Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instrucciones de Configuración DNS</CardTitle>
              <CardDescription>
                Configura estos registros en tu proveedor de dominio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Añade un registro CNAME apuntando a tu proyecto de Cloudflare Pages.
                  Los cambios DNS pueden tardar hasta 48 horas en propagarse.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Tipo:</span>
                    <span>CNAME</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Nombre:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-background px-2 py-1 rounded">@</code>
                      <span className="text-sm text-muted-foreground">(o tu dominio raíz)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Valor:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-background px-2 py-1 rounded">mi-restaurante-online.pages.dev</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("mi-restaurante-online.pages.dev")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  * Si tu proveedor no permite CNAME en el dominio raíz, usa estos registros A:
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="text-sm">
                    <strong>Tipo:</strong> A | <strong>Nombre:</strong> @ | <strong>Valor:</strong> (consultar con Cloudflare)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Estado de Verificación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {isVerified ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">Verificación DNS</p>
                      <p className="text-sm text-muted-foreground">
                        {isVerified ? "Dominio verificado correctamente" : "Esperando configuración DNS"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {sslActive ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">Certificado SSL</p>
                      <p className="text-sm text-muted-foreground">
                        {sslActive ? "SSL activo y funcionando" : "Esperando emisión de certificado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleVerifyDomain} disabled={loading || polling}>
                  {(loading || polling) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verificar Estado
                </Button>
                <Button variant="destructive" onClick={handleRemoveDomain} disabled={loading}>
                  Eliminar Dominio
                </Button>
              </div>

              {polling && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Verificando automáticamente cada 10 segundos...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
