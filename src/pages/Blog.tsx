import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Search, Filter } from "lucide-react";
import { articles, categoryLabels, type ArticleCategory } from "@/data/articles";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const featuredArticles = articles.filter(article => article.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* SEO Optimized Header */}
      <header className="bg-gradient-subtle py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Guía Completa de Páginas Web para Restaurantes
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Todo lo que necesitas saber sobre diseño web restaurante, menús digitales, 
              marketing online y cómo crear un sitio web exitoso para tu restaurante en Lima y Perú.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">Sitio Web Restaurante</Badge>
              <Badge variant="secondary">Diseño Web Restaurante</Badge>
              <Badge variant="secondary">Menú Digital</Badge>
              <Badge variant="secondary">SEO Local Lima</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Artículos Destacados</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-primary transition-smooth">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{categoryLabels[article.category]}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readingTime} min
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">
                      <Link 
                        to={`/guia/${article.category}/${article.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{article.publishDate}</span>
                      <Link to={`/guia/${article.category}/${article.slug}`}>
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
        </section>
      )}

      {/* Search and Filter */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar artículos sobre páginas web, menús digitales, SEO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 md:w-auto">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">
                  No se encontraron artículos que coincidan con tu búsqueda.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}>
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">
                    {searchTerm || selectedCategory !== "all" 
                      ? `Resultados de búsqueda (${filteredArticles.length})`
                      : `Todos los Artículos (${filteredArticles.length})`
                    }
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-primary transition-smooth">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{categoryLabels[article.category]}</Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            {article.readingTime} min
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">
                          <Link 
                            to={`/guia/${article.category}/${article.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {article.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {article.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{article.publishDate}</span>
                          <Link to={`/guia/${article.category}/${article.slug}`}>
                            <Button variant="outline" size="sm">
                              Leer Más
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para crear tu página web para restaurante?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Después de leer nuestras guías, da el siguiente paso. Crea tu sitio web restaurante profesional 
            con nosotros desde S/297/mes, sin costo inicial.
          </p>
          <div className="flex justify-center">
            <Link to="/">
              <Button size="lg" className="shadow-primary">
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

export default Blog;