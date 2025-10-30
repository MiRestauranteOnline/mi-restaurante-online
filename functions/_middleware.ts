import { createClient } from '@supabase/supabase-js';

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
        const seoContent = await getSEOContent(url.pathname, ctx.env);
        
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

async function getSEOContent(pathname: string, env: any): Promise<string> {
  // Check if this is a blog post URL pattern: /blog/*/*
  const blogPostMatch = pathname.match(/^\/blog\/([^\/]+)\/([^\/]+)$/);
  if (blogPostMatch) {
    try {
      const slug = blogPostMatch[2];
      
      // Initialize Supabase client
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY
      );
      
      // Fetch the article from database
      const { data: article, error } = await supabase
        .from('generated_articles')
        .select('title, slug, excerpt, content, featured_image_url, meta_description, author_name, author_bio, author_image_url, created_at, category')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (!error && article) {
        // Extract first few paragraphs for SEO content
        const contentPreview = article.content
          .replace(/<[^>]*>/g, '') // Strip HTML tags
          .split('\n\n')
          .filter((p: string) => p.trim().length > 0)
          .slice(0, 3)
          .join('\n\n');
        
        return `
          <nav>
            <a href="/"><img src="/logo.svg" alt="Mi Restaurante Online" width="200" height="60" /></a>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/guias">Guías</a></li>
              <li><a href="/contacto">Contacto</a></li>
            </ul>
          </nav>
          <main>
            <article>
              <header>
                <nav aria-label="breadcrumb">
                  <a href="/">Inicio</a> &gt; <a href="/blog">Blog</a> &gt; <span>${article.title}</span>
                </nav>
                <h1>${article.title}</h1>
                <p>${article.excerpt}</p>
                <div>
                  ${article.author_name ? `
                    <div>
                      ${article.author_image_url ? `<img src="${article.author_image_url}" alt="${article.author_name} - Autor" width="50" height="50" />` : ''}
                      <span>Por <strong>${article.author_name}</strong></span>
                    </div>
                  ` : ''}
                  <time datetime="${article.created_at}">${new Date(article.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                </div>
              </header>
              ${article.featured_image_url ? `<img src="${article.featured_image_url}" alt="${article.title} - Imagen destacada del artículo" width="1200" height="630" />` : ''}
              <div>
                <p>${contentPreview}</p>
                <p><a href="/blog/${article.category}/${article.slug}">Continuar leyendo el artículo completo...</a></p>
              </div>
              ${article.author_name && article.author_bio ? `
                <section>
                  <h2>Sobre el Autor</h2>
                  <div>
                    ${article.author_image_url ? `<img src="${article.author_image_url}" alt="${article.author_name}" width="80" height="80" />` : ''}
                    <h3>${article.author_name}</h3>
                    <p>${article.author_bio}</p>
                  </div>
                </section>
              ` : ''}
            </article>
            <section>
              <h2>Artículos Relacionados</h2>
              <ul>
                <li><a href="/blog">Ver todos los artículos del blog</a></li>
                <li><a href="/guias">Explorar guías prácticas</a></li>
              </ul>
            </section>
            <a href="/blog">← Volver al Blog</a>
          </main>
          <footer>
            <img src="/logo.svg" alt="Mi Restaurante Online" width="150" height="45" />
            <nav>
              <h3>Enlaces Útiles</h3>
              <ul>
                <li><a href="/guias">Guías & Documentación</a></li>
                <li><a href="/blog">Blog & Artículos</a></li>
                <li><a href="/acerca-de">Acerca de Nosotros</a></li>
                <li><a href="/contacto">Contacto</a></li>
              </ul>
            </nav>
          </footer>
        `;
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    }
  }
  
  // Homepage content
  if (pathname === '/') {
    return `
      <nav>
        <a href="/" aria-label="Inicio - Mi Restaurante Online">
          <img src="/logo.svg" alt="Mi Restaurante Online - Logo de sitios web para restaurantes" width="200" height="60" />
        </a>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/#benefits">Beneficios</a></li>
          <li><a href="/#how-it-works">Cómo Funciona</a></li>
          <li><a href="/#pricing">Precios</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="/contacto">Contacto</a></li>
          <li><a href="/registro">Crear Mi Sitio</a></li>
        </ul>
      </nav>
      <main>
        <header>
          <h1>Crea tu Página Web para Restaurante en 72 Horas</h1>
          <p>Diseño web profesional para restaurantes en Lima y todo Perú. Desde S/297/mes con menú digital incluido.</p>
          <img src="/hero-restaurant-websites.webp" alt="Ejemplos de sitios web profesionales para restaurantes creados por Mi Restaurante Online mostrando diseños responsive y modernos" width="800" height="600" />
          <a href="/registro">Registrarse Ahora</a>
          <a href="https://wa.me/51123456789">WhatsApp</a>
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
            <a href="/registro">Elegir Plan Básico</a>
          </div>
          <div>
            <h3>Plan Avanzado - S/497/mes</h3>
            <p>Incluye todo lo del Plan Básico más: Sistema de reservas, dominio personalizado (.com, .pe, etc.), soporte prioritario</p>
            <a href="/registro">Elegir Plan Avanzado</a>
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
          <p>¿Tienes preguntas? <a href="https://wa.me/51123456789">Contáctanos por WhatsApp</a></p>
          <p>Email: <a href="mailto:info@mirestaurante.online">info@mirestaurante.online</a></p>
        </section>
      </main>
      <footer>
        <img src="/logo.svg" alt="Mi Restaurante Online - Footer logo" width="150" height="45" />
        <nav>
          <h3>Enlaces Útiles</h3>
          <ul>
            <li><a href="/guias">Guías & Documentación</a></li>
            <li><a href="/blog">Blog & Artículos</a></li>
            <li><a href="/acerca-de">Acerca de Nosotros</a></li>
            <li><a href="/contacto">Contacto</a></li>
            <li><a href="/privacy">Política de Privacidad</a></li>
            <li><a href="/terms">Términos de Servicio</a></li>
          </ul>
        </nav>
      </footer>
    `;
  }
  
  // Blog listing page
  if (pathname === '/blog') {
    return `
      <nav>
        <a href="/"><img src="/logo.svg" alt="Mi Restaurante Online" width="200" height="60" /></a>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/guias">Guías</a></li>
          <li><a href="/contacto">Contacto</a></li>
        </ul>
      </nav>
      <main>
        <h1>Guías Prácticas para Restaurantes</h1>
        <p>Descubre estrategias, consejos y tendencias para hacer crecer tu restaurante.</p>
        <article>
          <h2><a href="/blog/marketing-digital/estrategias-marketing-digital-restaurantes-lima">Marketing Digital para Restaurantes</a></h2>
          <p>Aprende las mejores estrategias de marketing digital para atraer más clientes a tu restaurante.</p>
        </article>
        <article>
          <h2><a href="/blog/tecnologia-restaurante/implementacion-menu-digital-qr-restaurantes">Tecnología para Restaurantes</a></h2>
          <p>Descubre cómo la tecnología puede mejorar la eficiencia de tu negocio gastronómico.</p>
        </article>
        <article>
          <h2><a href="/blog/guias-practicas/como-abrir-restaurante-peru">Guías Prácticas</a></h2>
          <p>Consejos prácticos para gestionar y hacer crecer tu restaurante.</p>
        </article>
        <a href="/">Volver al Inicio</a>
      </main>
      <footer>
        <img src="/logo.svg" alt="Mi Restaurante Online" width="150" height="45" />
      </footer>
    `;
  }
  
  // Guides pages - provide specific content based on path
  if (pathname === '/guias' || pathname.startsWith('/guias/')) {
    const guideContent = getGuideContent(pathname);
    return `
      <nav>
        <a href="/" aria-label="Inicio - Mi Restaurante Online">
          <img src="/logo.svg" alt="Mi Restaurante Online - Guías para páginas web de restaurantes" width="200" height="60" />
        </a>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/guias">Guías</a></li>
          <li><a href="/contacto">Contacto</a></li>
          <li><a href="/registro">Crear Mi Sitio</a></li>
        </ul>
      </nav>
      <main>
        ${guideContent}
      </main>
      <footer>
        <img src="/logo.svg" alt="Mi Restaurante Online" width="150" height="45" />
        <nav>
          <h3>Enlaces Útiles</h3>
          <ul>
            <li><a href="/guias">Guías & Documentación</a></li>
            <li><a href="/blog">Blog & Artículos</a></li>
            <li><a href="/acerca-de">Acerca de Nosotros</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </nav>
      </footer>
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
  
  // Default fallback for other pages
  return `
    <nav>
      <a href="/" aria-label="Inicio - Mi Restaurante Online">
        <img src="/logo.svg" alt="Mi Restaurante Online - Sitios web profesionales para restaurantes" width="200" height="60" />
      </a>
      <ul>
        <li><a href="/">Inicio</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/guias">Guías</a></li>
        <li><a href="/contacto">Contacto</a></li>
        <li><a href="/registro">Crear Mi Sitio</a></li>
      </ul>
    </nav>
    <main>
      <h1>Mi Restaurante Online</h1>
      <p>Crea tu página web para restaurante en 72 horas. Diseño profesional desde S/297/mes con menú digital incluido.</p>
      <section>
        <h2>Servicios Profesionales para Restaurantes</h2>
        <ul>
          <li><a href="/#benefits">Beneficios de tener presencia online</a></li>
          <li><a href="/#pricing">Planes y Precios desde S/297/mes</a></li>
          <li><a href="/blog">Guías Prácticas para Restaurantes</a></li>
          <li><a href="/guias">Documentación y Soporte</a></li>
        </ul>
      </section>
      <a href="/">Volver al Inicio</a>
      <a href="/registro">Crear Mi Sitio Ahora</a>
    </main>
    <footer>
      <img src="/logo.svg" alt="Mi Restaurante Online" width="150" height="45" />
      <nav>
        <ul>
          <li><a href="/guias">Guías</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/contacto">Contacto</a></li>
        </ul>
      </nav>
    </footer>
  `;
}

function getGuideContent(pathname: string): string {
  // Guides index
  if (pathname === '/guias') {
    return `
      <h1>Centro de Ayuda - Guías para Páginas Web de Restaurantes</h1>
      <p>Aprende a gestionar tu página web de restaurante paso a paso con nuestras guías completas.</p>
      
      <section>
        <h2>Primeros Pasos</h2>
        <p>Comienza tu viaje digital con estas guías esenciales para tu restaurante.</p>
        <ul>
          <li><a href="/guias/primeros-pasos/introduccion">Introducción a tu panel de control</a> - Conoce las funcionalidades principales de tu dashboard</li>
          <li><a href="/guias/primeros-pasos/beneficios">Beneficios de tener presencia digital</a> - Por qué tu restaurante necesita estar online</li>
          <li><a href="/guias/primeros-pasos/configuracion-inicial">Configuración inicial de tu sitio</a> - Pasos básicos para comenzar</li>
        </ul>
      </section>
      
      <section>
        <h2>Diseño y Personalización</h2>
        <p>Personaliza tu sitio web para reflejar la identidad única de tu restaurante.</p>
        <ul>
          <li><a href="/guias/diseno/elegir-plantilla">Elegir la plantilla perfecta</a> - Encuentra el diseño ideal para tu restaurante</li>
          <li><a href="/guias/diseno/personalizar-colores">Personalizar colores de marca</a> - Aplica los colores de tu identidad corporativa</li>
          <li><a href="/guias/diseno/subir-logo">Subir tu logo</a> - Añade el logo de tu restaurante</li>
          <li><a href="/guias/diseno/imagenes">Gestionar imágenes</a> - Mejores prácticas para fotos de platos</li>
        </ul>
      </section>
      
      <section>
        <h2>Contenido del Sitio</h2>
        <p>Gestiona el contenido de tu página web para atraer más clientes.</p>
        <ul>
          <li><a href="/guias/contenido/informacion-basica">Actualizar información básica</a> - Dirección, teléfono, horarios</li>
          <li><a href="/guias/contenido/menu-digital">Gestionar tu menú digital</a> - Añade y actualiza tus platos</li>
          <li><a href="/guias/contenido/imagenes-profesionales">Agregar imágenes profesionales</a> - Tips para fotografía de comida</li>
          <li><a href="/guias/contenido/horarios">Configurar horarios de atención</a> - Mantén informados a tus clientes</li>
        </ul>
      </section>
      
      <section>
        <h2>Reservas Online</h2>
        <p>Configura y gestiona el sistema de reservas de tu restaurante.</p>
        <ul>
          <li><a href="/guias/reservas/configuracion">Configurar sistema de reservas</a> - Activa las reservas online</li>
          <li><a href="/guias/reservas/gestionar">Gestionar reservas</a> - Administra las solicitudes de tus clientes</li>
          <li><a href="/guias/reservas/notificaciones">Notificaciones de reservas</a> - Configura alertas automáticas</li>
        </ul>
      </section>
      
      <section>
        <h2>SEO y Marketing</h2>
        <p>Mejora la visibilidad de tu restaurante en Google.</p>
        <ul>
          <li><a href="/guias/seo/optimizacion-basica">Optimización SEO básica</a> - Mejora tu posicionamiento</li>
          <li><a href="/guias/seo/google-business">Google My Business</a> - Aparece en búsquedas locales</li>
          <li><a href="/guias/seo/redes-sociales">Integración con redes sociales</a> - Conecta tus perfiles</li>
        </ul>
      </section>
      
      <a href="/">← Volver al Inicio</a>
    `;
  }
  
  // Specific guide pages
  if (pathname.includes('/primeros-pasos/introduccion')) {
    return `
      <article>
        <h1>Introducción a tu Panel de Control</h1>
        <p>Bienvenido a tu panel de control de Mi Restaurante Online. Esta guía te ayudará a familiarizarte con las principales funcionalidades.</p>
        
        <section>
          <h2>¿Qué es el Panel de Control?</h2>
          <p>El panel de control es tu centro de administración desde donde puedes gestionar todos los aspectos de tu página web de restaurante: contenido, menú, reservas, imágenes y configuración.</p>
        </section>
        
        <section>
          <h2>Secciones Principales</h2>
          <h3>Dashboard Principal</h3>
          <p>Vista general con estadísticas de visitas, reservas pendientes y accesos rápidos a las funciones más utilizadas.</p>
          
          <h3>Contenido del Sitio</h3>
          <p>Actualiza la información básica de tu restaurante: nombre, descripción, dirección, teléfono, horarios y redes sociales.</p>
          
          <h3>Menú Digital</h3>
          <p>Gestiona las categorías de tu menú y los platos. Añade fotos, descripciones y precios de cada platillo.</p>
          
          <h3>Galería de Imágenes</h3>
          <p>Sube y organiza las fotos de tu restaurante, ambiente y platos destacados.</p>
          
          <h3>Sistema de Reservas</h3>
          <p>Configura y gestiona las reservas online de tus clientes (Plan Avanzado).</p>
        </section>
        
        <section>
          <h2>Próximos Pasos</h2>
          <ul>
            <li><a href="/guias/contenido/informacion-basica">Actualizar información básica de tu restaurante</a></li>
            <li><a href="/guias/diseno/personalizar-colores">Personalizar los colores de tu sitio</a></li>
            <li><a href="/guias/contenido/menu-digital">Comenzar a añadir tu menú</a></li>
          </ul>
        </section>
      </article>
      <a href="/guias">← Volver a Guías</a>
    `;
  }
  
  // Default guide content for other guide pages
  return `
    <h1>Guías para tu Página Web de Restaurante</h1>
    <p>Encuentra ayuda y tutoriales para gestionar tu sitio web profesional.</p>
    
    <section>
      <h2>Recursos Disponibles</h2>
      <ul>
        <li><a href="/guias/primeros-pasos/introduccion">Introducción al panel de control</a></li>
        <li><a href="/guias/contenido/menu-digital">Gestionar tu menú digital</a></li>
        <li><a href="/guias/diseno/personalizar-colores">Personalizar diseño y colores</a></li>
        <li><a href="/guias/reservas/configuracion">Configurar sistema de reservas</a></li>
      </ul>
    </section>
    
    <p><a href="/guias">Ver todas las guías</a> | <a href="/contacto">Contactar soporte</a></p>
  `;
}
