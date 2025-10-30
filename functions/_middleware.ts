// Middleware to handle SEO prerendering for all HTML requests
export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const url = new URL(request.url);
  
  // Inject SEO content for all HTML requests (not for assets like .js, .css, .png, etc.)
  if (!url.pathname.includes('.') && request.method === 'GET') {
    try {
      // Get the actual rendered page
      const response = await next();
      
      // If it's HTML, inject critical SEO content
      if (response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();
        
        // Inject SEO content based on route
        const seoContent = await getSEOContent(url.pathname, ctx.env);

        // Build basic, route-specific meta (ensures unique tags per URL even without JS)
        const path = url.pathname;
        let pageTitle = 'Mi Restaurante Online';
        let pageDescription = 'Página web para restaurante en Lima. Diseño web restaurante profesional en 72h. Sitio web restaurante Perú desde S/297/mes. Menú digital incluido.';
        const canonical = `${url.origin}${path}`;

        if (path.startsWith('/blog/')) {
          const slug = decodeURIComponent(path.split('/').pop() || '').replace(/-/g, ' ');
          const pretty = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Blog';
          pageTitle = `${pretty} | Blog de Mi Restaurante Online`;
          pageDescription = `Lee ${pretty}. Consejos y guías prácticas para restaurantes en Perú.`;
        } else if (path === '/blog') {
          pageTitle = 'Blog para Restaurantes | Mi Restaurante Online';
          pageDescription = 'Marketing, tecnología y gestión para restaurantes en Perú: artículos y tendencias.';
        } else if (path === '/guias' || path.startsWith('/guias/')) {
          const last = decodeURIComponent(path.split('/').pop() || '').replace(/-/g, ' ');
          const pretty = last ? last.charAt(0).toUpperCase() + last.slice(1) : 'Guías';
          pageTitle = `${pretty} | Guías para Restaurantes`;
          pageDescription = 'Documentación y guías paso a paso para configurar tu sitio y crecer tu restaurante.';
        } else if (path === '/acerca-de') {
          pageTitle = 'Acerca de Nosotros | Mi Restaurante Online';
          pageDescription = 'Conoce nuestra misión creando sitios web profesionales para restaurantes en Perú.';
        } else if (path === '/contacto') {
          pageTitle = 'Contacto | Mi Restaurante Online';
          pageDescription = '¿Preguntas sobre nuestros planes de sitios web para restaurantes? Contáctanos aquí.';
        } else if (path === '/soporte') {
          pageTitle = 'Soporte | Mi Restaurante Online';
          pageDescription = 'Centro de ayuda y soporte técnico para tu sitio web de restaurante.';
        }

        // Update head tags: <title>, meta, canonical, and social cards
        html = html
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${pageTitle}</title>`)
          .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${pageDescription}">`)
          .replace(/<link rel="canonical" href="[^"]*"\s*\/?\s*>/, `<link rel="canonical" href="${canonical}" />`)
          .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${pageTitle}">`)
          .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${pageTitle}">`)
          .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${pageDescription}">`)
          .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${pageDescription}">`);
        
        // Replace #root content with SSR snippet (robust to different builds)
        let rootReplaced = false;
        html = html.replace(/<div id="root">[\s\S]*?<\/div>/, () => {
          rootReplaced = true;
          return `<div id=\"root\">${seoContent}</div>`;
        });
        if (!rootReplaced) {
          // Fallback: inject right after <body>
          html = html.replace(/<body[^>]*>/, (m) => `${m}\n<div id=\"root\">${seoContent}<\/div>`);
        }

        // Return with corrected headers (avoid stale content-length)
        const newHeaders = new Headers(response.headers);
        newHeaders.delete('content-length');
        newHeaders.set('content-type', 'text/html; charset=utf-8');
        newHeaders.set('x-seo-prerender', '1');
        newHeaders.set('cache-control', 'no-store');

        return new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    } catch (error) {
      console.error('SEO prerender error:', error);
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
      
      // Fetch article directly using Supabase REST API
      const supabaseUrl = env.SUPABASE_URL || 'https://ptzcetvcccnojdbzzlyt.supabase.co';
      const supabaseKey = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8';
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/generated_articles?slug=eq.${slug}&status=eq.published&select=title,slug,excerpt,content,featured_image_url,meta_description,author_name,author_bio,author_image_url,created_at,category`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      );
      
      if (response.ok) {
        const articles = await response.json();
        const article = articles[0];
      
        if (article) {
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
      }
      // Fallback when article not found or not accessible
      {
        const prettyTitle = slug
          .split('-')
          .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
          .join(' ');
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
                  <a href="/">Inicio</a> &gt; <a href="/blog">Blog</a> &gt; <span>${prettyTitle}</span>
                </nav>
                <h1>${prettyTitle}</h1>
                <p>Resumen del artículo: ${prettyTitle}. Información para restaurantes en Perú.</p>
              </header>
              <section>
                <h2>Introducción</h2>
                <p>Esta es una vista previa estática para motores de búsqueda mientras se carga el contenido completo.</p>
              </section>
              <section>
                <h2>Puntos Clave</h2>
                <ul>
                  <li>Aspectos importantes sobre ${prettyTitle}</li>
                  <li>Requisitos y mejores prácticas</li>
                  <li>Recursos y enlaces útiles</li>
                </ul>
              </section>
            </article>
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
      // Fallback on error
      const slug = blogPostMatch[2];
      const prettyTitle = slug
        .split('-')
        .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
        .join(' ');
      return `
        <main>
          <h1>${prettyTitle}</h1>
          <p>Vista previa no disponible temporalmente. Consulta el artículo completo en el sitio.</p>
          <a href="/blog">← Volver al Blog</a>
        </main>
      `;
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
  
  // Actualizar información básica
  if (pathname.includes('/contenido/actualizar-informacion-basica') || pathname.includes('/contenido/informacion-basica')) {
    return `
      <article>
        <h1>Actualizar Información Básica de tu Restaurante</h1>
        <p>Aprende cómo actualizar la información esencial de tu restaurante: dirección, teléfono, horarios y datos de contacto.</p>
        
        <section>
          <h2>Información que Puedes Actualizar</h2>
          <p>Desde tu panel de control puedes modificar todos los datos fundamentales de tu restaurante que aparecerán en tu página web.</p>
          
          <h3>Datos de Contacto</h3>
          <ul>
            <li><strong>Nombre del restaurante:</strong> El nombre comercial que aparecerá en todo el sitio</li>
            <li><strong>Teléfono:</strong> Número de contacto principal para reservas y consultas</li>
            <li><strong>Email:</strong> Correo electrónico de atención al cliente</li>
            <li><strong>WhatsApp:</strong> Número para contacto directo por WhatsApp</li>
          </ul>
          
          <h3>Ubicación</h3>
          <ul>
            <li><strong>Dirección completa:</strong> Calle, número, distrito</li>
            <li><strong>Ciudad y región:</strong> Ubicación geográfica</li>
            <li><strong>Referencia:</strong> Puntos de referencia cercanos</li>
          </ul>
          
          <h3>Horarios de Atención</h3>
          <p>Configura los horarios de apertura y cierre para cada día de la semana. Tus clientes verán cuándo está abierto tu restaurante.</p>
        </section>
        
        <section>
          <h2>Cómo Actualizar tu Información</h2>
          <ol>
            <li>Accede a tu panel de control</li>
            <li>Ve a la sección "Configuración" o "Información Básica"</li>
            <li>Modifica los campos que necesites actualizar</li>
            <li>Guarda los cambios</li>
            <li>Los cambios se reflejarán automáticamente en tu sitio web</li>
          </ol>
        </section>
        
        <section>
          <h2>Mejores Prácticas</h2>
          <ul>
            <li>Mantén tu información siempre actualizada, especialmente horarios</li>
            <li>Verifica que el número de teléfono sea correcto</li>
            <li>Incluye referencias claras para facilitar que te encuentren</li>
            <li>Actualiza horarios especiales en fechas festivas</li>
          </ul>
        </section>
        
        <section>
          <h2>Siguiente Paso</h2>
          <p><a href="/guias/contenido/menu-digital">Aprende a gestionar tu menú digital</a></p>
        </section>
      </article>
      <a href="/guias">← Volver a Guías</a>
    `;
  }
  
  // Gestionar menú digital
  if (pathname.includes('/contenido/menu-digital')) {
    return `
      <article>
        <h1>Gestionar tu Menú Digital</h1>
        <p>Aprende a añadir, editar y organizar los platos de tu restaurante en tu menú digital con código QR.</p>
        
        <section>
          <h2>¿Qué es el Menú Digital?</h2>
          <p>El menú digital permite a tus clientes ver todos tus platos desde sus móviles escaneando un código QR. Es práctico, higiénico y fácil de actualizar.</p>
        </section>
        
        <section>
          <h2>Organizar tu Menú por Categorías</h2>
          <p>Estructura tu menú en categorías para que sea más fácil de navegar:</p>
          <ul>
            <li>Entradas y aperitivos</li>
            <li>Platos principales</li>
            <li>Postres</li>
            <li>Bebidas</li>
            <li>Menú del día</li>
          </ul>
        </section>
        
        <section>
          <h2>Añadir Platos al Menú</h2>
          <ol>
            <li>Accede a la sección "Menú" en tu panel</li>
            <li>Selecciona la categoría apropiada</li>
            <li>Haz clic en "Añadir Plato"</li>
            <li>Completa la información: nombre, descripción, precio</li>
            <li>Sube una foto del plato (opcional pero recomendado)</li>
            <li>Guarda los cambios</li>
          </ol>
        </section>
        
        <section>
          <h2>Consejos para tu Menú Digital</h2>
          <ul>
            <li><strong>Descripciones claras:</strong> Menciona ingredientes principales</li>
            <li><strong>Fotos atractivas:</strong> Imágenes de calidad aumentan ventas</li>
            <li><strong>Precios actualizados:</strong> Mantén los precios al día</li>
            <li><strong>Especiales del día:</strong> Destaca promociones</li>
          </ul>
        </section>
      </article>
      <a href="/guias">← Volver a Guías</a>
    `;
  }
  
  // Personalizar colores
  if (pathname.includes('/diseno/personalizar-colores')) {
    return `
      <article>
        <h1>Personalizar Colores de tu Sitio Web</h1>
        <p>Aprende a personalizar los colores de tu página web para que refleje la identidad visual de tu restaurante.</p>
        
        <section>
          <h2>Importancia de los Colores en tu Marca</h2>
          <p>Los colores son fundamentales para crear una identidad visual memorable y profesional. Usa los colores que ya tiene tu restaurante en su imagen corporativa.</p>
        </section>
        
        <section>
          <h2>Elementos que Puedes Personalizar</h2>
          <ul>
            <li><strong>Color principal:</strong> El color dominante de tu marca</li>
            <li><strong>Color secundario:</strong> Para botones y elementos destacados</li>
            <li><strong>Color de fondo:</strong> El fondo general del sitio</li>
            <li><strong>Color de texto:</strong> Asegura buena legibilidad</li>
          </ul>
        </section>
        
        <section>
          <h2>Cómo Cambiar los Colores</h2>
          <ol>
            <li>Ve a la sección "Diseño" en tu panel</li>
            <li>Selecciona "Personalizar Colores"</li>
            <li>Elige los colores usando el selector de color</li>
            <li>Previsualiza cómo se ve tu sitio</li>
            <li>Guarda los cambios cuando estés satisfecho</li>
          </ol>
        </section>
        
        <section>
          <h2>Consejos de Diseño</h2>
          <ul>
            <li>Mantén buen contraste entre texto y fondo</li>
            <li>Usa máximo 3-4 colores principales</li>
            <li>Considera la psicología del color para restaurantes</li>
            <li>Prueba la legibilidad en diferentes dispositivos</li>
          </ul>
        </section>
      </article>
      <a href="/guias">← Volver a Guías</a>
    `;
  }
  
  // Configurar reservas
  if (pathname.includes('/reservas/configuracion')) {
    return `
      <article>
        <h1>Configurar Sistema de Reservas Online</h1>
        <p>Guía completa para activar y configurar el sistema de reservas de tu restaurante (disponible en Plan Avanzado).</p>
        
        <section>
          <h2>Beneficios de las Reservas Online</h2>
          <ul>
            <li>Tus clientes pueden reservar 24/7</li>
            <li>Reduces llamadas telefónicas</li>
            <li>Mejor gestión de tu capacidad</li>
            <li>Confirmaciones automáticas por email</li>
          </ul>
        </section>
        
        <section>
          <h2>Configuración Inicial</h2>
          <h3>Paso 1: Activar Reservas</h3>
          <p>Desde tu panel, ve a "Reservas" y activa la funcionalidad.</p>
          
          <h3>Paso 2: Configurar Capacidad</h3>
          <p>Define cuántas mesas y personas puedes atender:</p>
          <ul>
            <li>Número total de mesas</li>
            <li>Capacidad por mesa</li>
            <li>Horarios disponibles para reservas</li>
          </ul>
          
          <h3>Paso 3: Establecer Reglas</h3>
          <ul>
            <li>Antelación mínima para reservar</li>
            <li>Tiempo máximo de antelación</li>
            <li>Duración promedio de comidas</li>
            <li>Restricciones especiales</li>
          </ul>
        </section>
        
        <section>
          <h2>Gestionar Reservas</h2>
          <p>Aprende a <a href="/guias/reservas/gestionar">gestionar las reservas de tus clientes</a> desde el panel de control.</p>
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
        <li><a href="/guias/contenido/actualizar-informacion-basica">Actualizar información básica</a></li>
        <li><a href="/guias/contenido/menu-digital">Gestionar tu menú digital</a></li>
        <li><a href="/guias/diseno/personalizar-colores">Personalizar diseño y colores</a></li>
        <li><a href="/guias/reservas/configuracion">Configurar sistema de reservas</a></li>
      </ul>
    </section>
    
    <p><a href="/guias">Ver todas las guías</a> | <a href="/contacto">Contactar soporte</a></p>
  `;
}
