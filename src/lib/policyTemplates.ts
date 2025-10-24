// Policy templates for restaurants with dynamic placeholders

export interface PolicyData {
  restaurantName: string;
  razonSocial: string;
  ruc: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
}

export function generatePrivacyPolicy(data: PolicyData): string {
  return `<h1>Política de Privacidad</h1>

<p><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<h2>1. Introducción</h2>
<p>En <strong>${data.restaurantName}</strong> (${data.razonSocial}, RUC: ${data.ruc}), nos comprometemos a proteger su privacidad y garantizar la seguridad de su información personal. Esta política describe cómo recopilamos, usamos y protegemos sus datos personales cuando utiliza nuestros servicios.</p>

<h2>2. Información que Recopilamos</h2>
<p>Podemos recopilar los siguientes tipos de información:</p>
<ul>
  <li><strong>Información de contacto:</strong> nombre, correo electrónico, número de teléfono</li>
  <li><strong>Información de reserva:</strong> fecha, hora, número de personas</li>
  <li><strong>Información de pedidos:</strong> historial de pedidos, preferencias alimentarias</li>
  <li><strong>Información técnica:</strong> dirección IP, tipo de navegador, datos de uso del sitio web</li>
</ul>

<h2>3. Cómo Utilizamos su Información</h2>
<p>Utilizamos su información personal para:</p>
<ul>
  <li>Procesar sus reservas y pedidos</li>
  <li>Enviar confirmaciones y actualizaciones</li>
  <li>Mejorar nuestros servicios y experiencia del cliente</li>
  <li>Enviar promociones y ofertas especiales (con su consentimiento)</li>
  <li>Cumplir con obligaciones legales y regulatorias</li>
</ul>

<h2>4. Protección de Datos</h2>
<p>Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.</p>

<h2>5. Compartir Información</h2>
<p>No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en los siguientes casos:</p>
<ul>
  <li>Proveedores de servicios necesarios para operar nuestro negocio (procesadores de pagos, servicios de delivery)</li>
  <li>Cuando sea requerido por ley o autoridades competentes</li>
  <li>Con su consentimiento explícito</li>
</ul>

<h2>6. Sus Derechos</h2>
<p>De acuerdo con la Ley de Protección de Datos Personales (Ley N° 29733), usted tiene derecho a:</p>
<ul>
  <li>Acceder a sus datos personales</li>
  <li>Rectificar datos inexactos o incompletos</li>
  <li>Cancelar o solicitar la eliminación de sus datos</li>
  <li>Oponerse al tratamiento de sus datos</li>
  <li>Revocar su consentimiento en cualquier momento</li>
</ul>

<h2>7. Cookies y Tecnologías Similares</h2>
<p>Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Para más información, consulte nuestra Política de Cookies.</p>

<h2>8. Retención de Datos</h2>
<p>Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.</p>

<h2>9. Cambios a Esta Política</h2>
<p>Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Le notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web.</p>

<h2>10. Contacto</h2>
<p>Si tiene preguntas sobre esta política de privacidad o desea ejercer sus derechos, puede contactarnos en:</p>
<ul>
  <li><strong>Correo electrónico:</strong> ${data.email}</li>
  <li><strong>Teléfono:</strong> ${data.phone}</li>
  <li><strong>Dirección:</strong> ${data.address}</li>
</ul>`;
}

