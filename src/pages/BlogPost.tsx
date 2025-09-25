import { useParams, Link, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Calendar, User, Home, ChevronRight } from "lucide-react";
import { getArticleBySlug, getRelatedArticles, categoryLabels } from "@/data/articles";
import { useEffect } from "react";
import { TableOfContents } from "@/components/TableOfContents";
import "../blog.css";

const BlogPost = () => {
  const { category, slug } = useParams();
  
  if (!category || !slug) {
    return <Navigate to="/guia" replace />;
  }

  const article = getArticleBySlug(slug);
  
  if (!article) {
    return <Navigate to="/guia" replace />;
  }

  const relatedArticles = getRelatedArticles(article.id);

  // Update document title and meta description for SEO
  useEffect(() => {
    document.title = `${article.title} | Mi Restaurante Online`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', article.metaDescription);
    }

    // Helper function to get article featured image
    const getArticleImage = (slug: string) => {
      switch(slug) {
        case 'como-crear-sitio-web-restaurante-peru':
          return 'https://mirestauranteonline.com/src/assets/blog-restaurant-website-design.jpg';
        case 'precio-pagina-web-restaurante-peru-2025':
          return 'https://mirestauranteonline.com/src/assets/blog-restaurant-pricing.jpg';
        case 'menu-digital-qr-restaurante-lima':
          return 'https://mirestauranteonline.com/src/assets/blog-digital-menu-qr.jpg';
        default:
          return 'https://mirestauranteonline.com/src/assets/blog-restaurant-website-design.jpg';
      }
    };

    // Calculate word count from content
    const getWordCount = (htmlContent: string) => {
      const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return textContent.split(' ').length;
    };

    // Comprehensive Article Schema with all recommended fields
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.metaDescription,
      "image": {
        "@type": "ImageObject",
        "url": getArticleImage(article.slug),
        "width": 1200,
        "height": 630
      },
      "author": {
        "@type": "Person",
        "name": "Kevin van Geffen",
        "url": "https://mirestauranteonline.com",
        "jobTitle": "Diseñador y Desarrollador Web Profesional",
        "image": "https://mirestauranteonline.com/src/assets/kevin-van-geffen-bio.webp"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Mi Restaurante Online",
        "url": "https://mirestauranteonline.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://mirestauranteonline.com/logo.svg",
          "width": 200,
          "height": 60
        }
      },
      "datePublished": article.publishDate,
      "dateModified": article.publishDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://mirestauranteonline.com/guia/${category}/${slug}`
      },
      "isPartOf": {
        "@type": "Blog",
        "name": "Guía de Restaurantes Online",
        "@id": "https://mirestauranteonline.com/guia"
      },
      "articleSection": categoryLabels[article.category as keyof typeof categoryLabels],
      "articleBody": article.excerpt,
      "wordCount": getWordCount(article.content),
      "timeRequired": `PT${article.readingTime}M`,
      "inLanguage": "es-PE",
      "keywords": article.keywords.join(", "),
      "audience": {
        "@type": "Audience",
        "audienceType": "Restauranteros y propietarios de restaurantes en Perú"
      }
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://mirestauranteonline.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Guía",
          "item": "https://mirestauranteonline.com/guia"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryLabels[article.category as keyof typeof categoryLabels],
          "item": `https://mirestauranteonline.com/guia?category=${category}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": article.title,
          "item": `https://mirestauranteonline.com/guia/${category}/${slug}`
        }
      ]
    };

    // FAQ Schema (if the article contains common restaurant questions)
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Cuánto cuesta una página web para restaurante en Perú?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Los precios varían desde S/297/mes para sitios web básicos hasta S/2,500+ para sitios web personalizados con todas las funcionalidades avanzadas."
          }
        },
        {
          "@type": "Question", 
          "name": "¿Qué incluye una página web para restaurante?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Una página web completa para restaurante incluye: diseño responsive, menú digital, sistema de reservas, integración con redes sociales, SEO optimizado y soporte técnico."
          }
        },
        {
          "@type": "Question",
          "name": "¿Es necesario tener conocimientos técnicos para gestionar mi página web?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, los sistemas modernos están diseñados para ser fáciles de usar. Podrás actualizar tu menú, horarios y contenido sin conocimientos técnicos."
          }
        }
      ]
    };

    // Add all schemas to the page
    const schemas = [articleSchema, breadcrumbSchema, faqSchema];
    const scriptTags: HTMLScriptElement[] = [];

    schemas.forEach((schema, index) => {
      const scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.text = JSON.stringify(schema);
      scriptTag.setAttribute('data-schema-type', ['article', 'breadcrumb', 'faq'][index]);
      document.head.appendChild(scriptTag);
      scriptTags.push(scriptTag);
    });

    // Cleanup function
    return () => {
      scriptTags.forEach(tag => {
        if (document.head.contains(tag)) {
          document.head.removeChild(tag);
        }
      });
    };
  }, [article, category, slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Breadcrumbs */}
      <nav className="py-0 mt-20 border-b">
        <div className="container mx-auto px-4">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground py-4">
            <li>
              <Link to="/" className="hover:text-primary transition-colors flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Inicio
              </Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li>
              <Link to="/guia" className="hover:text-primary transition-colors">
                Guía
              </Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li>
              <Link 
                to={`/guia?category=${category}`} 
                className="hover:text-primary transition-colors"
              >
                {categoryLabels[article.category as keyof typeof categoryLabels]}
              </Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li className="text-foreground font-medium truncate">
              {article.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Article Header */}
      <header className="py-12 bg-[hsl(var(--primary)_/_0.05)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/guia" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la Guía
            </Link>
            
            <div className="mb-6">
              <Badge variant="outline" className="mb-4">
                {categoryLabels[article.category as keyof typeof categoryLabels]}
              </Badge>
              
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                {article.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                {article.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(article.publishDate).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {article.readingTime} min de lectura
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {article.author}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Sidebar - appears first on mobile, second on desktop */}
              <div className="lg:col-span-2 lg:order-2">
                <div className="sticky top-24 space-y-8">
                  {/* Table of Contents - visible on mobile */}
                  <Card className="lg:hidden">
                    <CardHeader>
                      <CardTitle className="text-lg">En este artículo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <TableOfContents content={article.content} />
                    </CardContent>
                  </Card>

                  {/* CTA Card */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">¿Necesitas ayuda?</CardTitle>
                      <CardDescription>
                        Creamos tu página web para restaurante de forma profesional
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => window.location.href = '/'}
                      >
                        Ver Nuestros Planes
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Table of Contents - visible on desktop */}
                  <Card className="hidden lg:block">
                    <CardHeader>
                      <CardTitle className="text-lg">En este artículo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <TableOfContents content={article.content} />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content - appears second on mobile, first on desktop */}
              <div className="lg:col-span-3 lg:order-1">
                <article 
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                {/* Template CTA Section */}
                <div className="my-12 p-6 bg-[hsl(var(--primary)_/_0.05)] border-l-4 border-primary rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">¿Listo para crear tu página web para restaurante?</h3>
                  <p className="mb-4 text-muted-foreground">
                    En <span className="text-primary font-medium">Mi Restaurante Online</span> creamos sitios web especializados para restaurantes en Lima y todo Perú. Desde S/297/mes, sin costo inicial, con todo incluido:
                  </p>
                  <ul className="list-disc list-inside mb-4 text-muted-foreground space-y-1">
                    <li>Diseño profesional personalizado</li>
                    <li>Menú digital con código QR</li>
                    <li>Sistema de reservas integrado</li>
                    <li>SEO optimizado para Lima</li>
                    <li>Soporte técnico 24/7</li>
                  </ul>
                  <div className="text-center">
                    <Button 
                      className="px-6 py-3 font-semibold"
                      onClick={() => window.location.href = '/'}
                    >
                      Ver Nuestros Planes
                    </Button>
                  </div>
                </div>
                
                {/* Article Footer */}
                <div className="mt-12 pt-8 border-t">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm font-medium text-muted-foreground">Palabras clave:</span>
                    {article.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Author Bio */}
                  <Card className="border-primary/20 bg-gradient-subtle my-8">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <img 
                            src="/src/assets/kevin-van-geffen-bio.webp" 
                            alt="Kevin van Geffen - Diseñador y Desarrollador Web Profesional"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/20"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground mb-2">Kevin van Geffen</h3>
                          <p className="text-sm text-primary font-medium mb-3">
                            Diseñador y Desarrollador Web Profesional
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Con más de 100 páginas web creadas para clientes internacionales, Kevin combina su experiencia en UX Design, Marketing y SEO para ayudar a restaurantes a destacar online. Su enfoque integral garantiza sitios web que no solo se ven increíbles, sino que también convierten visitantes en clientes.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Share - Optional */}
                  <div className="text-center mt-8">
                    <p className="text-muted-foreground mb-4">
                      ¿Te fue útil este artículo? Compártelo con otros restauranteros.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.share?.({
                            title: article.title,
                            text: article.excerpt,
                            url: window.location.href
                          }) ?? navigator.clipboard.writeText(window.location.href);
                        }}
                      >
                        Compartir
                      </Button>
                      <Link to="/guia">
                        <Button variant="outline" size="sm">
                          Ver Más Artículos
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-[hsl(var(--primary)_/_0.05)]">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Artículos Relacionados</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => {
                  // Map articles to their featured images
                  const getArticleImage = (slug: string) => {
                    switch(slug) {
                      case 'como-crear-sitio-web-restaurante-peru':
                        return '/src/assets/blog-restaurant-website-design.jpg';
                      case 'precio-pagina-web-restaurante-peru-2025':
                        return '/src/assets/blog-restaurant-pricing.jpg';
                      case 'menu-digital-qr-restaurante-lima':
                        return '/src/assets/blog-digital-menu-qr.jpg';
                      default:
                        return '/src/assets/blog-restaurant-website-design.jpg';
                    }
                  };

                  return (
                    <Card key={relatedArticle.id} className="hover:shadow-primary transition-smooth overflow-hidden">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={getArticleImage(relatedArticle.slug)} 
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">
                            {categoryLabels[relatedArticle.category as keyof typeof categoryLabels]}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            {relatedArticle.readingTime} min
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">
                          <Link 
                            to={`/guia/${relatedArticle.category}/${relatedArticle.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {relatedArticle.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {relatedArticle.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link to={`/guia/${relatedArticle.category}/${relatedArticle.slug}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Leer Artículo
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;