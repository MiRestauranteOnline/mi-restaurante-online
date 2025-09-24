import { MessageCircle, Mail, MapPin } from "lucide-react";

export const Footer = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/51999999999?text=Hola, quiero información sobre los sitios web para restaurantes", "_blank");
  };

  return (
    <footer className="bg-muted py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/logo.svg?v=2"
                alt="Mi Restaurante Online"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Sitios web profesionales para restaurantes en Perú. 
              Calidad internacional, precios locales.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Enlaces Útiles</h3>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.href = '/privacy'}
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Política de Privacidad
              </button>
              <button 
                onClick={() => window.location.href = '/terms'}
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Términos de Servicio
              </button>
              <button 
                onClick={() => window.location.href = '/contacto'}
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Contacto
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
            <div className="space-y-3">
              <button 
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp: +51 999 999 999
              </button>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                info@mirestaurante.online
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" />
                Lima, Perú
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Mi Restaurante Online. Todos los derechos reservados.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Mi Restaurante Online es una marca de Mujeres y Madres Internacional SAC - RUC: 20610336869
          </p>
        </div>
      </div>
    </footer>
  );
};