export function generateCookiesPolicy(data: PolicyData): string {
  return `<h1>Política de Cookies</h1>

<p><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<h2>1. ¿Qué son las Cookies?</h2>
<p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Nos ayudan a mejorar su experiencia y proporcionar funcionalidades esenciales.</p>

<h2>2. Tipos de Cookies que Utilizamos</h2>

<h3>2.1 Cookies Esenciales</h3>
<p>Estas cookies son necesarias para el funcionamiento básico del sitio web. Sin ellas, algunas funciones no estarían disponibles.</p>
<ul>
  <li><strong>Cookies de sesión:</strong> Mantienen su sesión activa durante su visita</li>
  <li><strong>Cookies de seguridad:</strong> Protegen contra actividades fraudulentas</li>
</ul>

<h3>2.2 Cookies de Rendimiento</h3>
<p>Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, recopilando información de forma anónima.</p>
<ul>
  <li><strong>Google Analytics:</strong> Análisis de tráfico y comportamiento de usuarios</li>
  <li><strong>Métricas de rendimiento:</strong> Velocidad de carga y errores técnicos</li>
</ul>

<h3>2.3 Cookies Funcionales</h3>
<p>Estas cookies permiten que el sitio web recuerde sus preferencias y elecciones.</p>
<ul>
  <li><strong>Preferencias de idioma</strong></li>
  <li><strong>Configuración de visualización</strong></li>
  <li><strong>Información de inicio de sesión</strong></li>
</ul>

<h3>2.4 Cookies de Marketing</h3>
<p>Con su consentimiento, utilizamos estas cookies para mostrarle contenido relevante y personalizado.</p>
<ul>
  <li><strong>Cookies de redes sociales:</strong> Facebook, Instagram</li>
  <li><strong>Cookies publicitarias:</strong> Google Ads, Facebook Pixel</li>
</ul>

<h2>3. Duración de las Cookies</h2>
<p>Las cookies pueden ser:</p>
<ul>
  <li><strong>Cookies de sesión:</strong> Se eliminan cuando cierra su navegador</li>
  <li><strong>Cookies persistentes:</strong> Permanecen en su dispositivo hasta su fecha de expiración o hasta que las elimine manualmente</li>
</ul>

<h2>4. Gestión de Cookies</h2>
<p>Puede controlar y/o eliminar cookies según lo desee. Puede eliminar todas las cookies que ya están en su computadora y puede configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio y que algunos servicios y funcionalidades no funcionen.</p>

<h3>Cómo Deshabilitar Cookies en Navegadores Populares:</h3>
<ul>
  <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
  <li><strong>Mozilla Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos</li>
  <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
  <li><strong>Microsoft Edge:</strong> Configuración → Cookies y permisos de sitios</li>
</ul>

<h2>5. Cookies de Terceros</h2>
<p>Algunos de nuestros socios comerciales pueden configurar cookies en su dispositivo cuando visita nuestro sitio web. No tenemos control sobre estas cookies y le recomendamos revisar sus políticas de privacidad.</p>

<h2>6. Actualizaciones de Esta Política</h2>
<p>Podemos actualizar esta política de cookies periódicamente. Le recomendamos revisar esta página regularmente para estar informado sobre cómo utilizamos las cookies.</p>

<h2>7. Contacto</h2>
<p>Si tiene preguntas sobre nuestra política de cookies, puede contactarnos en:</p>
<ul>
  <li><strong>Correo electrónico:</strong> ${data.email}</li>
  <li><strong>Teléfono:</strong> ${data.phone}</li>
  <li><strong>Dirección:</strong> ${data.address}</li>
</ul>

<p><em>Al continuar utilizando nuestro sitio web, usted acepta el uso de cookies de acuerdo con esta política.</em></p>`;
}

