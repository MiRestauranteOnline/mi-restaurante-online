import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { businessData } from "@/config/businessData";
import { Link } from "react-router-dom";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Política de Cookies
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-PE')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>¿Qué son las Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o móvil) 
                cuando visitas un sitio web. Las cookies permiten que el sitio web reconozca tu dispositivo y recuerde 
                información sobre tu visita, como tus preferencias de navegación y actividad en el sitio.
              </p>
              <p>
                {businessData.company.name} utiliza cookies y tecnologías similares (como píxeles de seguimiento, 
                web beacons y almacenamiento local) para mejorar tu experiencia en nuestro sitio web, analizar cómo 
                utilizas nuestros servicios y proporcionar funcionalidades esenciales.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies We Use */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Cookies que Utilizamos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-6">
              
              {/* Essential Cookies */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-lg">1. Cookies Estrictamente Necesarias</h3>
                <p className="mb-3">
                  Estas cookies son esenciales para que puedas navegar por el sitio web y utilizar sus funciones básicas. 
                  Sin estas cookies, no podríamos proporcionar servicios fundamentales del sitio.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong>Propósito:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Autenticación de usuario (recordar que has iniciado sesión)</li>
                    <li>Seguridad del sitio y protección contra fraude</li>
                    <li>Gestión de sesiones en tu dashboard</li>
                    <li>Recordar preferencias esenciales durante tu sesión</li>
                  </ul>
                  <p className="pt-2"><strong>Duración:</strong> Sesión (se eliminan al cerrar el navegador) o persistentes (máximo 30 días)</p>
                  <p><strong>Desactivación:</strong> No se pueden desactivar sin afectar gravemente la funcionalidad del sitio</p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-lg">2. Cookies de Análisis y Rendimiento</h3>
                <p className="mb-3">
                  Utilizamos estas cookies para entender cómo los visitantes interactúan con nuestro sitio web, 
                  qué páginas son más populares, y cómo llegan a nuestro sitio. Esta información nos ayuda a 
                  mejorar la experiencia del usuario y optimizar nuestros servicios.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong>Proveedor:</strong> Google Analytics (Google LLC)</p>
                  <p><strong>Cookies específicas:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><code className="text-sm bg-muted px-1 py-0.5 rounded">_ga</code> - Distingue usuarios únicos (Duración: 2 años)</li>
                    <li><code className="text-sm bg-muted px-1 py-0.5 rounded">_ga_*</code> - Mantiene el estado de la sesión (Duración: 2 años)</li>
                    <li><code className="text-sm bg-muted px-1 py-0.5 rounded">_gid</code> - Distingue usuarios (Duración: 24 horas)</li>
                    <li><code className="text-sm bg-muted px-1 py-0.5 rounded">_gat</code> - Limita la tasa de solicitudes (Duración: 1 minuto)</li>
                  </ul>
                  <p className="pt-2"><strong>Información recopilada:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Páginas visitadas y tiempo de permanencia</li>
                    <li>Fuente de tráfico (cómo llegaste al sitio)</li>
                    <li>Tipo de dispositivo, navegador y sistema operativo</li>
                    <li>Ubicación geográfica aproximada (ciudad/país)</li>
                    <li>Interacciones con elementos del sitio (clics, scroll)</li>
                  </ul>
                  <p className="pt-2"><strong>Política de Privacidad de Google:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://policies.google.com/privacy</a></p>
                </div>
              </div>

              {/* Functionality Cookies */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-lg">3. Cookies de Funcionalidad</h3>
                <p className="mb-3">
                  Estas cookies permiten que el sitio web recuerde tus preferencias y elecciones para proporcionarte 
                  una experiencia más personalizada y mejorada.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong>Propósito:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Recordar tu idioma preferido</li>
                    <li>Recordar preferencias de visualización (tema oscuro/claro)</li>
                    <li>Recordar región o ubicación seleccionada</li>
                    <li>Mejorar funcionalidades del dashboard del cliente</li>
                  </ul>
                  <p className="pt-2"><strong>Duración:</strong> Persistentes (entre 30 días y 1 año)</p>
                  <p><strong>Desactivación:</strong> Pueden desactivarse, pero limitará algunas funcionalidades de personalización</p>
                </div>
              </div>

              {/* Client Website Analytics */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-lg">4. Cookies en Sitios Web de Clientes (Plan Avanzado)</h3>
                <p className="mb-3">
                  Si eres cliente de nuestro Plan Avanzado, instalamos Google Analytics en tu sitio web de restaurante 
                  para proporcionarte estadísticas de visitantes.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong>Nota importante:</strong> Como propietario del restaurante con Plan Avanzado, eres el responsable 
                  de informar a tus visitantes sobre estas cookies en tu propio sitio web. Recomendamos que incluyas 
                  una referencia a Google Analytics en tu política de privacidad del sitio del restaurante.</p>
                  <p className="pt-2"><strong>Información recopilada en el sitio de tu restaurante:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Número de visitantes únicos</li>
                    <li>Páginas más visitadas (menú, ubicación, contacto, etc.)</li>
                    <li>Fuentes de tráfico (búsqueda orgánica, redes sociales, directo)</li>
                    <li>Duración de las visitas</li>
                    <li>Dispositivos utilizados (móvil, tablet, desktop)</li>
                  </ul>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card>
            <CardHeader>
              <CardTitle>Servicios de Terceros</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Utilizamos servicios de terceros que pueden establecer sus propias cookies cuando visitas nuestro sitio:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-2">Google Tag Manager</h4>
                  <p className="text-sm">
                    Herramienta de gestión de etiquetas que nos permite implementar y actualizar códigos de seguimiento 
                    sin modificar directamente el código del sitio.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>ID de Contenedor:</strong> GTM-T8K3J3T7
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-2">Google Analytics 4</h4>
                  <p className="text-sm">
                    Plataforma de análisis web que nos proporciona información sobre el uso del sitio y comportamiento 
                    de los visitantes para mejorar nuestros servicios.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Más información:</strong> <a href="https://support.google.com/analytics/answer/11397207" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cómo utiliza Google Analytics las cookies</a>
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-2">Supabase</h4>
                  <p className="text-sm">
                    Nuestra infraestructura de backend puede establecer cookies técnicas necesarias para la autenticación 
                    y gestión de sesiones de usuario.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cómo Gestionar y Eliminar Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Tienes el derecho y la capacidad de controlar las cookies. La mayoría de navegadores web aceptan cookies 
                automáticamente, pero puedes modificar la configuración de tu navegador para rechazar cookies si lo prefieres.
              </p>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Configuración del Navegador:</h3>
                <p className="mb-3">Puedes gestionar las cookies a través de la configuración de tu navegador:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                    <br />
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Guía de Google Chrome</a>
                  </li>
                  <li>
                    <strong>Mozilla Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio
                    <br />
                    <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Guía de Mozilla Firefox</a>
                  </li>
                  <li>
                    <strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web
                    <br />
                    <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Guía de Safari</a>
                  </li>
                  <li>
                    <strong>Microsoft Edge:</strong> Configuración → Cookies y permisos del sitio → Cookies y datos de sitios
                    <br />
                    <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Guía de Microsoft Edge</a>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  ⚠️ Importante: Consecuencias de Desactivar Cookies
                </h4>
                <p className="text-sm">
                  Si decides desactivar o eliminar cookies, especialmente las cookies estrictamente necesarias, 
                  algunas partes de nuestro sitio web pueden no funcionar correctamente. Específicamente:
                </p>
                <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                  <li>No podrás iniciar sesión en tu cuenta</li>
                  <li>Perderás preferencias guardadas</li>
                  <li>Algunas funcionalidades del dashboard no estarán disponibles</li>
                  <li>La experiencia de usuario puede verse significativamente degradada</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Opt-Out de Google Analytics:</h3>
                <p className="mb-2">
                  Si deseas desactivar específicamente el seguimiento de Google Analytics en todos los sitios web, 
                  puedes instalar el complemento de inhabilitación de Google Analytics:
                </p>
                <a 
                  href="https://tools.google.com/dlpage/gaoptout" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Descargar complemento de opt-out para Google Analytics →
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Duración de las Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>Las cookies que utilizamos tienen diferentes períodos de vida:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="font-semibold text-foreground min-w-[140px]">Cookies de Sesión:</div>
                  <div>Son temporales y se eliminan cuando cierras el navegador. Utilizadas principalmente para autenticación.</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="font-semibold text-foreground min-w-[140px]">Cookies Persistentes:</div>
                  <div>Permanecen en tu dispositivo por un período específico (desde 24 horas hasta 2 años). Utilizadas para análisis y funcionalidad.</div>
                </div>
              </div>
              <p className="pt-4 border-t">
                Las cookies se eliminan automáticamente cuando expiran. También puedes eliminarlas manualmente en 
                cualquier momento a través de la configuración de tu navegador.
              </p>
            </CardContent>
          </Card>

          {/* Updates to Cookie Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Cambios a esta Política de Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las cookies que 
                utilizamos o por razones operativas, legales o regulatorias.
              </p>
              <p>
                Te recomendamos revisar esta página periódicamente para estar informado sobre cómo utilizamos las cookies. 
                La fecha de "Última actualización" al inicio de este documento indica cuándo fue revisada por última vez.
              </p>
              <p>
                Para cambios significativos, te notificaremos por email o mediante un aviso destacado en nuestro sitio web.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Si tienes preguntas sobre nuestra Política de Cookies o sobre cómo utilizamos las cookies, 
                puedes contactarnos:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> {businessData.contact.email.general}</p>
                <p><strong>Soporte:</strong> soporte@mirestaurante.online</p>
                <p><strong>Dirección:</strong> {businessData.address.full}</p>
              </div>
              <p className="text-muted-foreground mt-4">
                Para más información sobre cómo protegemos tu privacidad y datos personales, consulta nuestra{" "}
                <Link to="/privacy" className="text-primary hover:underline">Política de Privacidad</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
