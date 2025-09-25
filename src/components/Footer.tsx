import { MessageCircle, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { businessData } from "@/config/businessData";

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
                to="/guia"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Guía Completa
              </Link>
              <Link 
                to="/acerca-de"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Acerca de Nosotros
              </Link>
              <Link 
                to="/privacy"
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Política de Privacidad
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