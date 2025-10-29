import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { businessData } from "@/config/businessData";

const Terms = () => {
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
            Términos de Servicio
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-PE')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Razón Social:</strong> {businessData.company.legalName}</p>
                <p><strong>RUC:</strong> {businessData.company.ruc}</p>
                <p><strong>Nombre Comercial:</strong> {businessData.company.name}</p>
                <p><strong>Dirección:</strong> {businessData.address.full}</p>
                <p><strong>Email General:</strong> {businessData.contact.email.general}</p>
                <p><strong>Email Soporte:</strong> soporte@mirestaurante.online</p>
                <p><strong>Soporte Premium:</strong> premiumsoporte@mirestaurante.online</p>
                <p><strong>Teléfono/WhatsApp:</strong> {businessData.contact.phone.display}</p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Mi Restaurante Online ofrece un servicio de suscripción mensual que incluye el desarrollo, 
                alojamiento y mantenimiento continuo de sitios web profesionales para restaurantes. Este es 
                un servicio digital administrado; no vendemos productos físicos ni realizamos entregas materiales.
              </p>
              <p>
                El servicio incluye: diseño web basado en plantillas profesionales optimizadas, alojamiento web, 
                actualizaciones de contenido mediante panel de control, soporte técnico, y mantenimiento continuo 
                de la infraestructura.
              </p>
            </CardContent>
          </Card>

          {/* Payment Processing Partner */}
          <Card>
            <CardHeader>
              <CardTitle>Procesamiento de Pagos y Socio Comercial</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Procesador de Pagos Autorizado:</strong> Los pagos con tarjeta de crédito y débito son 
                procesados de manera segura por <strong>OPENPAY PERÚ S.A.</strong> (RUC N° 20607489433), una 
                empresa de procesamiento de pagos debidamente autorizada y regulada en Perú. OPENPAY actúa como 
                nuestro proveedor de servicios de pago (PSP) y agregador de pagos.
              </p>
              <p>
                <strong>Términos Adicionales Aplicables:</strong> Al realizar un pago a través de nuestra plataforma, 
                usted también acepta estar sujeto a los Términos y Condiciones Generales de Uso de los Servicios 
                de OPENPAY PERÚ, disponibles en{" "}
                <a href="https://www.openpay.pe/terminos-condiciones" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.openpay.pe/terminos-condiciones
                </a>
              </p>
              <p>
                <strong>Seguridad de Datos de Tarjetas:</strong> OPENPAY cumple con los estándares PCI-DSS (Payment 
                Card Industry Data Security Standard) para el manejo seguro de información de tarjetas de crédito 
                y débito. {businessData.company.name} no almacena, procesa ni tiene acceso a los datos completos 
                de tu tarjeta (número completo, CVV, o fecha de vencimiento). Esta información es manejada 
                exclusivamente por OPENPAY de forma encriptada y segura.
              </p>
              <p>
                <strong>Tarjetas Aceptadas:</strong> A través de OPENPAY, aceptamos tarjetas de crédito y débito 
                Visa, Mastercard, Diners Club y American Express, tanto nacionales como internacionales.
              </p>
            </CardContent>
          </Card>

          {/* Pricing and Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Planes y Precios</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Plan Básico - S/ 297 por mes</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Visitas y ancho de banda ilimitados</li>
                  <li>Hosting con SSL incluido (https gratis)</li>
                  <li>Soporte básico por WhatsApp</li>
                  <li>Soporte por email (respuesta en 48h)</li>
                  <li>Actualizaciones de contenido autoservicio vía dashboard</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Plan Avanzado - S/ 497 por mes</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Visitas y ancho de banda ilimitados</li>
                  <li>Hosting con SSL incluido (https gratis)</li>
                  <li>1 hora/mes de soporte profesional para cambios de textos e imágenes</li>
                  <li>Soporte prioritario (respuesta en 24h)</li>
                  <li>WhatsApp premium con PIN único de soporte</li>
                  <li>Dashboard de Analytics básico y reportes mensuales</li>
                  <li>Configuración de Google Analytics y Search Console incluida</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Billing Cycle */}
          <Card>
            <CardHeader>
              <CardTitle>Ciclo de Facturación y Pagos Recurrentes</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Moneda:</strong> Todos los precios están expresados en Soles Peruanos (S/ o PEN).
              </p>
              <p>
                <strong>Primer Cobro:</strong> El primer cargo se realiza al momento de completar el registro 
                y proporcionar tu información de pago. El sitio web se entrega dentro de las 72 horas posteriores 
                al pago exitoso.
              </p>
              <p>
                <strong>Cobros Mensuales Automáticos:</strong> Al suscribirte, autorizas expresamente a {businessData.company.legalName} a almacenar de forma segura tu información de tarjeta de crédito/débito 
                y a realizar cobros automáticos mensuales por el monto de tu plan seleccionado, cada mes en la misma 
                fecha de tu registro inicial, hasta que canceles tu suscripción.
              </p>
              <p>
                <strong>Renovación Automática:</strong> Tu suscripción se renueva automáticamente cada mes. 
                Recibirás un recibo por email después de cada cobro exitoso.
              </p>
              <p>
                <strong>Hosting Ilimitado:</strong> Todos los planes incluyen hosting ilimitado sin cargos adicionales 
                por visitas o ancho de banda. Utilizamos infraestructura de Cloudflare Pages para garantizar 
                rendimiento y disponibilidad.
              </p>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Política de Cancelación</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Cómo Cancelar:</strong> Puedes cancelar tu suscripción en cualquier momento desde tu panel 
                de control del cliente o enviando un email a soporte@mirestaurante.online.
              </p>
              <p>
                <strong>Cuándo Toma Efecto:</strong> La cancelación toma efecto al final de tu ciclo de facturación 
                actual. No se realizarán más cobros después de esa fecha. Seguirás teniendo acceso completo a tu sitio 
                web hasta el último día de tu período pagado.
              </p>
              <p>
                <strong>Después de la Cancelación:</strong> Tu sitio web será desactivado al finalizar tu ciclo de 
                facturación. Guardamos tu sitio web completo (incluyendo contenido, imágenes y configuraciones) en 
                nuestro sistema durante 6 meses para que puedas reactivarlo fácilmente si decides volver.
              </p>
              <p>
                <strong>Servicio Administrado:</strong> Como este es un servicio administrado y alojado, no ofrecemos 
                migración del sitio web a otros servidores ni entrega del código fuente.
              </p>
            </CardContent>
          </Card>

          {/* Refund Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Política de Reembolsos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Reembolsos por Mes Parcial:</strong> No ofrecemos reembolsos prorrateados por meses parciales 
                ya pagados. Si cancelas a mitad de mes, mantendrás acceso hasta el final del período pagado.
              </p>
              <p>
                <strong>Reembolsos por Incumplimiento de Servicio:</strong> Si no logramos entregar tu sitio web 
                dentro de las 72 horas prometidas después del pago, o si experimentas interrupciones prolongadas del 
                servicio por causas atribuibles a nosotros, puedes solicitar un reembolso proporcional por el tiempo 
                sin servicio.
              </p>
              <p>
                <strong>Cómo Solicitar un Reembolso:</strong> Envía un email a soporte@mirestaurante.online con tu 
                número de cliente y el motivo de tu solicitud. Procesaremos las solicitudes válidas dentro de 7-10 
                días hábiles.
              </p>
              <p>
                <strong>Garantía de Satisfacción (Primer Mes):</strong> Si no estás satisfecho con tu sitio web 
                durante los primeros 7 días desde la entrega, ofrecemos reembolso completo del primer mes.
              </p>
            </CardContent>
          </Card>

          {/* Disputes and Chargebacks */}
          <Card>
            <CardHeader>
              <CardTitle>Disputas, Contracargos y Política de Fraude</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Contacta Primero:</strong> Antes de iniciar una disputa o contracargo (chargeback) con tu 
                banco, te pedimos encarecidamente que nos contactes primero a soporte@mirestaurante.online. La 
                mayoría de problemas pueden resolverse rápidamente mediante comunicación directa y de buena fe.
              </p>
              <p>
                <strong>Evidencia que Mantenemos:</strong> Guardamos registros detallados y completos de todos los 
                servicios prestados por un período de 24 meses, incluyendo: fecha de entrega del sitio web, logs 
                de actividad en el dashboard, tickets de soporte atendidos, tiempo de actividad del servidor, 
                capturas de pantalla timestamped de entregables, emails de comunicación, confirmaciones de pago, 
                y registros de acceso al panel de control.
              </p>
              <p>
                <strong>Proceso de Resolución de Disputas:</strong> Si presentas una disputa o contracargo, 
                cooperaremos completamente con tu banco y el procesador de pagos, proporcionando toda la 
                documentación necesaria que demuestre la prestación del servicio. El proceso de resolución 
                puede tomar de 30 a 90 días según las políticas de tu banco.
              </p>
              <p>
                <strong>Suspensión Inmediata por Contracargo:</strong> Si se presenta un contracargo sin intentar 
                resolver primero el problema con nosotros directamente, nos reservamos el derecho de suspender 
                inmediatamente el acceso al servicio y tu sitio web hasta que se resuelva la disputa. Esta 
                suspensión protege a ambas partes durante el proceso de investigación.
              </p>
              <p>
                <strong>Contracargos Fraudulentos:</strong> Los contracargos fraudulentos (solicitar un contracargo 
                después de haber recibido y usado el servicio satisfactoriamente) constituyen fraude y pueden 
                resultar en:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Terminación permanente de la cuenta sin posibilidad de reactivación</li>
                <li>Inclusión en listas de comercios de alto riesgo compartidas con procesadores de pago</li>
                <li>Reporte a autoridades competentes y/o centrales de riesgo</li>
                <li>Inicio de acciones legales civiles y/o penales según corresponda</li>
                <li>Cobro de honorarios legales y costos asociados</li>
              </ul>
              <p>
                <strong>Tarifas de Contracargo:</strong> Cuando tu banco o procesador de pagos emite un contracargo, 
                OPENPAY nos cobra una tarifa administrativa (típicamente entre S/50-S/100 por disputa). Si el 
                contracargo se resuelve en nuestro favor (es decir, se demuestra que el servicio fue prestado 
                correctamente), nos reservamos el derecho de cobrarte estas tarifas administrativas más cualquier 
                costo legal razonable incurrido.
              </p>
              <p>
                <strong>Historial de Disputas:</strong> Mantenemos un registro de todas las disputas y contracargos. 
                Clientes con múltiples disputas pueden ser considerados de alto riesgo y sujetos a términos 
                especiales o terminación de servicio.
              </p>
              <p>
                <strong>Derecho de Defensa:</strong> Tenemos el derecho absoluto de defendernos contra cualquier 
                contracargo injustificado proporcionando toda la evidencia documental a tu banco emisor y al 
                procesador de pagos OPENPAY.
              </p>
            </CardContent>
          </Card>

          {/* Service Delivery and SLAs */}
          <Card>
            <CardHeader>
              <CardTitle>Entrega del Servicio y Acuerdos de Nivel de Servicio (SLA)</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Entrega Inicial:</strong> Tu sitio web profesional estará completamente listo y publicado 
                online dentro de las 72 horas (3 días hábiles) después de que recibamos tu pago y toda la información 
                necesaria (logo, menú, fotos, textos).
              </p>
              <p>
                <strong>Tiempo de Actividad del Servidor:</strong> Nos esforzamos por mantener un uptime del 99.5% 
                mensual. El mantenimiento programado se notifica con 48 horas de anticipación.
              </p>
              <p>
                <strong>Horarios de Soporte:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Plan Básico:</strong> Soporte por email con respuesta en 48 horas hábiles. WhatsApp disponible en horario de oficina ({businessData.businessHours.weekdays.display}).</li>
                <li><strong>Plan Avanzado:</strong> Soporte prioritario con respuesta en 24 horas hábiles. WhatsApp premium disponible con tiempos de respuesta más rápidos.</li>
              </ul>
              <p>
                <strong>Actualizaciones de Contenido:</strong> Las actualizaciones que realices tú mismo desde el 
                dashboard (menú, horarios, fotos) son inmediatas. Los cambios que requieran intervención de nuestro 
                equipo (Plan Avanzado) se completan según disponibilidad de tu paquete de horas mensuales.
              </p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle>Elegibilidad y Requisitos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Edad Mínima:</strong> Debes tener al menos 18 años de edad para suscribirte a nuestros servicios.
              </p>
              <p>
                <strong>Información Precisa:</strong> Al registrarte, aceptas proporcionar información precisa, 
                actualizada y completa sobre tu restaurante y datos de contacto. Debes mantener actualizada tu 
                información de pago y email para recibir facturas y comunicaciones importantes.
              </p>
              <p>
                <strong>Representación Legal:</strong> Declaras tener la autoridad legal para suscribir tu restaurante 
                o negocio a estos servicios y aceptar estos términos en nombre de tu empresa.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle>Uso Aceptable del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Contenido Prohibido:</strong> No puedes publicar en tu sitio web contenido que sea ilegal, 
                difamatorio, fraudulento, pornográfico, que viole derechos de propiedad intelectual, o que promueva 
                actividades ilegales.
              </p>
              <p>
                <strong>Actividades Prohibidas:</strong> No está permitido usar el servicio para phishing, distribución 
                de malware, spam, violación de sanciones internacionales, o cualquier actividad fraudulenta.
              </p>
              <p>
                <strong>Suspensión por Abuso:</strong> Nos reservamos el derecho de suspender o cancelar 
                inmediatamente cuentas que violen esta política de uso aceptable, sin reembolso.
              </p>
              <p>
                <strong>Cumplimiento de Leyes:</strong> Eres responsable de asegurar que el contenido de tu sitio web 
                cumpla con todas las leyes aplicables en Perú y cualquier otra jurisdicción relevante.
              </p>
            </CardContent>
          </Card>

          {/* Prohibited Business Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Actividades Comerciales Prohibidas</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                De conformidad con los requisitos de nuestro procesador de pagos OPENPAY, nuestro servicio 
                <strong> NO puede ser utilizado</strong> por restaurantes o negocios que ofrezcan, vendan, 
                distribuyan o estén involucrados en las siguientes actividades:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Contenido para adultos, pornografía o servicios eróticos</li>
                <li>Bienes o servicios ilegales bajo las leyes de Perú</li>
                <li>Productos farmacéuticos no autorizados o ilegales</li>
                <li>Servicios financieros no autorizados (préstamos, captación de ahorros, cambio de cheques)</li>
                <li>Apuestas, juegos de azar, casinos, loterías o rifas sin autorización</li>
                <li>Marketing multinivel o esquemas piramidales</li>
                <li>Productos falsificados, de contrabando o que violen derechos de propiedad intelectual</li>
                <li>Material que promueva racismo, discriminación o violencia</li>
                <li>Bienes embargados o de procedencia ilícita</li>
                <li>Servicios de entregas en efectivo o giros postales</li>
                <li>Actividades que no impliquen la venta genuina de bienes o servicios</li>
              </ul>
              <p>
                <strong>Verificación y Cumplimiento:</strong> Nos reservamos el derecho de verificar la naturaleza 
                de tu negocio. Al registrarte, declaras que tu restaurante opera de manera legal y no está involucrado 
                en ninguna de las actividades prohibidas listadas. El incumplimiento de esta declaración resulta en 
                la terminación inmediata de la cuenta sin reembolso.
              </p>
              <p>
                <strong>Actividades Restringidas:</strong> Algunas actividades pueden requerir autorización previa 
                de OPENPAY (por ejemplo, eventos especiales con rifas, venta de alcohol). Contáctanos antes de 
                promocionar estas actividades en tu sitio web.
              </p>
            </CardContent>
          </Card>

          {/* Jurisdiction */}
          <Card>
            <CardHeader>
              <CardTitle>Jurisdicción y Ley Aplicable</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Estos Términos de Servicio se rigen por las leyes de la República del Perú. Cualquier disputa que 
                surja de o relacionada con estos términos o el servicio prestado será sometida a la jurisdicción 
                exclusiva de los tribunales de Lima, Perú.
              </p>
              <p>
                Las partes acuerdan intentar resolver cualquier disputa primero mediante negociación de buena fe. 
                Si no se alcanza una solución en 30 días, cualquiera de las partes puede proceder con acciones legales 
                formales.
              </p>
            </CardContent>
          </Card>

          {/* Invoices and Communications */}
          <Card>
            <CardHeader>
              <CardTitle>Facturas y Comunicaciones</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Recibos por Email:</strong> Después de cada cobro mensual exitoso, enviaremos automáticamente 
                un recibo a tu email registrado. Es tu responsabilidad mantener actualizada tu dirección de email.
              </p>
              <p>
                <strong>Comunicaciones del Servicio:</strong> Enviamos notificaciones importantes sobre tu cuenta, 
                mantenimiento programado, cambios en los términos, y recordatorios de pago a tu email registrado.
              </p>
              <p>
                <strong>Mantén tu Información Actualizada:</strong> Debes actualizar tu email y método de pago en tu 
                panel de control si cambian. No somos responsables por problemas causados por información de contacto 
                desactualizada.
              </p>
            </CardContent>
          </Card>

          {/* Promotions and Discounts */}
          <Card>
            <CardHeader>
              <CardTitle>Promociones y Descuentos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Cupones de Descuento:</strong> Ocasionalmente ofrecemos cupones promocionales (ejemplo: 50% 
                de descuento en el próximo mes). Estos descuentos son promocionales y de uso único.
              </p>
              <p>
                <strong>No Modifican el Precio Base:</strong> Los cupones y descuentos promocionales no modifican 
                el precio base de tu suscripción mensual. Una vez usado el cupón, tu tarjeta será cobrada al precio 
                normal del plan en los ciclos siguientes.
              </p>
              <p>
                <strong>Términos de Promociones:</strong> Cada promoción puede tener términos específicos y fecha de 
                vencimiento. Los cupones no son transferibles ni canjeables por efectivo.
              </p>
              <p>
                <strong>Precio de Lanzamiento Garantizado:</strong> Los clientes que se suscriban durante nuestro 
                período promocional de lanzamiento mantienen su precio de suscripción de por vida mientras su cuenta 
                permanezca activa sin interrupciones. El precio de lanzamiento no incluye impuestos que cambien por 
                ley ni comisiones de tu banco por conversión de moneda.
              </p>
            </CardContent>
          </Card>

          {/* Failed Payments & Dunning */}
          <Card>
            <CardHeader>
              <CardTitle>Pagos Fallidos y Gestión de Mora</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Reintentos Automáticos:</strong> Si un pago automático falla, nuestro sistema reintentará 
                el cobro automáticamente durante los siguientes 7 días. Se realizarán hasta 3 intentos de cobro.
              </p>
              <p>
                <strong>Período de Gracia:</strong> Si después de los reintentos el pago no se procesa exitosamente, 
                tu cuenta entrará en un período de gracia de 5 días adicionales durante el cual tu sitio web 
                permanecerá activo pero recibirás notificaciones diarias para actualizar tu método de pago.
              </p>
              <p>
                <strong>Suspensión por Impago:</strong> Si transcurridos 12 días desde el pago fallido no se ha 
                regularizado la situación, tu sitio web será suspendido temporalmente y no estará accesible al 
                público hasta que se resuelva el pago pendiente.
              </p>
              <p>
                <strong>Terminación por Impago:</strong> Si el impago persiste por más de 30 días, nos reservamos 
                el derecho de terminar tu cuenta y eliminar tu sitio web permanentemente.
              </p>
              <p>
                <strong>Responsabilidad del Cliente:</strong> Es tu responsabilidad mantener información de pago 
                válida y fondos suficientes para los cargos recurrentes.
              </p>
            </CardContent>
          </Card>

          {/* Force Majeure */}
          <Card>
            <CardHeader>
              <CardTitle>Fuerza Mayor</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                No seremos responsables por demoras o incumplimientos en la prestación del servicio causados por 
                eventos fuera de nuestro control razonable, incluyendo pero no limitado a: desastres naturales, 
                incendios, inundaciones, terremotos, guerras, disturbios civiles, actos terroristas, pandemias, 
                huelgas laborales, interrupciones de internet o telecomunicaciones, fallas en proveedores de 
                servicios en la nube, ataques cibernéticos, cambios en regulaciones gubernamentales, u otros 
                eventos de fuerza mayor.
              </p>
              <p>
                En caso de fuerza mayor, haremos nuestros mejores esfuerzos para restaurar el servicio lo antes 
                posible y notificaremos a los clientes afectados sobre la situación y el tiempo estimado de resolución.
              </p>
            </CardContent>
          </Card>

          {/* Liability Limitation */}
          <Card>
            <CardHeader>
              <CardTitle>Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Límite Máximo de Responsabilidad:</strong> En ningún caso nuestra responsabilidad total 
                hacia ti por todos los daños, pérdidas y causas de acción (ya sea por contrato, agravio, 
                incluyendo negligencia, o de otro modo) excederá el monto total que hayas pagado a {businessData.company.name} durante los últimos 12 meses anteriores al evento que dio lugar al reclamo.
              </p>
              <p>
                <strong>Exclusión de Daños Indirectos:</strong> En la máxima medida permitida por la ley, 
                {businessData.company.name} no será responsable por daños indirectos, incidentales, especiales, 
                consecuentes o punitivos, incluyendo pero no limitado a pérdida de beneficios, pérdida de datos, 
                pérdida de oportunidad comercial, o interrupción del negocio, incluso si hemos sido advertidos 
                de la posibilidad de tales daños.
              </p>
              <p>
                <strong>Servicio "Como Está":</strong> El servicio se proporciona "como está" y "según disponibilidad". 
                No garantizamos que el servicio será ininterrumpido, libre de errores, o completamente seguro.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Propiedad Intelectual y Licencia</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Tu Contenido es Tuyo:</strong> Conservas todos los derechos de propiedad sobre el contenido 
                que subas a tu sitio web (textos, imágenes, logos, menús, etc.). Al usar nuestro servicio, nos 
                otorgas una licencia limitada, no exclusiva, para hospedar, almacenar, mostrar y procesar tu 
                contenido únicamente con el propósito de prestarte el servicio contratado.
              </p>
              <p>
                <strong>Nuestra Plataforma es Nuestra:</strong> La plataforma, el código fuente, el diseño, la 
                arquitectura, y todos los elementos técnicos del servicio (excluyendo tu contenido) son propiedad 
                exclusiva de {businessData.company.legalName} o sus licenciantes. Al suscribirte, recibes únicamente 
                una licencia limitada, revocable, no transferible para usar la plataforma durante tu período de 
                suscripción activa.
              </p>
              <p>
                <strong>Sin Transferencia de Código:</strong> Como servicio administrado, no transfieres ni adquieres 
                derechos sobre el código fuente, la infraestructura técnica, o los métodos de implementación. 
                El servicio no incluye entrega o licenciamiento del código fuente.
              </p>
              <p>
                <strong>Uso de tu Contenido para Marketing:</strong> Con tu consentimiento previo, podemos usar 
                capturas de pantalla de tu sitio web como ejemplos en nuestro material de marketing, portfolio, 
                o casos de estudio.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Proveedores de Servicios de Terceros y Seguridad de Pagos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Procesador de Pagos Principal - OPENPAY:</strong> Todos los pagos con tarjeta de crédito 
                y débito son procesados exclusivamente por <strong>OPENPAY PERÚ S.A.</strong> (RUC N° 20607489433), 
                ubicada en Av. José Pardo 620, Oficina 502, Miraflores, Lima, Perú. OPENPAY es un procesador de 
                pagos autorizado y cumple con la certificación PCI-DSS Level 1 (el más alto estándar de seguridad 
                en la industria de pagos).
              </p>
              <p>
                <strong>Protección de Datos de Tarjetas:</strong> Cuando ingresas tu información de tarjeta durante 
                el proceso de pago, esta información es transmitida directamente a los servidores seguros de OPENPAY 
                mediante conexión encriptada (SSL/TLS 256-bit). {businessData.company.name} <strong>NUNCA</strong> almacena, 
                procesa, ni tiene acceso a:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>El número completo de tu tarjeta (solo vemos los últimos 4 dígitos)</li>
                <li>El código de seguridad CVV/CVC</li>
                <li>Los datos de la banda magnética o chip de tu tarjeta</li>
                <li>Tus credenciales bancarias o contraseñas</li>
              </ul>
              <p>
                <strong>Tokenización:</strong> OPENPAY utiliza tecnología de tokenización para proteger tu información. 
                Después de tu primer pago, tu tarjeta es convertida en un "token" seguro que permite realizar cobros 
                recurrentes sin exponer los datos reales de tu tarjeta.
              </p>
              <p>
                <strong>Cumplimiento Normativo:</strong> OPENPAY cumple con todas las regulaciones aplicables en Perú, 
                incluyendo las normativas de la Superintendencia de Banca, Seguros y AFP (SBS) y las disposiciones 
                de Visa, Mastercard, American Express y Diners Club International.
              </p>
              <p>
                <strong>Responsabilidad de Seguridad:</strong> Mientras OPENPAY maneja el procesamiento seguro de 
                pagos, tú eres responsable de:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Mantener seguras tus credenciales de acceso al dashboard</li>
                <li>No compartir tu usuario y contraseña con terceros</li>
                <li>Notificarnos inmediatamente si sospechas acceso no autorizado a tu cuenta</li>
                <li>Mantener actualizada tu información de contacto para recibir alertas de seguridad</li>
              </ul>
              <p>
                <strong>Infraestructura de Hosting:</strong> Utilizamos Cloudflare Pages y otros proveedores de 
                servicios en la nube de primer nivel para el alojamiento y almacenamiento de tu sitio web. Estos 
                proveedores cumplen con estándares internacionales de seguridad ISO 27001 y SOC 2.
              </p>
              <p>
                <strong>Servicios de Email:</strong> Utilizamos Resend y otros servicios de terceros autorizados 
                para el envío de emails transaccionales (recibos, notificaciones de servicio, facturas electrónicas).
              </p>
              <p>
                <strong>Limitación de Responsabilidad por Terceros:</strong> Si bien seleccionamos cuidadosamente 
                a nuestros proveedores verificando sus certificaciones de seguridad, no somos responsables por 
                fallas, interrupciones, brechas de seguridad, o problemas técnicos originados directamente en los 
                servicios de terceros que estén fuera de nuestro control razonable. Sin embargo, haremos nuestros 
                mejores esfuerzos para resolver cualquier inconveniente y coordinar soluciones con los proveedores.
              </p>
              <p>
                <strong>Cambios de Proveedores:</strong> Nos reservamos el derecho de cambiar o agregar proveedores 
                de servicios según sea necesario para mejorar nuestro servicio, siempre asegurando que cumplan con 
                los mismos o superiores estándares de seguridad.
              </p>
            </CardContent>
          </Card>

          {/* Taxes and Currency */}
          <Card>
            <CardHeader>
              <CardTitle>Impuestos, Moneda y Tarifas de Transacción</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Precios Incluyen IGV:</strong> Todos los precios publicados en nuestro sitio web están 
                expresados en Soles Peruanos (PEN / S/) e incluyen el Impuesto General a las Ventas (IGV) del 18% 
                aplicable en Perú.
              </p>
              <p>
                <strong>Moneda de Cobro:</strong> Los cobros se realizan exclusivamente en Soles Peruanos (PEN). 
                Si tu tarjeta es de otro país o denominada en otra moneda, tu banco o procesador de pagos aplicará 
                el tipo de cambio vigente y puede cobrar comisiones por conversión de moneda, las cuales no 
                controlamos ni recibimos.
              </p>
              <p>
                <strong>Impuesto a las Transacciones Financieras (ITF):</strong> De conformidad con la legislación 
                peruana, las transacciones por montos iguales o superiores a S/1,000 (mil soles) o su equivalente 
                en dólares están sujetas al Impuesto a las Transacciones Financieras (ITF) del 0.005% del monto 
                total de la transacción. Este impuesto es aplicado automáticamente por tu banco y/o el procesador 
                de pagos. {businessData.company.name} no cobra ni retiene este impuesto; es una obligación fiscal 
                establecida por ley.
              </p>
              <p>
                <strong>Comisiones del Procesador de Pagos:</strong> Las comisiones de procesamiento de pagos 
                cobradas por OPENPAY a {businessData.company.name} están incluidas en el precio de tu suscripción. 
                No cobramos tarifas adicionales de procesamiento de tarjetas a nuestros clientes. Sin embargo, 
                tu banco emisor puede cobrar comisiones propias que están fuera de nuestro control.
              </p>
              <p>
                <strong>Tarifas Bancarias Internacionales:</strong> Si utilizas una tarjeta emitida fuera de Perú, 
                tu banco puede aplicar:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Comisión por transacción internacional (típicamente 2-4%)</li>
                <li>Cargo por conversión de moneda</li>
                <li>Diferencial de tipo de cambio</li>
              </ul>
              <p>
                Estas tarifas son establecidas por tu banco emisor y aparecerán en tu estado de cuenta bancario. 
                {businessData.company.name} no recibe ni controla estas comisiones.
              </p>
              <p>
                <strong>Comprobantes de Pago:</strong> Emitimos comprobantes de pago electrónicos (boletas o facturas) 
                según corresponda y conforme a la normativa de SUNAT. Las facturas electrónicas se emiten únicamente 
                si proporcionas tu RUC válido y razón social al momento del registro o pago. Los comprobantes se 
                envían automáticamente a tu email registrado dentro de las 24 horas posteriores a cada pago exitoso.
              </p>
              <p>
                <strong>Solicitud de Facturas:</strong> Para solicitar factura, debes proporcionar:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>RUC válido (11 dígitos)</li>
                <li>Razón social completa</li>
                <li>Dirección fiscal completa</li>
              </ul>
              <p>
                Las facturas no pueden emitirse con fecha retroactiva ni modificarse una vez emitidas, según 
                normativa de SUNAT. Asegúrate de proporcionar información correcta antes del pago.
              </p>
              <p>
                <strong>Responsabilidad Fiscal:</strong> Eres responsable de cumplir con todas las obligaciones 
                fiscales aplicables a tu negocio relacionadas con el uso de nuestro servicio, incluyendo la 
                declaración correcta de gastos deducibles ante SUNAT.
              </p>
              <p>
                <strong>Retención de Impuestos:</strong> Si tu empresa está sujeta a regímenes especiales de 
                retención de impuestos, debes notificárnoslo. Coordinaremos el procedimiento adecuado según 
                la normativa aplicable.
              </p>
            </CardContent>
          </Card>

          {/* Service Modifications */}
          <Card>
            <CardHeader>
              <CardTitle>Modificaciones al Servicio y Términos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Mejoras y Actualizaciones Técnicas:</strong> Nos reservamos el derecho de mejorar, actualizar, 
                modificar o agregar nuevas funcionalidades técnicas al servicio en cualquier momento. Las mejoras 
                generalmente se implementan automáticamente y sin costo adicional para beneficiar a todos 
                los clientes.
              </p>
              <p>
                <strong>Mantenimiento Programado:</strong> Podemos realizar mantenimiento programado del sistema 
                que puede resultar en interrupciones temporales del servicio. Te notificaremos con al menos 48 
                horas de anticipación sobre mantenimientos programados que afecten la disponibilidad de tu sitio web.
              </p>
              <p>
                <strong>Cambios en Funcionalidades No Críticas:</strong> Podemos descontinuar, modificar o reemplazar 
                ciertas funcionalidades del servicio. Si un cambio afecta significativamente tu uso del servicio, 
                te notificaremos con anticipación razonable.
              </p>
              <p>
                <strong>Cambios Relacionados con Pagos y Precios (Aviso de 30 Días):</strong> De conformidad con 
                los requisitos de nuestro procesador de pagos OPENPAY, cualquier modificación relacionada con:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Precios de suscripción</li>
                <li>Métodos de pago aceptados</li>
                <li>Términos de facturación y cobro</li>
                <li>Políticas de cancelación y reembolso</li>
                <li>Estructura de comisiones o tarifas</li>
              </ul>
              <p>
                Será notificada a todos los clientes afectados con <strong>al menos 30 (treinta) días calendario 
                de anticipación</strong> a través de email a tu dirección registrada. El uso continuado del servicio 
                después de la fecha de entrada en vigencia constituye tu aceptación de los cambios. Si no estás 
                de acuerdo con los cambios, puedes cancelar tu suscripción antes de que entren en vigencia sin penalidad.
              </p>
              <p>
                <strong>Cambios Inmediatos por Seguridad:</strong> En casos excepcionales relacionados con seguridad, 
                cumplimiento legal, o prevención de fraude, nos reservamos el derecho de implementar cambios 
                inmediatamente sin el período de notificación de 30 días, aunque te notificaremos tan pronto 
                como sea razonablemente posible.
              </p>
              <p>
                <strong>Mantenimiento de Emergencia:</strong> En casos de emergencia técnica, vulnerabilidades de 
                seguridad críticas o problemas que pongan en riesgo la integridad del servicio, podemos realizar 
                mantenimiento sin previo aviso para proteger a todos nuestros clientes.
              </p>
              <p>
                <strong>Aceptación de Modificaciones:</strong> Te notificaremos sobre cambios significativos mediante:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email a tu dirección registrada</li>
                <li>Aviso en tu panel de control</li>
                <li>Actualización de la fecha "Última actualización" en estos Términos</li>
              </ul>
            </CardContent>
          </Card>

          {/* Electronic Communications */}
          <Card>
            <CardHeader>
              <CardTitle>Comunicaciones Electrónicas</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Consentimiento para Comunicaciones Digitales:</strong> Al suscribirte a nuestro servicio, 
                consientes expresamente a recibir todas las comunicaciones oficiales, notificaciones, avisos, 
                facturas, recibos, actualizaciones de servicio, y otra información relacionada con tu cuenta a 
                través de canales electrónicos, incluyendo email y WhatsApp.
              </p>
              <p>
                <strong>Email como Canal Oficial:</strong> El email es nuestro canal principal de comunicación 
                oficial. Todos los avisos enviados a tu email registrado se consideran entregados y recibidos. 
                Es tu responsabilidad mantener actualizada tu dirección de email y revisar regularmente tu bandeja 
                de entrada y carpeta de spam.
              </p>
              <p>
                <strong>WhatsApp para Soporte:</strong> WhatsApp es un canal complementario de soporte y 
                comunicación rápida, pero los avisos legales y comunicaciones oficiales importantes siempre 
                se enviarán también por email.
              </p>
              <p>
                <strong>Opción de Exclusión Limitada:</strong> Mientras algunas comunicaciones de marketing pueden 
                ser opcionales, no puedes optar por excluirte de recibir comunicaciones transaccionales esenciales 
                (facturas, cambios en términos, avisos de seguridad) mientras mantengas una cuenta activa.
              </p>
            </CardContent>
          </Card>

          {/* Termination by Company */}
          <Card>
            <CardHeader>
              <CardTitle>Terminación por Parte de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Derecho de Terminación:</strong> Nos reservamos el derecho de suspender o terminar tu cuenta 
                y acceso al servicio de inmediato, con o sin previo aviso, en las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violación de estos Términos de Servicio o de nuestra Política de Uso Aceptable</li>
                <li>Falta de pago después del período de gracia establecido</li>
                <li>Actividad fraudulenta o uso del servicio para propósitos ilegales</li>
                <li>Abuso del servicio de soporte o comportamiento abusivo hacia nuestro personal</li>
                <li>Publicación de contenido prohibido o ilegal en tu sitio web</li>
                <li>Uso del servicio de manera que ponga en riesgo nuestra infraestructura o a otros clientes</li>
                <li>Contracargos fraudulentos o disputa de pagos sin causa justificada</li>
              </ul>
              <p>
                <strong>Consecuencias de la Terminación:</strong> Si terminamos tu cuenta por causa justificada, 
                no tendrás derecho a reembolso por el período restante. Tu sitio web será inmediatamente desactivado 
                y tu contenido puede ser eliminado después de 30 días.
              </p>
              <p>
                <strong>Reactivación Después de Terminación:</strong> La reactivación de una cuenta terminada queda 
                a nuestra discreción y puede estar sujeta a condiciones adicionales.
              </p>
              <p>
                <strong>Manejo de Datos Post-Terminación:</strong> Tras la terminación, conservaremos copia de seguridad 
                por hasta 6 meses solo para una eventual reactivación; luego, eliminaremos el contenido salvo obligaciones legales.
              </p>
            </CardContent>
          </Card>

          {/* Language Clause */}
          <Card>
            <CardHeader>
              <CardTitle>Idioma y Versiones</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Idioma Oficial:</strong> Estos Términos de Servicio se redactan originalmente en español. 
                Esta es la versión oficial y vinculante legalmente.
              </p>
              <p>
                <strong>Traducciones:</strong> Si en el futuro proporcionamos traducciones de estos términos a 
                otros idiomas (incluyendo inglés) con fines informativos, dichas traducciones son únicamente 
                referenciales. En caso de cualquier conflicto, inconsistencia o ambigüedad entre la versión en 
                español y cualquier traducción, la versión en español prevalecerá y tendrá efecto legal.
              </p>
              <p>
                <strong>Comunicaciones en Español:</strong> Todas las comunicaciones oficiales, avisos legales, 
                y documentación contractual se proporcionarán en español, que es el idioma oficial para la 
                interpretación de estos términos.
              </p>
            </CardContent>
          </Card>

          {/* Complaints */}
          <Card>
            <CardHeader>
              <CardTitle>Quejas y Reclamos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                <strong>Canal de Quejas:</strong> Si tienes alguna queja o reclamo sobre nuestro servicio, contáctanos:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email: soporte@mirestaurante.online</li>
                <li>WhatsApp: {businessData.contact.phone.display}</li>
                <li>Plan Avanzado: premiumsoporte@mirestaurante.online</li>
              </ul>
              <p>
                <strong>Tiempo de Respuesta:</strong> Acusaremos recibo de tu queja dentro de las 24 horas hábiles. 
                Investigaremos el problema y proporcionaremos una respuesta sustantiva dentro de 5 días hábiles.
              </p>
              <p>
                <strong>Escalación:</strong> Si no estás satisfecho con la respuesta inicial, puedes solicitar 
                escalación enviando un email a {businessData.contact.email.general} con el asunto "Escalación de Queja".
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Cambios a estos Términos</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. Los cambios 
                significativos serán notificados por email con al menos 30 días de anticipación. El uso continuado 
                del servicio después de la fecha de vigencia de los nuevos términos constituye tu aceptación de los mismos.
              </p>
              <p>
                Los cambios de precios para clientes existentes serán notificados con 60 días de anticipación.
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
                Para cualquier pregunta sobre estos Términos de Servicio, contáctanos:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Empresa:</strong> {businessData.company.legalName}</p>
                <p><strong>RUC:</strong> {businessData.company.ruc}</p>
                <p><strong>Dirección:</strong> {businessData.address.full}</p>
                <p><strong>Email Soporte:</strong> soporte@mirestaurante.online</p>
                <p><strong>Soporte Premium:</strong> premiumsoporte@mirestaurante.online</p>
                <p><strong>Email General:</strong> {businessData.contact.email.general}</p>
                <p><strong>WhatsApp:</strong> {businessData.contact.phone.display}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;