export function generateTermsOfService(data: PolicyData): string {
  return `<h1>Términos y Condiciones de Servicio</h1>

<p><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<h2>1. Información General</h2>
<p>Estos términos y condiciones regulan el uso de los servicios ofrecidos por <strong>${data.restaurantName}</strong>, operado por ${data.razonSocial} (RUC: ${data.ruc}), ubicado en ${data.address}.</p>
<p>Al utilizar nuestros servicios, ya sea en nuestro local, a través de nuestro sitio web o aplicaciones móviles, usted acepta estos términos y condiciones en su totalidad.</p>

<h2>2. Servicios Ofrecidos</h2>
<p>Ofrecemos los siguientes servicios:</p>
<ul>
  <li>Servicio de restaurante en el local</li>
  <li>Reservas de mesas</li>
  <li>Pedidos para llevar</li>
  <li>Servicio de delivery (cuando esté disponible)</li>
  <li>Eventos y catering (sujeto a disponibilidad)</li>
</ul>

<h2>3. Reservas</h2>

<h3>3.1 Política de Reservas</h3>
<ul>
  <li>Las reservas están sujetas a disponibilidad</li>
  <li>Se requiere confirmación para todas las reservas</li>
  <li>Nos reservamos el derecho de limitar el tiempo de las reservas según la demanda</li>
  <li>Para grupos de más de ${data.restaurantName.includes('grande') ? '12' : '8'} personas, contacte directamente con nosotros</li>
</ul>

<h3>3.2 Cancelaciones y No Presentación</h3>
<ul>
  <li>Las cancelaciones deben realizarse con al menos 2 horas de anticipación</li>
  <li>En caso de no presentación sin cancelación previa, nos reservamos el derecho de restringir reservas futuras</li>
  <li>Para eventos especiales, pueden aplicar políticas de cancelación específicas</li>
</ul>

<h2>4. Pedidos y Pagos</h2>

<h3>4.1 Precios</h3>
<ul>
  <li>Todos los precios están expresados en Soles (PEN) e incluyen IGV</li>
  <li>Los precios están sujetos a cambios sin previo aviso</li>
  <li>Los precios mostrados en nuestro sitio web o menú son referenciales y pueden variar</li>
</ul>

<h3>4.2 Métodos de Pago</h3>
<p>Aceptamos los siguientes métodos de pago:</p>
<ul>
  <li>Efectivo</li>
  <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
  <li>Transferencias bancarias (para eventos y catering)</li>
  <li>Billeteras digitales (Yape, Plin, cuando estén disponibles)</li>
</ul>

<h3>4.3 Facturación</h3>
<ul>
  <li>Emitimos boletas y facturas electrónicas</li>
  <li>Para solicitar factura, debe proporcionar su RUC al momento del pago</li>
  <li>Las facturas no pueden emitirse con fecha retroactiva</li>
</ul>

<h2>5. Servicio de Delivery</h2>
<p>Cuando el servicio de delivery esté disponible:</p>
<ul>
  <li>El pedido mínimo y costo de envío varían según la zona</li>
  <li>Los tiempos de entrega son estimados y pueden variar según demanda y condiciones de tráfico</li>
  <li>Verificamos los pedidos al momento de la entrega</li>
  <li>No nos hacemos responsables por retrasos causados por información de entrega incorrecta</li>
</ul>

<h2>6. Calidad y Seguridad Alimentaria</h2>
<ul>
  <li>Cumplimos con todas las normativas de seguridad alimentaria vigentes en Perú</li>
  <li>Los ingredientes están sujetos a disponibilidad y pueden ser sustituidos</li>
  <li>Si tiene alergias o restricciones alimentarias, informe a nuestro personal</li>
  <li>No garantizamos ambientes 100% libres de alérgenos</li>
</ul>

<h2>7. Comportamiento del Cliente</h2>
<p>Nos reservamos el derecho de rechazar el servicio o solicitar que abandone nuestras instalaciones si:</p>
<ul>
  <li>Muestra comportamiento inapropiado, ofensivo o amenazante</li>
  <li>Está bajo la influencia de alcohol o drogas en exceso</li>
  <li>Viola las normas del establecimiento</li>
  <li>Daña o intenta dañar la propiedad</li>
</ul>

<h2>8. Propiedad Intelectual</h2>
<ul>
  <li>Todo el contenido de nuestro sitio web, incluyendo textos, imágenes, logos y diseños, es propiedad de ${data.razonSocial}</li>
  <li>Está prohibido el uso no autorizado de nuestro contenido</li>
  <li>Las fotografías del menú son referenciales</li>
</ul>

<h2>9. Limitación de Responsabilidad</h2>
<p>${data.restaurantName} no se hace responsable de:</p>
<ul>
  <li>Pérdida o robo de pertenencias personales en nuestras instalaciones</li>
  <li>Reacciones alérgicas no informadas previamente</li>
  <li>Daños indirectos o consecuenciales derivados del uso de nuestros servicios</li>
  <li>Interrupciones del servicio por causas de fuerza mayor</li>
</ul>

<h2>10. Protección de Datos</h2>
<p>El tratamiento de sus datos personales se rige por nuestra Política de Privacidad, en cumplimiento con la Ley N° 29733 - Ley de Protección de Datos Personales.</p>

<h2>11. Reclamaciones</h2>
<p>De acuerdo con el Código de Protección y Defensa del Consumidor, ponemos a su disposición nuestro Libro de Reclamaciones físico y virtual. Para más información, consulte nuestra sección de Libro de Reclamaciones.</p>

<h2>12. Modificaciones</h2>
<p>Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en nuestro sitio web.</p>

<h2>13. Ley Aplicable y Jurisdicción</h2>
<p>Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa será sometida a la jurisdicción de los tribunales de ${data.address.includes('Lima') ? 'Lima' : 'la localidad correspondiente'}.</p>

<h2>14. Contacto</h2>
<p>Para consultas sobre estos términos y condiciones, puede contactarnos en:</p>
<ul>
  <li><strong>Razón Social:</strong> ${data.razonSocial}</li>
  <li><strong>RUC:</strong> ${data.ruc}</li>
  <li><strong>Dirección:</strong> ${data.address}</li>
  <li><strong>Correo electrónico:</strong> ${data.email}</li>
  <li><strong>Teléfono:</strong> ${data.phone}</li>
</ul>

<p><em>Al utilizar nuestros servicios, usted confirma que ha leído, entendido y aceptado estos términos y condiciones.</em></p>`;
}
