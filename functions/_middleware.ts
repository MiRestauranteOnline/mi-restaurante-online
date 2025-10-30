// Middleware to handle SEO bot prerendering and caching
export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // Detect search engine bots
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp/i.test(userAgent);
  
  // Only prerender for bots on HTML requests (not for assets)
  if (isBot && !url.pathname.includes('.') && request.method === 'GET') {
    try {
      // Get the actual rendered page
      const response = await next();
      
      // If it's HTML, inject critical content for bots
      if (response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();
        
        // Inject SEO content based on route
        const seoContent = getSEOContent(url.pathname);
        
        // Replace empty root div with content-filled version
        html = html.replace(
          /<div id="root">[\s\S]*?<\/div>\s*<script/,
          `<div id="root">${seoContent}</div>\n    <script`
        );
        
        return new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    } catch (error) {
      console.error('Prerender error:', error);
    }
  }
  
  return next();
};

function getSEOContent(pathname: string): string {
  // Homepage content
  if (pathname === '/') {
    return `
      <main>
        <header>
          <h1>Crea tu Página Web para Restaurante en 72 Horas</h1>
          <p>Diseño web profesional para restaurantes en Lima y todo Perú. Desde S/297/mes con menú digital incluido.</p>
        </header>
        <section>
          <h2>¿Por Qué Necesitas una Página Web para tu Restaurante?</h2>
          <p>En la era digital, tener presencia online es fundamental para atraer nuevos clientes y crecer tu negocio gastronómico.</p>
          <ul>
            <li><strong>Aumenta tu visibilidad:</strong> Aparece en Google cuando clientes buscan restaurantes en tu zona</li>
            <li><strong>Menú digital QR:</strong> Los clientes pueden ver tu menú desde sus móviles</li>
            <li><strong>Reservas online:</strong> Sistema de reservas integrado</li>
            <li><strong>Diseño profesional:</strong> Plantillas optimizadas para restaurantes</li>
          </ul>
        </section>
        <section>
          <h2>Planes y Precios</h2>
          <div>
            <h3>Plan Básico - S/297/mes</h3>
            <p>Incluye: Sitio web profesional, menú digital, dominio .online, hosting ilimitado</p>
          </div>
          <div>
            <h3>Plan Avanzado - S/497/mes</h3>
            <p>Incluye todo lo del Plan Básico más: Sistema de reservas, dominio personalizado (.com, .pe, etc.), soporte prioritario</p>
          </div>
        </section>
        <section>
          <h2>Cómo Funciona</h2>
          <ol>
            <li><strong>Elige tu plantilla:</strong> Selecciona el diseño que mejor represente tu restaurante</li>
            <li><strong>Personaliza tu contenido:</strong> Agrega tu menú, fotos y información</li>
            <li><strong>Publica en 72 horas:</strong> Tu sitio estará online en menos de 3 días</li>
          </ol>
        </section>
        <section>
          <h2>Contacto</h2>
          <p>¿Tienes preguntas? Contáctanos por WhatsApp</p>
          <p>Email: info@mirestaurante.online</p>
        </section>
      </main>
    `;
  }
  
  // Blog listing page
  if (pathname === '/blog') {
    return `
      <main>
        <h1>Guías Prácticas para Restaurantes</h1>
        <p>Descubre estrategias, consejos y tendencias para hacer crecer tu restaurante.</p>
        <article>
          <h2>Marketing Digital para Restaurantes</h2>
          <p>Aprende las mejores estrategias de marketing digital para atraer más clientes a tu restaurante.</p>
        </article>
        <article>
          <h2>Tecnología para Restaurantes</h2>
          <p>Descubre cómo la tecnología puede mejorar la eficiencia de tu negocio gastronómico.</p>
        </article>
        <article>
          <h2>Guías Prácticas</h2>
          <p>Consejos prácticos para gestionar y hacer crecer tu restaurante.</p>
        </article>
      </main>
    `;
  }
  
  // Guides page
  if (pathname === '/guias' || pathname.startsWith('/guias/')) {
    return `
      <main>
        <h1>Centro de Ayuda - Guías para tu Página Web</h1>
        <p>Aprende a gestionar tu página web de restaurante paso a paso.</p>
        <section>
          <h2>Primeros Pasos</h2>
          <ul>
            <li>Introducción a tu panel de control</li>
            <li>Beneficios de tener presencia digital</li>
            <li>Qué es una página web para restaurante</li>
          </ul>
        </section>
        <section>
          <h2>Diseño y Personalización</h2>
          <ul>
            <li>Elegir la plantilla perfecta</li>
            <li>Personalizar colores de tu marca</li>
            <li>Subir tu logo</li>
          </ul>
        </section>
        <section>
          <h2>Contenido</h2>
          <ul>
            <li>Actualizar información básica</li>
            <li>Agregar imágenes profesionales</li>
            <li>Configurar horarios de atención</li>
            <li>Gestionar tu menú digital</li>
          </ul>
        </section>
      </main>
    `;
  }
  
  // About page
  if (pathname === '/acerca-de') {
    return `
      <main>
        <h1>Acerca de Mi Restaurante Online</h1>
        <p>Somos especialistas en diseño web para restaurantes en Perú. Ayudamos a negocios gastronómicos a tener presencia digital profesional.</p>
        <section>
          <h2>Nuestra Misión</h2>
          <p>Democratizar el acceso a páginas web profesionales para restaurantes, sin importar su tamaño o presupuesto.</p>
        </section>
        <section>
          <h2>Por Qué Elegirnos</h2>
          <ul>
            <li>Experiencia en el sector gastronómico peruano</li>
            <li>Diseños optimizados para restaurantes</li>
            <li>Soporte en español</li>
            <li>Precios accesibles y transparentes</li>
          </ul>
        </section>
      </main>
    `;
  }
  
  // Contact page
  if (pathname === '/contacto') {
    return `
      <main>
        <h1>Contacto</h1>
        <p>¿Tienes preguntas sobre nuestros servicios? Estamos aquí para ayudarte.</p>
        <section>
          <h2>Información de Contacto</h2>
          <p><strong>Email:</strong> info@mirestaurante.online</p>
          <p><strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
        </section>
        <section>
          <h2>Preguntas Frecuentes</h2>
          <p>Visita nuestra sección de preguntas frecuentes para respuestas inmediatas a las dudas más comunes.</p>
        </section>
      </main>
    `;
  }
  
  // Support page
  if (pathname === '/soporte') {
    return `
      <main>
        <h1>Soporte Técnico</h1>
        <p>Estamos aquí para ayudarte con cualquier duda o problema técnico.</p>
        <section>
          <h2>Cómo Podemos Ayudarte</h2>
          <ul>
            <li>Preguntas sobre tu sitio web</li>
            <li>Problemas técnicos</li>
            <li>Cambios en tu plan</li>
            <li>Configuración de dominio</li>
          </ul>
        </section>
      </main>
    `;
  }
  
  // Default fallback for other pages (including blog posts)
  return `
    <main>
      <h1>Mi Restaurante Online</h1>
      <p>Crea tu página web para restaurante en 72 horas. Diseño profesional desde S/297/mes.</p>
      <nav>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/guias">Guías</a></li>
          <li><a href="/contacto">Contacto</a></li>
        </ul>
      </nav>
    </main>
  `;
}
