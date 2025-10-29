import { MessageCircle, Mail, MapPin, Facebook, Instagram, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { businessData } from "@/config/businessData";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const handleWhatsAppClick = () => {
    window.open(`${businessData.contact.whatsapp.url}?text=${encodeURIComponent(businessData.contact.whatsapp.message)}`, "_blank");
  };

  return (
    <footer className="bg-muted py-12">
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
              {businessData.company.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Enlaces Útiles</h3>
            <div className="space-y-2">
              <Link 
                to="/guias/primeros-pasos/introduccion"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Guías & Documentación
              </Link>
              <Link 
                to="/blog"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Blog & Artículos
              </Link>
              <Link 
                to="/acerca-de"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Acerca de Nosotros
              </Link>
              <Link 
                to="/libro-reclamaciones"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Libro de Reclamaciones
              </Link>
              <Link 
                to="/privacy"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link 
                to="/cookies"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Política de Cookies
              </Link>
              <Link 
                to="/terms"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Términos de Servicio
              </Link>
              <Link 
                to="/contacto"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Contacto
              </Link>
              <Link to="/auth" className="block mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
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
                WhatsApp: {businessData.contact.whatsapp.displayNumber}
              </button>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                {businessData.contact.email.info}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" />
                {businessData.address.displayShort}
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="font-semibold text-foreground mb-3 text-sm">Síguenos</h4>
              <div className="flex gap-3">
                <a
                  href={businessData.socialMedia.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={businessData.socialMedia.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={businessData.socialMedia.tiktok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Trust Badges */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <span>Protección de datos empresarial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Certificado SSL incluido</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <span>Anti-spam Cloudflare Turnstile</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>CDN global Cloudflare</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} {businessData.company.name}. Todos los derechos reservados.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {businessData.company.name} es una marca de {businessData.company.legalName} - RUC: {businessData.company.ruc}
          </p>
        </div>
      </div>
    </footer>
  );
};