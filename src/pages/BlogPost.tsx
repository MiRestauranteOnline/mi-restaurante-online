import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Calendar, User, Home, ChevronRight, Loader2 } from "lucide-react";
import { getArticleBySlug, getRelatedArticles, categoryLabels, type Article } from "@/data/articles";
import { TableOfContents } from "@/components/TableOfContents";
import "../blog.css";

const BlogPost = () => {
  const { category, slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // First useEffect - fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const foundArticle = await getArticleBySlug(slug);
        if (foundArticle) {
          setArticle(foundArticle);
          setRelatedArticles(getRelatedArticles(foundArticle.id));
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // Second useEffect - handle SEO (only when article is loaded)
  useEffect(() => {
    if (!article) return;
    
    document.title = `${article.title} | Mi Restaurante Online`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', article.metaDescription);
    }

    // Add structured data (JSON-LD) for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.excerpt,
      "image": article.featuredImageUrl || getArticleImage(article.slug),
      "author": {
        "@type": "Person",
        "name": article.author,
        "url": "https://mirestauranteonline.com/sobre-nosotros"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Mi Restaurante Online",
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
        "@id": `https://mirestauranteonline.com/guia/${article.category}/${article.slug}`
      },
      "keywords": article.keywords.join(", "),
      "wordCount": article.content.split(' ').filter(word => word.length > 0).length,
      "timeRequired": `PT${article.readingTime}M`,
      "inLanguage": "es-PE",
      "audience": {
        "@type": "Audience",
        "audienceType": "restaurant owners, entrepreneurs"
      }
    };

    // Add breadcrumb structured data
    const breadcrumbData = {
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
          "item": `https://mirestauranteonline.com/guia?category=${article.category}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": article.title,
          "item": `https://mirestauranteonline.com/guia/${article.category}/${article.slug}`
        }
      ]
    };

    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.textContent?.includes('"@type": "Article"') || 
          script.textContent?.includes('"@type": "BreadcrumbList"')) {
        script.remove();
      }
    });

    // Add new structured data
    const articleScript = document.createElement('script');
    articleScript.type = 'application/ld+json';
    articleScript.textContent = JSON.stringify(structuredData);
    document.head.appendChild(articleScript);

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(breadcrumbScript);

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.textContent?.includes('"@type": "Article"') || 
            script.textContent?.includes('"@type": "BreadcrumbList"')) {
          script.remove();
        }
      });
    };
  }, [article]);

  // Helper function
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

  // NOW we can do conditional rendering AFTER all hooks are called
  if (!category || !slug) {
    return <Navigate to="/guia" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Cargando artículo...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/guia" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Breadcrumb Navigation */}
      <nav className="bg-muted/30 border-b mt-16" role="navigation" aria-label="Breadcrumb">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Inicio
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <li>
              <Link to="/guia" className="text-muted-foreground hover:text-primary transition-colors">
                Guía
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <li>
              <Link 
                to={`/guia?category=${article.category}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {categoryLabels[article.category as keyof typeof categoryLabels]}
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <li className="text-foreground font-medium truncate">{article.title}</li>
          </ol>
        </div>
      </nav>

      {/* Article Header */}
      <header className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Badge variant="outline" className="mb-4">
                {categoryLabels[article.category as keyof typeof categoryLabels]}
              </Badge>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {article.excerpt}
            </p>
            
            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={article.publishDate}>{article.publishDate}</time>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{article.readingTime} min de lectura</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{article.author}</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img 
                src={article.featuredImageUrl || getArticleImage(article.slug)}
                alt={article.featuredImageAlt || article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              
              {/* Main Content */}
              <article className="lg:col-span-8">
                <div className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    className="blog-content"
                  />
                </div>

                {/* Article Footer */}
                <footer className="mt-12 pt-8 border-t">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm text-muted-foreground">Etiquetas:</span>
                    {article.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </footer>
              </article>

              {/* Sidebar */}
              <aside className="lg:col-span-4 mt-12 lg:mt-0">
                <div className="sticky top-24 space-y-8">
                  
                  {/* Table of Contents */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Contenido del Artículo</h3>
                    <TableOfContents content={article.content} />
                  </Card>

                  {/* CTA Card */}
                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg">¿Necesitas ayuda con tu página web?</CardTitle>
                      <CardDescription>
                        Somos expertos en crear sitios web para restaurantes en Lima y todo Perú.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul className="space-y-2 text-sm mb-4">
                        <li>✓ Diseño web profesional</li>
                        <li>✓ Menú digital integrado</li>
                        <li>✓ Sistema de reservas</li>
                        <li>✓ SEO optimizado</li>
                      </ul>
                      <Link to="/contacto">
                        <Button className="w-full">
                          Solicitar Consulta Gratuita
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      {/* Author Bio */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Acerca del Autor</h3>
                  <p className="text-muted-foreground mb-4">
                    <strong>{article.author}</strong> es especialista en desarrollo web para restaurantes con más de 8 años de experiencia 
                    ayudando a restaurantes en Lima, Arequipa y Cusco a crear su presencia digital exitosa.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ha trabajado con más de 200 restaurantes en Perú, desde pequeños negocios familiares hasta cadenas reconocidas, 
                    implementando soluciones web que aumentan las ventas y mejoran la experiencia del cliente.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Artículos Relacionados</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <Card key={relatedArticle.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={relatedArticle.featuredImageUrl || getArticleImage(relatedArticle.slug)}
                        alt={relatedArticle.featuredImageAlt || relatedArticle.title}
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{relatedArticle.publishDate}</span>
                        <Link to={`/guia/${relatedArticle.category}/${relatedArticle.slug}`}>
                          <Button variant="outline" size="sm">
                            Leer Más
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog CTA */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Te gustó este artículo?</h2>
          <p className="text-muted-foreground mb-6">
            Descubre más guías y consejos para hacer crecer tu restaurante online.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/guia">
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver Todos los Artículos
              </Button>
            </Link>
            <Link to="/contacto">
              <Button>
                Crear Mi Página Web
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;