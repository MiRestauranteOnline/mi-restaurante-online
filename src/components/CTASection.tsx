import { Button } from "@/components/ui/button";
import restaurantInterior from "@/assets/restaurant-interior.jpg";

export const CTASection = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/51999999999?text=Hola, quiero información sobre los sitios web para restaurantes", "_blank");
  };

  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
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
            Más de 100 restaurantes ya confían en nosotros. Tu sitio web profesional está a solo 72 horas de distancia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary transition-smooth text-lg px-8 py-4"
              onClick={handleWhatsAppClick}
            >
              Aplicar Ahora
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
              onClick={handleScrollToPricing}
            >
              Ver Precios
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};