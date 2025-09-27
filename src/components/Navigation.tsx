import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const menuItems = [
    { label: "Inicio", href: "/", section: "hero" },
    { label: "Beneficios", href: "/", section: "benefits" },
    { label: "Cómo Funciona", href: "/", section: "how-it-works" },
    { label: "Precios", href: "/", section: "pricing" },
    { label: "Aplicar", href: "/", section: "application" },
    { label: "FAQ", href: "/", section: "faq" },
    { label: "Contacto", href: "/contacto" }
  ];

  const handleNavClick = (item: { href: string; section?: string }) => {
    setIsMenuOpen(false);
    
    if (item.section && isHomePage) {
      // If we're on homepage and it's a section, scroll to it
      const element = document.querySelector(`#${item.section}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    // Otherwise, let Link handle the navigation
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 pb-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.svg?v=2"
              alt="Mi Restaurante Online"
              className="h-16 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                onClick={() => handleNavClick(item)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                aria-label={`Navegar a ${item.label}`}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/registro">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
              >
                Crear Mi Sitio
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border shadow-lg">
            <div className="flex flex-col space-y-1 p-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => handleNavClick(item)}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium py-2 text-left"
                  aria-label={`Navegar a ${item.label}`}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/registro">
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 mt-4"
                >
                  Crear Mi Sitio
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};