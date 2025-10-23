import { Button } from "@/components/ui/button";
import { businessData } from "@/config/businessData";
import restaurantInterior from "@/assets/restaurant-interior.jpg";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();
  
  const handleWhatsAppClick = () => {
    window.open(`${businessData.contact.whatsapp.url}?text=${encodeURIComponent(businessData.contact.whatsapp.message)}`, "_blank");
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${restaurantInterior})` }}
      />
      
      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 via-secondary/70 to-secondary/80" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white">
            ¿Listo para hacer crecer tu restaurante online?
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Tu sitio web profesional, listo en 72 horas. Sin complicaciones, sin costos ocultos, sin sorpresas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary transition-smooth text-lg px-8 py-4"
              onClick={() => navigate('/registro')}
            >
              Registrarse Ahora
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-primary hover:bg-white/20 hover:text-primary text-lg px-8 py-4"
              onClick={handleWhatsAppClick}
            >
              Hablar por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};