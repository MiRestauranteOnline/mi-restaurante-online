import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Inicio", href: "#hero" },
    { label: "Beneficios", href: "#benefits" },
    { label: "Cómo Funciona", href: "#how-it-works" },
    { label: "Precios", href: "#pricing" },
    { label: "Aplicar", href: "#application" },
    { label: "FAQ", href: "#faq" },
    { label: "Contacto", href: "/contacto" }
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = href;
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img 
            src="/logo.svg?v=2"
              alt="Mi Restaurante Online"
              className="h-16 w-auto"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.href)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleNavClick("#application")}
            >
              Aplicar Ahora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                <button
                  key={index}
                  onClick={() => handleNavClick(item.href)}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium py-2 text-left"
                >
                  {item.label}
                </button>
              ))}
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 mt-4"
                onClick={() => handleNavClick("#application")}
              >
                Aplicar Ahora
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};