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

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.metaDescription,
      "author": {
        "@type": "Organization",
        "name": article.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Mi Restaurante Online",
        "logo": {
          "@type": "ImageObject",
          "url": "https://mirestauranteonline.com/logo.svg"
        }
      },
      "datePublished": article.publishDate,
      "dateModified": article.publishDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://mirestauranteonline.com/guia/${category}/${slug}`
      },
      "keywords": article.keywords.join(", ")
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.text = JSON.stringify(structuredData);
    document.head.appendChild(scriptTag);

    // Cleanup function
    return () => {
      document.head.removeChild(scriptTag);
    };
  }, [article, category, slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Breadcrumbs */}
      <nav className="py-4 mt-16 border-b">
        <div className="container mx-auto px-4">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
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
      <header className="py-12 bg-gradient-subtle">
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
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
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
                  
                  {/* Social Share - Optional */}
                  <div className="text-center">
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

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                  {/* CTA Card */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">¿Necesitas ayuda?</CardTitle>
                      <CardDescription>
                        Creamos tu página web para restaurante de forma profesional
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Link to="/">
                          <Button className="w-full" size="sm">
                            Ver Nuestros Planes
                          </Button>
                        </Link>
                        <Link to="/contacto">
                          <Button variant="outline" className="w-full" size="sm">
                            Consulta Gratuita
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table of Contents - could be generated from content headings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">En este artículo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <nav className="space-y-2">
                        <p className="text-muted-foreground">
                          Navega rápidamente por las secciones principales de este artículo sobre {article.keywords[0]}.
                        </p>
                      </nav>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Artículos Relacionados</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <Card key={relatedArticle.id} className="hover:shadow-primary transition-smooth">
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
                ))}
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