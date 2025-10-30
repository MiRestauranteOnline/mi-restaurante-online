import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  
  // Guides page
  if (pathname === '/guias' || pathname.startsWith('/guias/')) {
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
        <h1>Centro de Ayuda - Guías para tu Página Web</h1>
        <p>Aprende a gestionar tu página web de restaurante paso a paso.</p>
        <section>
          <h2>Primeros Pasos</h2>
          <ul>
            <li><a href="/guias/inicio/primeros-pasos">Introducción a tu panel de control</a></li>
            <li><a href="/guias/inicio/beneficios-presencia-digital">Beneficios de tener presencia digital</a></li>
            <li><a href="/guias/inicio/que-es-pagina-web-restaurante">Qué es una página web para restaurante</a></li>
          </ul>
        </section>
        <section>
          <h2>Diseño y Personalización</h2>
          <ul>
            <li><a href="/guias/diseno/elegir-plantilla">Elegir la plantilla perfecta</a></li>
            <li><a href="/guias/diseno/personalizar-colores">Personalizar colores de tu marca</a></li>
            <li><a href="/guias/diseno/subir-logo">Subir tu logo</a></li>
          </ul>
        </section>
        <section>
          <h2>Contenido</h2>
          <ul>
            <li><a href="/guias/contenido/actualizar-informacion-basica">Actualizar información básica</a></li>
            <li><a href="/guias/contenido/agregar-imagenes">Agregar imágenes profesionales</a></li>
            <li><a href="/guias/contenido/configurar-horarios">Configurar horarios de atención</a></li>
            <li><a href="/guias/contenido/gestionar-menu">Gestionar tu menú digital</a></li>
          </ul>
        </section>
        <a href="/">Volver al Inicio</a>
      </main>
      <footer>
        <img src="/logo.svg" alt="Mi Restaurante Online" width="150" height="45" />
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
  
  // Default fallback for other pages (including blog posts)
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
      <h1>Mi Restaurante Online</h1>
      <p>Crea tu página web para restaurante en 72 horas. Diseño profesional desde S/297/mes.</p>
      <a href="/">Volver al Inicio</a>
      <a href="/registro">Crear Mi Sitio</a>
    </main>
    <footer>
      <img src="/logo.svg" alt="Mi Restaurante Online" width="150" height="45" />
    </footer>
  `;
}
