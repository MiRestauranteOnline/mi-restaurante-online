import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmailDNSConfigForm } from "@/components/client/EmailDNSConfigForm";
import { GuidesSidebar } from "@/components/client/GuidesSidebar";
import namecheapStep1 from "@/assets/namecheap-step-1.webp";
import namecheapStep2 from "@/assets/namecheap-step-2.webp";
import namecheapStep3 from "@/assets/namecheap-step-3.webp";
import namecheapStep4 from "@/assets/namecheap-step-4.webp";

export default function ClientGuides() {
  const { toast } = useToast();
  const [copiedNS1, setCopiedNS1] = useState(false);
  const [copiedNS2, setCopiedNS2] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [activeGuide, setActiveGuide] = useState("custom-domain");

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

  const renderGuideContent = () => {
    switch (activeGuide) {
      case "intro":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido a las Guías de Mi Restaurante Online</CardTitle>
              <CardDescription>
                Todo lo que necesitas saber para gestionar tu restaurante online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                En esta sección encontrarás guías detalladas para configurar y gestionar todos los aspectos de tu restaurante online.
              </p>
              <div className="space-y-2">
                <h3 className="font-semibold">Guías Disponibles:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Configuración de dominio personalizado</li>
                  <li>Configuración de correo electrónico profesional</li>
                  <li>Y muchas más guías próximamente...</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Selecciona una guía del menú lateral para comenzar.
              </p>
            </CardContent>
          </Card>
        );
      
      case "custom-domain":
        return (
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
        );
      
      case "general":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Información General del Restaurante</CardTitle>
              <CardDescription>
                Cómo configurar la información básica de tu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Configuración</strong> → sección <strong>"Información Básica"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Campos Disponibles</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Nombre del Restaurante *</h4>
                    <p className="text-sm text-muted-foreground">
                      El nombre de tu restaurante que aparecerá en todo el sitio web. Este campo es obligatorio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Teléfono</h4>
                    <p className="text-sm text-muted-foreground">
                      Número de teléfono de contacto. Formato sugerido: +51 123 456 789
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Email</h4>
                    <p className="text-sm text-muted-foreground">
                      Correo electrónico de contacto para tu restaurante. Debe ser un email válido.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">
                      Número de WhatsApp para que los clientes puedan contactarte directamente. Formato: +51 987 654 321
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Dirección</h4>
                    <p className="text-sm text-muted-foreground">
                      Dirección completa de tu restaurante. Este campo acepta múltiples líneas para mayor claridad.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Asegúrate de que todos los datos de contacto estén actualizados</li>
                  <li>Usa el formato internacional para teléfonos (+51 para Perú)</li>
                  <li>El nombre del restaurante aparecerá en el título de la página y en el encabezado</li>
                  <li>No olvides hacer clic en "Guardar Configuración" después de realizar cambios</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "opening-hours":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Apertura</CardTitle>
              <CardDescription>
                Configura los horarios de atención de tu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Configuración</strong> → sección <strong>"Horarios de Atención"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cómo Configurar</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Para cada día de la semana:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Usa el switch para marcar si el restaurante está <strong>Abierto</strong> o <strong>Cerrado</strong></li>
                      <li>Si está abierto, selecciona la <strong>hora de apertura</strong> (primer campo de tiempo)</li>
                      <li>Selecciona la <strong>hora de cierre</strong> (segundo campo de tiempo)</li>
                      <li>Los horarios se muestran en formato 24 horas</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">📌 Ejemplo</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Lunes:</strong> Switch en "Abierto" → Apertura: 09:00 → Cierre: 22:00
                      <br />
                      <strong>Domingo:</strong> Switch en "Cerrado"
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Días de la Semana</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Lunes</li>
                  <li>• Martes</li>
                  <li>• Miércoles</li>
                  <li>• Jueves</li>
                  <li>• Viernes</li>
                  <li>• Sábado</li>
                  <li>• Domingo</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Los horarios aparecerán automáticamente en tu sitio web</li>
                  <li>Actualiza los horarios para días festivos o eventos especiales</li>
                  <li>Si tienes horarios de almuerzo y cena separados, usa el horario más amplio</li>
                  <li>No olvides guardar los cambios haciendo clic en "Guardar Configuración"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "social-media":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>
                Conecta tus perfiles de redes sociales a tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Redes Sociales</strong> → sección <strong>"Redes Sociales"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Plataformas Disponibles</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Facebook</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace completo a tu página de Facebook
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://facebook.com/mirestaurante
                    </code>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Instagram</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace completo a tu perfil de Instagram
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://instagram.com/mirestaurante
                    </code>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">X (Twitter)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace completo a tu perfil de X (anteriormente Twitter)
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://x.com/mirestaurante
                    </code>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">LinkedIn</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace a tu página de empresa en LinkedIn
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://linkedin.com/company/mirestaurante
                    </code>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">YouTube</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace a tu canal de YouTube
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://youtube.com/@mirestaurante
                    </code>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">TikTok</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace a tu perfil de TikTok
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://tiktok.com/@mirestaurante
                    </code>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Usa URLs completas (incluyendo https://)</li>
                  <li>Solo aparecerán iconos para las redes sociales que hayas configurado</li>
                  <li>Verifica que los enlaces funcionen antes de guardar</li>
                  <li>Los iconos de redes sociales aparecerán automáticamente en el footer de tu sitio</li>
                  <li>Mantén actualizados tus enlaces si cambias de usuario o perfil</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "delivery":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Información de Delivery</CardTitle>
              <CardDescription>
                Conecta tus perfiles en plataformas de delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Redes Sociales</strong> → sección <strong>"Plataformas de Delivery"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Plataformas Disponibles</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Rappi</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace completo a tu perfil de restaurante en Rappi
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://www.rappi.com.pe/restaurantes/tu-restaurante
                    </code>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">PedidosYa</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace completo a tu perfil de restaurante en PedidosYa
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://www.pedidosya.com.pe/restaurantes/tu-restaurante
                    </code>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">DiDi Food</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enlace completo a tu perfil de restaurante en DiDi Food
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Ejemplo: https://food.didiglobal.com/pe/restaurant/tu-restaurante
                    </code>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cómo Obtener el Enlace</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Abre la app o sitio web de la plataforma de delivery</li>
                  <li>Busca tu restaurante como lo harían tus clientes</li>
                  <li>Copia la URL completa de la página de tu restaurante</li>
                  <li>Pégala en el campo correspondiente en el panel</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Usa URLs completas (incluyendo https://)</li>
                  <li>Los enlaces de delivery aparecerán como botones en tu sitio web</li>
                  <li>Prueba los enlaces después de guardarlos para verificar que funcionen</li>
                  <li>Solo configura las plataformas donde realmente tengas presencia</li>
                  <li>Mantén los enlaces actualizados si cambias de ubicación o nombre</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "branding":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Marca y Personalización</CardTitle>
              <CardDescription>
                Personaliza los colores y la moneda de tu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Configuración</strong> → sección <strong>"Personalización"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Opciones Disponibles</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Color Principal</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      El color principal de tu marca que se usará en todo el sitio web (botones, enlaces, etc.)
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Cómo seleccionar:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Usa el selector de color (cuadrado de color) para elegir visualmente</li>
                        <li>O ingresa un código de color hexadecimal manualmente (ej: #22c55e)</li>
                        <li>El color se actualizará en tiempo real en el selector</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Moneda</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Símbolo de moneda que aparecerá junto a los precios en todo el sitio
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Ejemplos comunes:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li><code className="bg-muted px-2 py-1 rounded">S/</code> - Soles peruanos</li>
                        <li><code className="bg-muted px-2 py-1 rounded">$</code> - Dólares</li>
                        <li><code className="bg-muted px-2 py-1 rounded">€</code> - Euros</li>
                        <li><code className="bg-muted px-2 py-1 rounded">MXN$</code> - Pesos mexicanos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">⚠️ Advertencia Importante</h3>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-yellow-900 dark:text-yellow-100">
                    Al cambiar el color principal, aparecerá un popup de confirmación
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    <strong>¿Por qué?</strong> Cambiar el color principal puede afectar significativamente la apariencia de tu sitio web.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">El popup te pedirá confirmación porque:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                      <li>El color se aplicará a todos los botones del sitio</li>
                      <li>Afectará los enlaces y elementos interactivos</li>
                      <li>Cambiará la identidad visual de tu marca en línea</li>
                      <li>Los cambios son inmediatos y visibles para tus clientes</li>
                    </ul>
                  </div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-3">
                    <strong>Recomendación:</strong> Visualiza cómo se verá el nuevo color antes de confirmar y asegúrate de que combine bien con tus imágenes y contenido.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Elige un color que represente bien tu marca y sea fácil de leer</li>
                  <li>Asegúrate de que el color tenga buen contraste con el blanco/negro</li>
                  <li>Puedes cambiar el color cuando quieras, pero piénsalo bien antes</li>
                  <li>La moneda solo necesita configurarse una vez, a menos que cambies de país</li>
                  <li>Guarda los cambios haciendo clic en "Guardar Configuración"</li>
                  <li>Revisa tu sitio web después de guardar para ver cómo se ve el nuevo color</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "menu-categories":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Categorías del Menú</CardTitle>
              <CardDescription>
                Organiza tu menú con categorías personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Menú</strong> → sección <strong>"Categorías"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué son las Categorías?</h3>
                <p className="text-muted-foreground">
                  Las categorías te permiten organizar los elementos de tu menú en grupos lógicos como "Entradas", "Platos Principales", "Bebidas", "Postres", etc.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Crear una Nueva Categoría</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Haz clic en el botón <strong>"Nueva Categoría"</strong></li>
                  <li>Ingresa el nombre de la categoría (ej: "Platos Principales")</li>
                  <li>Usa el switch para marcar si la categoría está activa o no</li>
                  <li>Haz clic en <strong>"Crear"</strong></li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gestionar Categorías Existentes</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔄 Reordenar</h4>
                    <p className="text-sm text-muted-foreground">
                      Arrastra y suelta las categorías usando el ícono de líneas verticales para cambiar el orden en que aparecen en tu sitio web.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">✏️ Editar</h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón de editar (ícono de lápiz) para modificar el nombre de la categoría.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔘 Activar/Desactivar</h4>
                    <p className="text-sm text-muted-foreground">
                      Usa el switch para activar o desactivar categorías sin eliminarlas. Las categorías inactivas no aparecen en el sitio web.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🗑️ Eliminar</h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón de eliminar (ícono de basura). Se te pedirá confirmación antes de eliminar.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Crea las categorías antes de agregar elementos del menú</li>
                  <li>Usa nombres descriptivos y claros para tus categorías</li>
                  <li>El orden de las categorías afecta cómo se muestra tu menú</li>
                  <li>Mantén solo las categorías activas que estés usando</li>
                  <li>Ejemplos de categorías: "Entradas", "Sopas", "Platos Principales", "Bebidas", "Postres"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "menu-items":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Elementos del Menú</CardTitle>
              <CardDescription>
                Agrega y gestiona los platos y bebidas de tu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Menú</strong> → sección <strong>"Elementos del Menú"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Crear un Nuevo Elemento</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Haz clic en el botón <strong>"Nuevo Elemento"</strong></li>
                  <li>Completa el formulario con la información del plato</li>
                  <li>Haz clic en <strong>"Crear"</strong></li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Campos del Formulario</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Nombre del Plato *</h4>
                    <p className="text-sm text-muted-foreground">
                      Nombre del plato o bebida (ej: "Lomo Saltado"). Campo obligatorio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Precio *</h4>
                    <p className="text-sm text-muted-foreground">
                      Precio del elemento. Solo números (ej: 25.50). Campo obligatorio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Categoría *</h4>
                    <p className="text-sm text-muted-foreground">
                      Selecciona la categoría a la que pertenece este elemento. Si no ves categorías, créalas primero.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">
                      Descripción detallada del plato, ingredientes, preparación, etc. (Opcional)
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Imagen del Plato</h4>
                    <p className="text-sm text-muted-foreground">
                      Sube una foto del plato. Se optimizará automáticamente. (Opcional pero recomendado)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Opciones de Visualización</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Elemento Activo</h4>
                    <p className="text-sm text-muted-foreground">
                      Los elementos inactivos no aparecen en el sitio web. Útil para platos temporalmente no disponibles.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Mostrar en Página de Inicio</h4>
                    <p className="text-sm text-muted-foreground">
                      Marca los platos destacados que quieres mostrar en la página principal. <strong>Máximo 8 elementos.</strong>
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Mostrar Imagen en Menú</h4>
                    <p className="text-sm text-muted-foreground">
                      Si está activado, la imagen del plato aparece en la página del menú completo.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Mostrar Imagen en Inicio</h4>
                    <p className="text-sm text-muted-foreground">
                      Si está activado, la imagen aparece cuando el plato se muestra en la página de inicio.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gestionar Elementos</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔍 Buscar</h4>
                    <p className="text-sm text-muted-foreground">
                      Usa el cuadro de búsqueda para encontrar elementos por nombre, descripción o categoría.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔄 Reordenar</h4>
                    <p className="text-sm text-muted-foreground">
                      Arrastra y suelta elementos dentro de cada categoría para cambiar su orden de aparición.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">✏️ Editar</h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón de editar para modificar cualquier información del elemento.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🗑️ Eliminar</h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón rojo de eliminar. Se te pedirá confirmación.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Usa fotos de alta calidad para tus platos principales</li>
                  <li>Escribe descripciones atractivas que hagan querer ordenar</li>
                  <li>Actualiza los precios regularmente</li>
                  <li>Selecciona tus mejores 8 platos para la página de inicio</li>
                  <li>Usa la opción "inactivo" en lugar de eliminar platos de temporada</li>
                  <li>Agrupa elementos similares en la misma categoría</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "team":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Gestión del Equipo</CardTitle>
              <CardDescription>
                Presenta a tu equipo en tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Equipo</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Agregar un Miembro del Equipo</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Haz clic en el botón <strong>"Agregar Miembro del Equipo"</strong></li>
                  <li>Completa el formulario con la información</li>
                  <li>Sube una foto del miembro (opcional pero recomendado)</li>
                  <li>Haz clic en <strong>"Guardar"</strong></li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Miembro</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Nombre *</h4>
                    <p className="text-sm text-muted-foreground">
                      Nombre completo del miembro del equipo. Campo obligatorio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Cargo *</h4>
                    <p className="text-sm text-muted-foreground">
                      Posición o rol en el restaurante (ej: "Chef Ejecutivo", "Sommelier", "Gerente"). Campo obligatorio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Biografía</h4>
                    <p className="text-sm text-muted-foreground">
                      Una breve descripción sobre el miembro, su experiencia y especialidades. (Opcional)
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Foto</h4>
                    <p className="text-sm text-muted-foreground">
                      Foto profesional del miembro del equipo. Se optimizará automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gestionar Miembros</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">✏️ Editar</h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón de editar para actualizar la información de un miembro.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🗑️ Eliminar</h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón de eliminar. Se te pedirá confirmación antes de proceder.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Usa fotos profesionales con fondo neutro o uniforme</li>
                  <li>Presenta solo al personal clave (chef, sommelier, gerente)</li>
                  <li>Escribe biografías breves pero informativas (2-3 oraciones)</li>
                  <li>Destaca experiencia relevante y especialidades</li>
                  <li>Mantén un tono profesional pero cercano</li>
                  <li>Actualiza cuando haya cambios en el equipo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "reviews":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Reseñas de Clientes</CardTitle>
              <CardDescription>
                Muestra testimonios y reseñas en tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>Reseñas</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Agregar una Reseña</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Haz clic en el botón <strong>"Agregar Reseña"</strong></li>
                  <li>Completa el formulario con los datos de la reseña</li>
                  <li>Selecciona la calificación (1-5 estrellas)</li>
                  <li>Haz clic en <strong>"Guardar"</strong></li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de la Reseña</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Nombre del Cliente *</h4>
                    <p className="text-sm text-muted-foreground">
                      Nombre del cliente que dejó la reseña. Campo obligatorio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Calificación *</h4>
                    <p className="text-sm text-muted-foreground">
                      Número de estrellas (1 a 5). Campo obligatorio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Comentario *</h4>
                    <p className="text-sm text-muted-foreground">
                      El texto completo de la reseña o testimonio. Campo obligatorio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Fecha</h4>
                    <p className="text-sm text-muted-foreground">
                      Se registra automáticamente la fecha en que se agregó la reseña.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gestionar Reseñas</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">✏️ Editar</h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón de editar para actualizar la información de una reseña.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🗑️ Eliminar</h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón de eliminar. Se te pedirá confirmación.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">👁️ Visualización</h4>
                    <p className="text-sm text-muted-foreground">
                      Las reseñas aparecen en tu sitio web ordenadas por fecha, mostrando las más recientes primero.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Solicita permiso a los clientes antes de publicar sus reseñas</li>
                  <li>Puedes copiar reseñas de Google, TripAdvisor o redes sociales (con permiso)</li>
                  <li>Enfócate en reseñas de 4-5 estrellas para mostrar lo mejor</li>
                  <li>Incluye reseñas que mencionen platos específicos o el servicio</li>
                  <li>Mantén entre 5-10 reseñas visibles para no saturar</li>
                  <li>Actualiza regularmente con nuevas reseñas</li>
                  <li>Verifica que los comentarios sean auténticos y representativos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "email-config":
        return (
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
                    <h3 className="text-xl font-semibold">Obtener el Registro DKIM de NameCheap</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Para la configuración automática, solo necesitas el valor DKIM:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>En el panel de Private Email de NameCheap, haz clic en "Settings" (Configuración)</li>
                        <li>Ve a la sección "DNS Records" o "Mail Settings"</li>
                        <li>Busca el registro DKIM (empieza con "v=DKIM1;")</li>
                        <li>Copia el valor completo del registro DKIM</li>
                      </ol>

                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          📋 <strong>Importante:</strong> Solo necesitas copiar el valor DKIM. Los registros MX y SPF se configurarán automáticamente.
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
                        <div className="bg-teal-600 text-white rounded-lg p-4">
                          <p className="font-medium mb-2">Opción 1: Webmail de NameCheap</p>
                          <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                            <li>
                              Ve a{" "}
                              <a
                                href="https://privateemail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white underline hover:text-teal-100 inline-flex items-center gap-1"
                              >
                                privateemail.com
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </li>
                            <li>Ingresa tu dirección de correo completa</li>
                            <li>Ingresa la contraseña que creaste</li>
                          </ul>
                        </div>

                        <div className="bg-teal-600 text-white rounded-lg p-4">
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
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <GuidesSidebar activeGuide={activeGuide} onGuideChange={setActiveGuide} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 space-y-6">
          {renderGuideContent()}
        </div>
      </div>
    </div>
  );
}
