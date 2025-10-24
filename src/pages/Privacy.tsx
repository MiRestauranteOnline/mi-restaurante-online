import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { businessData } from "@/config/businessData";

const Privacy = () => {
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
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-PE')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Introducción</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                {businessData.company.legalName} (RUC: {businessData.company.ruc}), operando como {businessData.company.name}, 
                se compromete a proteger tu privacidad y datos personales. Esta Política de Privacidad explica qué información 
                recopilamos, cómo la usamos, con quién la compartimos, y tus derechos sobre tus datos.
              </p>
              <p>
                Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política.
              </p>
            </CardContent>
          </Card>

          {/* Data Controller */}
          <Card>
            <CardHeader>
              <CardTitle>Responsable del Tratamiento de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Razón Social:</strong> {businessData.company.legalName}</p>
                <p><strong>RUC:</strong> {businessData.company.ruc}</p>
                <p><strong>Dirección:</strong> {businessData.address.full}</p>
                <p><strong>Email de Contacto:</strong> {businessData.contact.email.general}</p>
                <p><strong>Soporte:</strong> soporte@mirestaurante.online</p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle>Información que Recopilamos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Información que Proporcionas Directamente:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Datos de Registro:</strong> Nombre, apellidos, email, teléfono, nombre del restaurante, dirección del restaurante.</li>
                  <li><strong>Información de Pago:</strong> Datos de tarjeta de crédito/débito (procesados de forma segura por Openpay Perú S.A., RUC N° 20607489433).</li>
                  <li><strong>Contenido del Sitio Web:</strong> Menú, fotos, logo, horarios, descripción del negocio, información de contacto que publicas en tu sitio.</li>
                  <li><strong>Comunicaciones:</strong> Mensajes que envías a nuestro equipo de soporte por email o WhatsApp.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Información Recopilada Automáticamente:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Datos de Uso:</strong> Páginas visitadas en tu dashboard, funcionalidades utilizadas, tiempo de sesión.</li>
                  <li><strong>Información Técnica:</strong> Dirección IP, tipo de navegador, sistema operativo, datos de dispositivo.</li>
                  <li><strong>Cookies y Tecnologías Similares:</strong> Ver nuestra sección de Cookies más abajo.</li>
                  <li><strong>Analytics de tu Sitio Web (Plan Avanzado):</strong> Número de visitantes, páginas vistas, fuentes de tráfico.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>Cómo Usamos tu Información</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>Utilizamos tus datos personales para los siguientes propósitos:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Prestación del Servicio:</strong> Crear, alojar y mantener tu sitio web profesional.</li>
                <li><strong>Procesamiento de Pagos:</strong> Facturar tu suscripción mensual mediante nuestro procesador de pagos Openpay Perú S.A., RUC N° 20607489433.</li>
                <li><strong>Soporte Técnico:</strong> Responder a tus consultas y resolver problemas técnicos.</li>
                <li><strong>Comunicaciones del Servicio:</strong> Enviarte recibos, notificaciones sobre tu cuenta, mantenimiento programado, cambios en términos.</li>
                <li><strong>Mejora del Servicio:</strong> Analizar el uso de nuestros servicios para mejorar funcionalidades y experiencia de usuario.</li>
                <li><strong>Cumplimiento Legal:</strong> Cumplir con obligaciones legales, resolver disputas, hacer cumplir nuestros acuerdos.</li>
                <li><strong>Marketing (con tu consentimiento):</strong> Enviarte información sobre nuevas funcionalidades, promociones, o contenido relevante. Puedes darte de baja en cualquier momento.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Legal Basis */}
          <Card>
            <CardHeader>
              <CardTitle>Base Legal para el Tratamiento de Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>Procesamos tus datos personales bajo las siguientes bases legales:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Ejecución de Contrato:</strong> Necesitamos tus datos para prestarte el servicio que contrataste.</li>
                <li><strong>Obligación Legal:</strong> Para cumplir con requisitos legales de facturación, tributarios, y retención de registros.</li>
                <li><strong>Interés Legítimo:</strong> Para mejorar nuestros servicios, prevenir fraudes, y mantener la seguridad de nuestros sistemas.</li>
                <li><strong>Consentimiento:</strong> Para enviar comunicaciones de marketing (que puedes retirar en cualquier momento).</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Compartir tu Información con Terceros</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>Compartimos tu información solo en las siguientes circunstancias:</p>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Procesadores de Pagos:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Openpay Perú S.A., RUC N° 20607489433:</strong> Nuestro procesador de pagos que maneja de forma segura la información de tu tarjeta y procesa los cobros mensuales. Openpay actúa como procesador de datos y cumple con estándares PCI-DSS. Tu información de tarjeta nunca es almacenada en nuestros servidores.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Proveedores de Servicios:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Hosting y Infrastructure:</strong> Supabase (base de datos y backend infrastructure).</li>
                  <li><strong>Email Services:</strong> Proveedores de email para enviar recibos y comunicaciones del servicio.</li>
                  <li><strong>Analytics Tools (Plan Avanzado):</strong> Google Analytics para proporcionar estadísticas de tu sitio web.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cumplimiento Legal:</h3>
                <p>Podemos divulgar tu información si es requerido por ley, orden judicial, o autoridades gubernamentales.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Transferencia de Negocio:</h3>
                <p>En caso de fusión, adquisición o venta de activos, tu información puede ser transferida al nuevo propietario.</p>
              </div>
              <p className="pt-4 border-t">
                <strong>No Vendemos tus Datos:</strong> Nunca vendemos, alquilamos o comercializamos tu información personal a terceros para sus propios fines de marketing.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>Transferencias Internacionales de Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Algunos de nuestros proveedores de servicios (como Supabase para hosting) pueden procesar datos fuera de Perú. 
                Cuando transferimos datos internacionalmente, nos aseguramos de que existan salvaguardas adecuadas para proteger 
                tu información, incluyendo contratos de procesamiento de datos que cumplen con estándares internacionales.
              </p>
              <p>
                Openpay Perú S.A., RUC N° 20607489433, nuestro procesador de pagos, cumple con estándares internacionales de protección de datos y PCI-DSS.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Durante la Suscripción Activa:</strong> Mantenemos toda tu información mientras tu cuenta esté activa.</li>
                <li><strong>Después de Cancelación:</strong> Guardamos tu sitio web completo por 6 meses para permitir reactivación fácil. Después de 6 meses, eliminamos el contenido de tu sitio.</li>
                <li><strong>Datos de Facturación:</strong> Por obligación legal tributaria, conservamos registros de facturación y pago durante 7 años.</li>
                <li><strong>Tickets de Soporte:</strong> Conservamos registros de soporte por 2 años para mejora del servicio y resolución de disputas.</li>
                <li><strong>Eliminación Bajo Solicitud:</strong> Puedes solicitar la eliminación anticipada de tus datos (sujeto a obligaciones legales de retención).</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de tus Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal 
                contra acceso no autorizado, alteración, divulgación o destrucción, incluyendo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encriptación de datos en tránsito (HTTPS/TLS) y en reposo</li>
                <li>Autenticación segura y control de acceso</li>
                <li>Auditorías regulares de seguridad</li>
                <li>Procesamiento de pagos mediante procesador PCI-DSS certificado (Openpay Perú S.A., RUC N° 20607489433)</li>
                <li>Backups regulares y planes de recuperación ante desastres</li>
                <li>Capacitación del personal en protección de datos</li>
              </ul>
              <p>
                Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. 
                Mientras nos esforzamos por usar medios comercialmente aceptables para proteger tu información, no podemos 
                garantizar su seguridad absoluta.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Tus Derechos sobre tus Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>Tienes los siguientes derechos respecto a tus datos personales:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Derecho de Acceso:</strong> Solicitar una copia de los datos personales que tenemos sobre ti.</li>
                <li><strong>Derecho de Rectificación:</strong> Corregir datos inexactos o incompletos. Puedes actualizar la mayoría de datos desde tu dashboard.</li>
                <li><strong>Derecho de Supresión:</strong> Solicitar la eliminación de tus datos (sujeto a obligaciones legales de retención).</li>
                <li><strong>Derecho de Oposición:</strong> Oponerte al procesamiento de tus datos para ciertos propósitos como marketing directo.</li>
                <li><strong>Derecho de Portabilidad:</strong> Recibir tus datos en formato estructurado y legible por máquina.</li>
                <li><strong>Derecho a Retirar Consentimiento:</strong> Retirar tu consentimiento para procesamiento basado en consentimiento (no afecta el procesamiento basado en otras bases legales).</li>
                <li><strong>Derecho a Presentar Queja:</strong> Presentar una queja ante la autoridad de protección de datos competente en Perú.</li>
              </ul>
              <p className="pt-4 border-t">
                Para ejercer cualquiera de estos derechos, contacta: {businessData.contact.email.general}
              </p>
            </CardContent>
          </Card>

          {/* Cookies Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Política de Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web y servicios.
              </p>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cookies Necesarias:</h3>
                <p className="mb-2">
                  Esenciales para el funcionamiento del sitio. Incluyen cookies de autenticación, seguridad, y preferencias 
                  de sesión. No se pueden desactivar sin afectar funcionalidades básicas.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cookies Analíticas:</h3>
                <p className="mb-2">
                  Nos ayudan a entender cómo los usuarios interactúan con nuestro sitio para mejorar la experiencia. 
                  Usamos Google Analytics en nuestro sitio corporativo y, para clientes del Plan Avanzado, en sus sitios web.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cookies de Funcionalidad:</h3>
                <p className="mb-2">
                  Recuerdan tus preferencias (idioma, región) para una experiencia personalizada.
                </p>
              </div>
              <p className="pt-4 border-t">
                <strong>Control de Cookies:</strong> Puedes configurar tu navegador para rechazar cookies, pero esto puede 
                limitar tu capacidad de usar ciertas funcionalidades del sitio. La mayoría de navegadores aceptan cookies 
                automáticamente, pero puedes modificar esta configuración.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Privacidad de Menores</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información 
                personal de menores. Si descubres que un menor ha proporcionado información personal, contáctanos 
                inmediatamente para que podamos eliminarla.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Cambios a esta Política de Privacidad</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Podemos actualizar esta Política de Privacidad ocasionalmente. Los cambios significativos serán notificados 
                por email o mediante aviso destacado en nuestro sitio web con al menos 30 días de anticipación. La fecha de 
                "Última actualización" al inicio de este documento indica cuándo fue revisada por última vez.
              </p>
              <p className="mt-4">
                Te recomendamos revisar esta política periódicamente para estar informado sobre cómo protegemos tu información.
              </p>
            </CardContent>
          </Card>

          {/* Contact for Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto para Asuntos de Privacidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para preguntas, solicitudes o quejas sobre esta Política de Privacidad o nuestras prácticas de datos, contáctanos:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Responsable de Datos:</strong> {businessData.company.legalName}</p>
                <p><strong>RUC:</strong> {businessData.company.ruc}</p>
                <p><strong>Email:</strong> {businessData.contact.email.general}</p>
                <p><strong>Dirección:</strong> {businessData.address.full}</p>
                <p><strong>Soporte:</strong> soporte@mirestaurante.online</p>
              </div>
              <p className="text-muted-foreground mt-4">
                Responderemos a tu solicitud dentro de 30 días hábiles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
