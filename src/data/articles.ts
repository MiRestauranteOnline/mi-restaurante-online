export type ArticleCategory = 'desarrollo-web' | 'marketing-digital' | 'tecnologia-restaurante' | 'casos-exito' | 'guias-practicas';

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  excerpt: string;
  content: string;
  keywords: string[];
  metaDescription: string;
  readingTime: number;
  publishDate: string;
  author: string;
  featured: boolean;
  relatedArticles: string[];
}

export const categoryLabels: Record<ArticleCategory, string> = {
  'desarrollo-web': 'Desarrollo Web',
  'marketing-digital': 'Marketing Digital',
  'tecnologia-restaurante': 'Tecnología Restaurante',
  'casos-exito': 'Casos de Éxito',
  'guias-practicas': 'Guías Prácticas'
};

export const articles: Article[] = [
  {
    id: '1',
    title: 'Cómo Crear un Sitio Web para Restaurante en Perú: Guía Completa 2024',
    slug: 'como-crear-sitio-web-restaurante-peru',
    category: 'desarrollo-web',
    excerpt: 'Descubre paso a paso cómo crear una página web para restaurante en Lima y todo Perú. Incluye costos, mejores prácticas y herramientas recomendadas.',
    content: `
      <article>
        <header>
          <h1>Cómo Crear un Sitio Web para Restaurante en Perú: Guía Completa 2024</h1>
          <p class="lead">Tener una página web para restaurante ya no es un lujo, es una necesidad. En Lima y todo Perú, los comensales buscan información online antes de visitar un restaurante. Te mostramos cómo crear tu sitio web restaurante paso a paso.</p>
        </header>

        <section>
          <h2>¿Por Qué Necesitas una Página Web para tu Restaurante en Perú?</h2>
          <p>El mercado gastronómico en Lima ha crecido exponentially. Los restaurantes en Miraflores, San Isidro y Barranco que tienen presencia online reciben 40% más clientes que aquellos que no la tienen.</p>
          
          <h3>Beneficios de un Sitio Web Restaurante:</h3>
          <ul>
            <li><strong>Mayor visibilidad en Google:</strong> Aparecer cuando buscan "restaurante cerca de mí"</li>
            <li><strong>Menú digital actualizable:</strong> Sin costos de impresión</li>
            <li><strong>Sistema de reservas 24/7:</strong> Clientes pueden reservar cualquier hora</li>
            <li><strong>Credibilidad profesional:</strong> Transmites confianza y calidad</li>
          </ul>
        </section>

        <section>
          <h2>Pasos para Crear tu Sitio Web Restaurante</h2>
          
          <h3>1. Define tu Identidad Digital</h3>
          <p>Antes de crear tu página web para restaurante, define:</p>
          <ul>
            <li>Tu propuesta gastronómica única</li>
            <li>Tu público objetivo en Lima</li>
            <li>Los distritos que quieres atraer</li>
          </ul>

          <h3>2. Elementos Esenciales de un Sitio Web Restaurante</h3>
          <p>Todo <a href="/" title="diseño web restaurante profesional">diseño web restaurante profesional</a> debe incluir:</p>
          <ul>
            <li><strong>Menú digital completo:</strong> Con precios actualizados</li>
            <li><strong>Galería de fotos:</strong> Platos y ambiente del local</li>
            <li><strong>Información de contacto:</strong> Dirección, teléfono, horarios</li>
            <li><strong>Sistema de reservas:</strong> Integrado con WhatsApp</li>
            <li><strong>Reseñas de clientes:</strong> Testimonios reales</li>
          </ul>
        </section>

        <section>
          <h2>Costos de una Página Web para Restaurante en Perú</h2>
          <p>Los precios de un sitio web restaurante en Lima varían según la complejidad:</p>
          
          <table class="pricing-table">
            <thead>
              <tr>
                <th>Tipo de Web</th>
                <th>Precio Promedio</th>
                <th>Incluye</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Básica</td>
                <td>S/800 - S/1,500</td>
                <td>Menú, contacto, galería</td>
              </tr>
              <tr>
                <td>Profesional</td>
                <td>S/1,500 - S/3,000</td>
                <td>Reservas, blog, SEO básico</td>
              </tr>
              <tr>
                <td>Avanzada</td>
                <td>S/3,000+</td>
                <td>E-commerce, delivery, CRM</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>SEO Local para Restaurantes en Lima</h2>
          <p>Para que tu página web para restaurante aparezca en Google cuando buscan "restaurante en [tu distrito]", necesitas:</p>
          
          <h3>Optimización On-Page:</h3>
          <ul>
            <li>Incluir "restaurante + tu distrito" en títulos</li>
            <li>Mencionar platos típicos peruanos</li>
            <li>Usar palabras clave locales (Miraflores, San Isidro, etc.)</li>
          </ul>

          <h3>Google My Business:</h3>
          <p>Fundamental para aparecer en búsquedas locales. Configura tu perfil con:</p>
          <ul>
            <li>Fotos del local y platos</li>
            <li>Horarios actualizados</li>
            <li>Respuestas a reseñas</li>
          </ul>
        </section>

        <section>
          <h2>Herramientas Recomendadas</h2>
          <p>Para crear tu sitio web restaurante puedes usar:</p>
          
          <h3>Plataformas DIY:</h3>
          <ul>
            <li><strong>WordPress:</strong> Flexible pero requiere conocimientos técnicos</li>
            <li><strong>Wix/Squarespace:</strong> Fácil de usar, limitado en personalización</li>
          </ul>

          <h3>Servicios Profesionales:</h3>
          <p>Si prefieres delegar el trabajo, busca una <a href="/" title="empresa diseño web restaurante Lima">empresa especializada en diseño web restaurante</a> que entienda el mercado peruano.</p>
        </section>

        <section>
          <h2>Casos de Éxito en Lima</h2>
          <p>Restaurantes como Central, Maido y Astrid y Gastón han demostrado que una presencia digital sólida potencia el negocio físico. Sus sitios web no solo muestran menús, sino que cuentan historias y crean experiencias.</p>
        </section>

        <section>
          <h2>Conclusión</h2>
          <p>Crear una página web para restaurante en Perú es una inversión que se paga sola. Con la estrategia correcta, tu <a href="/" title="sitio web restaurante profesional">sitio web restaurante</a> se convertirá en tu mejor vendedor, trabajando 24/7 para atraer nuevos clientes a tu local.</p>
          
          <div class="cta-box">
            <h3>¿Listo para crear tu página web para restaurante?</h3>
            <p>En <a href="/" title="Mi Restaurante Online - Diseño web restaurante Lima">Mi Restaurante Online</a> creamos sitios web especializados para restaurantes en Lima y todo Perú. Desde S/297/mes, sin costo inicial.</p>
            <a href="/" class="cta-button">Solicitar Cotización Gratuita</a>
          </div>
        </section>
      </article>
    `,
    keywords: ['sitio web restaurante', 'página web para restaurante', 'crear sitio web restaurante', 'diseño web restaurante', 'sitio web restaurante Perú'],
    metaDescription: 'Guía completa para crear una página web para restaurante en Perú. Costos, pasos, herramientas y mejores prácticas para tu sitio web restaurante en Lima.',
    readingTime: 8,
    publishDate: '2024-01-15',
    author: 'Mi Restaurante Online',
    featured: true,
    relatedArticles: ['2', '3', '4']
  },
  {
    id: '2',
    title: 'Precio Página Web Restaurante: Costos Reales en Perú 2024',
    slug: 'precio-pagina-web-restaurante-peru-2024',
    category: 'desarrollo-web',
    excerpt: 'Descubre los costos reales de una página web para restaurante en Lima y Perú. Comparativa de precios, qué incluye cada plan y cómo elegir la mejor opción.',
    content: `
      <article>
        <header>
          <h1>Precio Página Web Restaurante: Costos Reales en Perú 2024</h1>
          <p class="lead">¿Cuánto cuesta realmente una página web para restaurante en Lima? Te mostramos los precios actuales del mercado peruano y qué esperar por tu inversión.</p>
        </header>

        <section>
          <h2>Factores que Determinan el Precio de una Página Web Restaurante</h2>
          <p>El costo de crear un sitio web restaurante en Perú depende de varios factores:</p>
          
          <h3>1. Complejidad del Diseño</h3>
          <ul>
            <li><strong>Diseño básico:</strong> Plantilla adaptada con tu información</li>
            <li><strong>Diseño personalizado:</strong> Creado desde cero para tu marca</li>
            <li><strong>Diseño premium:</strong> Con animaciones y elementos interactivos</li>
          </ul>

          <h3>2. Funcionalidades Incluidas</h3>
          <p>Cada función adicional suma al precio final de tu página web para restaurante:</p>
          <ul>
            <li>Sistema de reservas online (+S/200-500)</li>
            <li>Menú digital con QR (+S/150-300)</li>
            <li>Galería de fotos profesional (+S/100-250)</li>
            <li>Integración con redes sociales (+S/50-150)</li>
            <li>Blog integrado (+S/100-200)</li>
          </ul>
        </section>

        <section>
          <h2>Precio Página Web Restaurante por Categorías</h2>
          
          <h3>Sitio Web Básico (S/800 - S/1,200)</h3>
          <p>Ideal para restaurantes pequeños en Lima que recién empiezan online:</p>
          <ul>
            <li>5-6 páginas (Inicio, Menú, Nosotros, Contacto)</li>
            <li>Diseño responsive (se adapta a móviles)</li>
            <li>Menú digital básico</li>
            <li>Formulario de contacto</li>
            <li>Integración básica con Google Maps</li>
          </ul>

          <h3>Sitio Web Profesional (S/1,200 - S/2,500)</h3>
          <p>La opción más popular para restaurantes establecidos:</p>
          <ul>
            <li>8-10 páginas optimizadas</li>
            <li>Sistema de reservas integrado</li>
            <li>Menú digital con categorías y filtros</li>
            <li>Galería de fotos profesional</li>
            <li>SEO básico incluido</li>
            <li>Integración con WhatsApp Business</li>
            <li>Blog para contenido</li>
          </ul>

          <h3>Sitio Web Premium (S/2,500 - S/5,000+)</h3>
          <p>Para restaurantes que buscan destacar en el mercado limeño:</p>
          <ul>
            <li>Diseño 100% personalizado</li>
            <li>Sistema de pedidos online</li>
            <li>Integración con delivery</li>
            <li>CRM para gestión de clientes</li>
            <li>Analytics avanzado</li>
            <li>SEO profesional</li>
            <li>Mantenimiento incluido por 6-12 meses</li>
          </ul>
        </section>

        <section>
          <h2>Costos Adicionales a Considerar</h2>
          
          <h3>Dominio y Hosting</h3>
          <ul>
            <li><strong>Dominio .pe:</strong> S/80-120/año</li>
            <li><strong>Dominio .com:</strong> S/45-80/año</li>
            <li><strong>Hosting básico:</strong> S/150-300/año</li>
            <li><strong>Hosting profesional:</strong> S/300-600/año</li>
          </ul>

          <h3>Mantenimiento y Actualizaciones</h3>
          <p>Tu página web para restaurante necesita mantenimiento constante:</p>
          <ul>
            <li><strong>Mantenimiento básico:</strong> S/100-200/mes</li>
            <li><strong>Actualizaciones de contenido:</strong> S/50-150/mes</li>
            <li><strong>Soporte técnico:</strong> S/150-300/mes</li>
          </ul>
        </section>

        <section>
          <h2>Precios por Agencias vs Freelancers en Lima</h2>
          
          <h3>Agencias de Marketing Digital</h3>
          <p>Precios más altos pero servicio integral:</p>
          <ul>
            <li>Sitio básico: S/2,000-3,500</li>
            <li>Sitio profesional: S/3,500-6,000</li>
            <li>Sitio premium: S/6,000-12,000+</li>
          </ul>

          <h3>Freelancers Independientes</h3>
          <p>Costos más accesibles pero variable en calidad:</p>
          <ul>
            <li>Sitio básico: S/800-1,500</li>
            <li>Sitio profesional: S/1,500-3,000</li>
            <li>Sitio premium: S/3,000-6,000</li>
          </ul>
        </section>

        <section>
          <h2>Cómo Ahorrar en tu Página Web Restaurante</h2>
          
          <h3>1. Define Prioridades</h3>
          <p>Empieza con lo esencial: menú digital, contacto y reservas. Puedes agregar funciones después.</p>

          <h3>2. Prepara tu Contenido</h3>
          <p>Tener listas las fotos, textos y menú reduce el tiempo de desarrollo.</p>

          <h3>3. Elige Paquetes Integrales</h3>
          <p>Como nuestro servicio en <a href="/" title="página web restaurante económica">Mi Restaurante Online</a>, que incluye todo por S/297/mes sin costo inicial.</p>
        </section>

        <section>
          <h2>ROI: ¿Vale la Pena la Inversión?</h2>
          <p>Restaurantes con sitio web en Lima reportan:</p>
          <ul>
            <li>30-50% más reservas telefónicas</li>
            <li>25% más visitas de clientes nuevos</li>
            <li>Reducción del 60% en llamadas para consultar horarios/menú</li>
            <li>Mayor presencia en Google Maps</li>
          </ul>
        </section>

        <section>
          <h2>Conclusión</h2>
          <p>El precio de una página web para restaurante en Perú varía significativamente según tus necesidades. La clave está en invertir inteligentemente: empieza con lo esencial y ve creciendo según tus resultados.</p>
          
          <div class="cta-box">
            <h3>¿Buscas una página web restaurante económica pero profesional?</h3>
            <p>En <a href="/" title="diseño web restaurante precios Lima">Mi Restaurante Online</a> ofrecemos páginas web completas desde S/297/mes, sin costo inicial y con todo incluido.</p>
            <a href="/" class="cta-button">Ver Planes y Precios</a>
          </div>
        </section>
      </article>
    `,
    keywords: ['precio página web restaurante', 'costo sitio web restaurante', 'página web restaurante económica', 'precio diseño web restaurante'],
    metaDescription: 'Descubre los precios reales de una página web para restaurante en Perú 2024. Costos, planes y cómo elegir la mejor opción para tu restaurante en Lima.',
    readingTime: 7,
    publishDate: '2024-01-20',
    author: 'Mi Restaurante Online',
    featured: true,
    relatedArticles: ['1', '3', '5']
  },
  {
    id: '3',
    title: 'Menú Digital para Restaurante: Guía Completa con Código QR',
    slug: 'menu-digital-restaurante-codigo-qr-peru',
    category: 'tecnologia-restaurante',
    excerpt: 'Aprende a implementar un menú digital con código QR para tu restaurante. Beneficios, costos y mejores prácticas para Lima y Perú.',
    content: `
      <article>
        <header>
          <h1>Menú Digital para Restaurante: Guía Completa con Código QR</h1>
          <p class="lead">El menú digital con código QR revolucionó la industria restaurantera post-pandemia. Te mostramos cómo implementarlo exitosamente en tu restaurante en Lima.</p>
        </header>

        <section>
          <h2>¿Qué es un Menú Digital con Código QR?</h2>
          <p>Un menú digital es la versión online de tu carta tradicional, accesible mediante un código QR que los clientes escanean con su smartphone.</p>
          
          <h3>Ventajas del Menú Digital:</h3>
          <ul>
            <li><strong>Cero costos de impresión:</strong> Actualizas precios al instante</li>
            <li><strong>Higiene total:</strong> Sin contacto físico</li>
            <li><strong>Información completa:</strong> Fotos, ingredientes, alérgenos</li>
            <li><strong>Facilidad de actualización:</strong> Cambios en tiempo real</li>
            <li><strong>Analytics:</strong> Sabes qué platos se consultan más</li>
          </ul>
        </section>

        <section>
          <h2>Implementación de Menú Digital en tu Restaurante</h2>
          
          <h3>Paso 1: Crear tu Menú Digital</h3>
          <p>Necesitas una <a href="/" title="página web restaurante con menú digital">página web restaurante con menú digital</a> que incluya:</p>
          <ul>
            <li>Categorías claras (Entradas, Principales, Postres, Bebidas)</li>
            <li>Fotos de alta calidad de cada plato</li>
            <li>Descripciones detalladas</li>
            <li>Precios actualizados</li>
            <li>Información de alérgenos</li>
          </ul>

          <h3>Paso 2: Generar Códigos QR</h3>
          <p>Herramientas gratuitas para crear códigos QR:</p>
          <ul>
            <li>QR Code Generator</li>
            <li>QRStuff</li>
            <li>Google Charts API</li>
          </ul>

          <h3>Paso 3: Diseño e Impresión</h3>
          <p>El código QR debe ser:</p>
          <ul>
            <li>Mínimo 3x3 cm para fácil escaneo</li>
            <li>Impreso en material resistente</li>
            <li>Acompañado de instrucciones claras</li>
            <li>Ubicado estratégicamente en cada mesa</li>
          </ul>
        </section>

        <section>
          <h2>Mejores Prácticas para Menú Digital</h2>
          
          <h3>Diseño Mobile-First</h3>
          <p>90% de clientes usan smartphone para escanear. Tu menú debe:</p>
          <ul>
            <li>Cargar rápido (menos de 3 segundos)</li>
            <li>Ser fácil de navegar con el pulgar</li>
            <li>Tener botones grandes</li>
            <li>Usar tipografía legible</li>
          </ul>

          <h3>Organización del Contenido</h3>
          <ul>
            <li><strong>Platos destacados arriba:</strong> Tus especialidades primero</li>
            <li><strong>Filtros útiles:</strong> Por tipo, precio, restricciones dietéticas</li>
            <li><strong>Información completa:</strong> Ingredientes, preparación, alérgenos</li>
            <li><strong>Llamadas a la acción:</strong> "Pedir ahora", "Consultar disponibilidad"</li>
          </ul>
        </section>

        <section>
          <h2>Costos de Implementación en Perú</h2>
          
          <h3>Desarrollo del Menú Digital</h3>
          <ul>
            <li><strong>DIY (hazlo tú mismo):</strong> S/50-200 (herramientas online)</li>
            <li><strong>Freelancer:</strong> S/300-800</li>
            <li><strong>Agencia profesional:</strong> S/800-2,000</li>
            <li><strong>Servicio integral:</strong> Desde S/297/mes (incluye web completa)</li>
          </ul>

          <h3>Impresión de QR Codes</h3>
          <ul>
            <li><strong>Stickers básicos:</strong> S/2-5 c/u</li>
            <li><strong>Porta-menús acrílicos:</strong> S/15-25 c/u</li>
            <li><strong>Displays de mesa premium:</strong> S/30-50 c/u</li>
          </ul>
        </section>

        <section>
          <h2>Casos de Éxito en Lima</h2>
          <p>Restaurantes en Miraflores y San Isidro que implementaron menú digital reportan:</p>
          <ul>
            <li>Reducción del 40% en tiempo de toma de pedidos</li>
            <li>Aumento del 25% en pedidos de postres y bebidas</li>
            <li>Mayor satisfacción del cliente (menos esperas)</li>
            <li>Ahorro significativo en costos de impresión</li>
          </ul>
        </section>

        <section>
          <h2>Errores Comunes a Evitar</h2>
          
          <h3>1. Menú Demasiado Complejo</h3>
          <p>Los clientes se frustran si no encuentran rápido lo que buscan.</p>

          <h3>2. No Tener Plan B</h3>
          <p>Siempre ten algunos menús físicos para clientes que no sepan usar QR.</p>

          <h3>3. Fotos de Mala Calidad</h3>
          <p>Las imágenes son cruciales para aumentar las ventas.</p>

          <h3>4. No Actualizar Precios</h3>
          <p>Mantén sincronizados menú digital y físico.</p>
        </section>

        <section>
          <h2>Futuro del Menú Digital en Perú</h2>
          <p>Tendencias emergentes:</p>
          <ul>
            <li><strong>Integración con sistemas POS:</strong> Pedidos directos desde el menú</li>
            <li><strong>Personalización por cliente:</strong> Recomendaciones basadas en historial</li>
            <li><strong>Realidad aumentada:</strong> Ver platos en 3D antes de pedir</li>
            <li><strong>Pagos integrados:</strong> Pagar directo desde el menú</li>
          </ul>
        </section>

        <section>
          <h2>Conclusión</h2>
          <p>Implementar un menú digital con código QR no es solo una tendencia, es una necesidad competitiva. Los restaurantes que lo adopten primero tendrán ventaja significativa en el mercado limeño.</p>
          
          <div class="cta-box">
            <h3>¿Listo para digitalizar tu menú?</h3>
            <p>En <a href="/" title="sitio web restaurante con menú QR">Mi Restaurante Online</a> incluimos menú digital con QR en todos nuestros planes desde S/297/mes.</p>
            <a href="/" class="cta-button">Solicitar Demo de Menú Digital</a>
          </div>
        </section>
      </article>
    `,
    keywords: ['menú digital para restaurante', 'código QR restaurante', 'menú QR Lima', 'menú digital código QR'],
    metaDescription: 'Guía completa para implementar menú digital con código QR en tu restaurante. Costos, mejores prácticas y casos de éxito en Lima, Perú.',
    readingTime: 6,
    publishDate: '2024-01-25',
    author: 'Mi Restaurante Online',
    featured: false,
    relatedArticles: ['1', '4', '6']
  }
  // Add more articles as needed...
];

export const getArticlesByCategory = (category: ArticleCategory): Article[] => {
  return articles.filter(article => article.category === category);
};

export const getFeaturedArticles = (): Article[] => {
  return articles.filter(article => article.featured);
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find(article => article.slug === slug);
};

export const getRelatedArticles = (articleId: string): Article[] => {
  const article = articles.find(a => a.id === articleId);
  if (!article) return [];
  
  return articles.filter(a => article.relatedArticles.includes(a.id));
};