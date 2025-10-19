import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmailDNSConfigForm } from "@/components/client/EmailDNSConfigForm";
import namecheapStep1 from "@/assets/namecheap-step-1.webp";
import namecheapStep2 from "@/assets/namecheap-step-2.webp";
import namecheapStep3 from "@/assets/namecheap-step-3.webp";
import namecheapStep4 from "@/assets/namecheap-step-4.webp";

export default function ClientGuides() {
  const { toast } = useToast();
  const [copiedNS1, setCopiedNS1] = useState(false);
  const [copiedNS2, setCopiedNS2] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_clients")
          .select("client_id")
          .eq("user_id", user.id)
          .single();
        if (data) {
          setClientId(data.client_id);
        }
      }
    };
    fetchClientId();
  }, []);

  const nameserver1 = "craig.ns.cloudflare.com";
  const nameserver2 = "uma.ns.cloudflare.com";

  const copyToClipboard = (text: string, nsNumber: number) => {
    navigator.clipboard.writeText(text);
    if (nsNumber === 1) {
      setCopiedNS1(true);
      setTimeout(() => setCopiedNS1(false), 2000);
    } else {
      setCopiedNS2(true);
      setTimeout(() => setCopiedNS2(false), 2000);
    }
    toast({
      title: "Copiado",
      description: "Nameserver copiado al portapapeles",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Guías y Tutoriales</h1>
        <p className="text-muted-foreground">
          Aprende cómo configurar y gestionar tu restaurante online
        </p>
      </div>

      <Tabs defaultValue="custom-domain" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="custom-domain">Configurar Dominio Personalizado</TabsTrigger>
          <TabsTrigger value="email-config">Configurar Correo Electrónico</TabsTrigger>
        </TabsList>

        <TabsContent value="custom-domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cómo Configurar tu Dominio Personalizado con NameCheap</CardTitle>
              <CardDescription>
                Sigue estos pasos para conectar tu dominio personalizado a tu restaurante online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Video Tutorial Placeholder */}
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Video Tutorial Próximamente</p>
                  <p className="text-sm text-muted-foreground">
                    Aquí aparecerá un video tutorial completo del proceso
                  </p>
                </div>
              </div>

              {/* Step 1: Buy a Domain */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Comprar un Dominio en NameCheap</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Si aún no tienes un dominio, necesitas comprarlo primero:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>
                          Ve a{" "}
                          <a
                            href="https://www.namecheap.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            namecheap.com
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                        <li>En la barra de búsqueda de la página principal, escribe el nombre de dominio que deseas (ej: mirestaurante.com)</li>
                        <li>Haz clic en el botón "Search" para verificar la disponibilidad</li>
                      </ol>
                      
                      <div className="border rounded-lg overflow-hidden my-4">
                        <img src={namecheapStep1} alt="Barra de búsqueda de NameCheap" className="w-full" />
                      </div>

                      <ol start={4} className="list-decimal list-inside space-y-2 ml-4">
                        <li>Si el dominio está disponible, verás un botón "Add to Cart" (Agregar al carrito). Si muestra "TAKEN" (Ocupado), el dominio no está disponible y debes buscar otro nombre</li>
                      </ol>

                      <div className="border rounded-lg overflow-hidden my-4">
                        <img src={namecheapStep2} alt="Dominio ocupado (TAKEN)" className="w-full" />
                      </div>

                      <ol start={5} className="list-decimal list-inside space-y-2 ml-4">
                        <li>Cuando encuentres un dominio disponible, selecciona la extensión que prefieras (.com, .pe, .restaurant, etc.) y haz clic en "Add to cart"</li>
                        <li>Completa el proceso de compra siguiendo las instrucciones en pantalla</li>
                      </ol>

                      <div className="border rounded-lg overflow-hidden my-4">
                        <img src={namecheapStep3} alt="Dominio disponible con botón Add to cart" className="w-full" />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          💡 <strong>Consejo:</strong> Si es la primera vez que compras un dominio con NameCheap, es posible que veas un código de descuento disponible (como se muestra en la imagen). Los dominios .com son los más populares, pero puedes elegir otras extensiones según tu preferencia y disponibilidad.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Check Domain Availability */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Verificar Disponibilidad del Dominio</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Antes de comprar, verifica que el dominio esté disponible:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Usa el buscador de NameCheap en la página principal</li>
                        <li>Si el dominio está tomado, verás alternativas sugeridas</li>
                        <li>Puedes probar diferentes extensiones (.com, .net, .pe, etc.)</li>
                        <li>También puedes agregar palabras como "restaurant", "cocina", "bistro", etc. a tu nombre</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Configure Nameservers */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Configurar los Nameservers</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Una vez que hayas completado la compra de tu dominio, debes configurar los nameservers para apuntar a Cloudflare:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Después de confirmar tu compra, desplázate hacia abajo hasta la sección "Domain Registration" y haz clic en el botón rojo grande que dice "Manage" (Administrar)</li>
                        <li>En la página de gestión del dominio, desplázate hasta encontrar la sección "Nameservers"</li>
                        <li>En el menú desplegable (que por defecto está configurado como "Namecheap BasicDNS"), selecciona "Custom DNS"</li>
                        <li>Copia los siguientes nameservers de esta página y pégalos en los campos correspondientes de NameCheap:</li>
                      </ol>

                      <div className="space-y-3 mt-4">
                        <div className="bg-primary rounded-lg p-4 space-y-3">
                          <div>
                            <label className="text-sm font-medium block mb-2 text-white">Nameserver 1:</label>
                            <div className="flex gap-2">
                              <code className="flex-1 bg-background border rounded px-3 py-2 font-mono text-sm">
                                {nameserver1}
                              </code>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(nameserver1, 1)}
                              >
                                {copiedNS1 ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2 text-white">Nameserver 2:</label>
                            <div className="flex gap-2">
                              <code className="flex-1 bg-background border rounded px-3 py-2 font-mono text-sm">
                                {nameserver2}
                              </code>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(nameserver2, 2)}
                              >
                                {copiedNS2 ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-4">
                        La imagen a continuación muestra dónde debes pegar los nameservers en tu cuenta de NameCheap:
                      </p>

                      <div className="border rounded-lg overflow-hidden my-4">
                        <img src={namecheapStep4} alt="Configuración de nameservers en NameCheap" className="w-full" />
                      </div>

                      <ol start={5} className="list-decimal list-inside space-y-2 ml-4 mt-4">
                        <li>Haz clic en el botón verde de confirmación (✓) que aparece al lado derecho para guardar los cambios</li>
                        <li>NameCheap mostrará un mensaje de confirmación indicando que los nameservers han sido actualizados</li>
                      </ol>

                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          ⏱️ <strong>Tiempo de Propagación:</strong> Los cambios de nameservers pueden tardar entre 5 minutos y 48 horas en propagarse completamente, aunque normalmente toma entre 30 minutos y 2 horas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Verification */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Verificación y Activación</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Después de configurar los nameservers:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Espera entre 30 minutos y 2 horas para que los DNS se propaguen</li>
                        <li>Nuestro sistema verificará automáticamente la configuración</li>
                        <li>Una vez verificado, se generará automáticamente un certificado SSL gratuito</li>
                        <li>Tu dominio personalizado estará activo y seguro con HTTPS</li>
                      </ol>

                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✅ <strong>¡Listo!</strong> Una vez completados estos pasos, tu restaurante estará accesible desde tu dominio personalizado con conexión segura HTTPS.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Help */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">¿Necesitas Ayuda?</h3>
                <p className="text-muted-foreground mb-4">
                  Si tienes problemas con la configuración de tu dominio, nuestro equipo de soporte está aquí para ayudarte.
                </p>
                <Button variant="outline" asChild>
                  <a href="/client/support" target="_blank" rel="noopener noreferrer">
                    Contactar Soporte
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cómo Configurar tu Correo Electrónico Profesional</CardTitle>
              <CardDescription>
                Aprende a configurar correos electrónicos profesionales para tu dominio con NameCheap y Cloudflare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Video Tutorial Placeholder */}
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Video Tutorial Próximamente</p>
                  <p className="text-sm text-muted-foreground">
                    Aquí aparecerá un video tutorial completo del proceso
                  </p>
                </div>
              </div>

              {/* Step 1: Buy Email Service */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Comprar Servicio de Email en NameCheap</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>NameCheap ofrece correo electrónico profesional desde $0.99 USD al mes (facturado anualmente):</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>
                          Ve a{" "}
                          <a
                            href="https://www.namecheap.com/hosting/email/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            NameCheap Email Hosting
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                        <li>Selecciona el plan "Starter" que cuesta $0.99/mes (facturado anualmente a $11.88/año). También puedes elegir otros planes si necesitas más buzones y/o almacenamiento</li>
                        <li>
                          <strong>Consejo:</strong> Si eres nuevo en NameCheap, puedes usar el código de descuento que aparece en la tabla de precios
                        </li>
                        <li>Ingresa el nombre de dominio para el cual quieres crear cuentas de correo. Si compraste el dominio con NameCheap, haz clic en "Use a domain I own with Namecheap" y selecciona tu dominio de la lista</li>
                        <li>Haz clic en "Add to Cart" y completa el proceso de compra</li>
                        <li>Después de la compra, recibirás un correo de confirmación con instrucciones de acceso</li>
                      </ol>

                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          💡 <strong>Consejo:</strong> El plan Starter incluye 3 buzones de correo con 5GB de almacenamiento cada uno. Si necesitas más buzones, puedes actualizar a planes superiores.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Create Email Accounts */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Crear Cuentas de Correo</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Una vez que hayas comprado el servicio:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Inicia sesión en tu cuenta de NameCheap</li>
                        <li>Ve a "Products" {">"} "Private Email"</li>
                        <li>Haz clic en "Manage" para tu dominio</li>
                        <li>Haz clic en "Create New Mailbox" (Crear nuevo buzón)</li>
                        <li>Ingresa el nombre de usuario (ej: info, contacto, ventas)</li>
                        <li>Crea una contraseña segura para el buzón</li>
                        <li>Haz clic en "Create Mailbox"</li>
                      </ol>

                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✅ <strong>Ejemplos comunes:</strong> info@tudominio.com, contacto@tudominio.com, ventas@tudominio.com, reservas@tudominio.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Get DNS Records */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Obtener Registros DNS de NameCheap</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Para configurar el correo con Cloudflare, necesitas los registros DNS:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>En el panel de Private Email de NameCheap, haz clic en "Settings" (Configuración)</li>
                        <li>Ve a la sección "DNS Records" o "Mail Settings"</li>
                        <li>Anota los registros MX, TXT (SPF), y DKIM que aparecen</li>
                        <li>Los registros MX generalmente son: mx1.privateemail.com y mx2.privateemail.com</li>
                      </ol>

                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          📋 <strong>Importante:</strong> Copia exactamente estos registros ya que los necesitarás para configurar Cloudflare en el siguiente paso.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated DNS Configuration Form */}
              {clientId && (
                <div className="space-y-4">
                  <EmailDNSConfigForm clientId={clientId} />
                </div>
              )}

              {/* Step 4: Verify Configuration */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Verificar Configuración</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Para confirmar que tu correo está funcionando correctamente:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Ve al panel de Private Email en NameCheap</li>
                        <li>Verifica que aparezca un check verde o mensaje de "DNS Verified"</li>
                        <li>Envía un correo de prueba desde tu nueva dirección de correo</li>
                        <li>Envía un correo a tu nueva dirección para verificar la recepción</li>
                      </ol>

                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✅ <strong>¡Configuración Completa!</strong> Ahora puedes acceder a tu correo desde el webmail de NameCheap en privateemail.com o configurarlo en tu aplicación de correo favorita (Gmail, Outlook, etc.).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Access Your Email */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Acceder a tu Correo</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="font-medium mb-2">Opciones para acceder a tu correo:</p>
                      
                      <div className="space-y-3">
                        <div className="bg-secondary/50 rounded-lg p-4">
                          <p className="font-medium mb-2">Opción 1: Webmail de NameCheap</p>
                          <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                            <li>
                              Ve a{" "}
                              <a
                                href="https://privateemail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                privateemail.com
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </li>
                            <li>Ingresa tu dirección de correo completa</li>
                            <li>Ingresa la contraseña que creaste</li>
                          </ul>
                        </div>

                        <div className="bg-secondary/50 rounded-lg p-4">
                          <p className="font-medium mb-2">Opción 2: Configurar en tu aplicación de correo</p>
                          <p className="text-sm mb-2">Configuración IMAP (recomendado):</p>
                          <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                            <li>Servidor entrante (IMAP): mail.privateemail.com</li>
                            <li>Puerto IMAP: 993 (SSL)</li>
                            <li>Servidor saliente (SMTP): mail.privateemail.com</li>
                            <li>Puerto SMTP: 465 (SSL) o 587 (TLS)</li>
                            <li>Usuario: tu dirección de correo completa</li>
                            <li>Contraseña: la contraseña que creaste</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Help */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">¿Necesitas Ayuda?</h3>
                <p className="text-muted-foreground mb-4">
                  Si tienes problemas con la configuración de tu correo electrónico, nuestro equipo de soporte está aquí para ayudarte.
                </p>
                <Button variant="outline" asChild>
                  <a href="/client/support" target="_blank" rel="noopener noreferrer">
                    Contactar Soporte
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
