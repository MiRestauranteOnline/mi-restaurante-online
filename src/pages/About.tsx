import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import kevinPhoto from "@/assets/kevin-van-geffen-bio.webp";
import sandraPhoto from "@/assets/sandra-fumagalli-bio.webp";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-12 md:pb-16 bg-[hsl(var(--primary)_/_0.05)] min-h-[40vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 px-2">
              Conoce a Nuestro Equipo
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              Somos un equipo apasionado dedicado a ayudar a los restaurantes peruanos 
              a crecer en el mundo digital con sitios web profesionales y estrategias efectivas.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
              
              {/* Kevin van Geffen */}
              <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                <div className="text-center mb-8">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary/20">
                    <img 
                      src={kevinPhoto} 
                      alt="Kevin van Geffen - Co Fundador, Desarrollador, Diseñador y Especialista en Marketing"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Kevin van Geffen</h2>
                  <p className="text-primary font-semibold mb-4">Co Fundador, Desarrollador, Diseñador y Especialista en Marketing</p>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Kevin es un emprendedor tecnológico con más de 8 años de experiencia en desarrollo web 
                    y marketing digital. Su pasión por crear soluciones digitales innovadoras lo llevó a 
                    especializarse en el sector gastronómico peruano.
                  </p>
                  <p>
                    Como desarrollador full-stack y diseñador UX/UI, Kevin combina su expertise técnico 
                    con un profundo entendimiento del mercado local para crear sitios web que no solo 
                    son visualmente atractivos, sino que también generan resultados reales para los restaurantes.
                  </p>
                  <p>
                    Su enfoque en la experiencia del usuario y las estrategias de conversión ha ayudado 
                    a decenas de restaurantes a aumentar sus ventas online y mejorar su presencia digital.
                  </p>
                </div>
              </div>

              {/* Sandra Fumagalli */}
              <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                <div className="text-center mb-8">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary/20">
                    <img 
                      src={sandraPhoto} 
                      alt="Sandra Fumagalli - Co Fundadora, Estratega de Contenido y Especialista en Redes Sociales"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Sandra Fumagalli</h2>
                  <p className="text-primary font-semibold mb-4">Co Fundadora, Estratega de Contenido y Especialista en Redes Sociales</p>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Sandra es una experta en comunicación digital con una sólida formación en marketing 
                    de contenidos y gestión de redes sociales. Su experiencia en el sector gastronómico 
                    le permite crear estrategias de contenido que conectan emocionalmente con los comensales.
                  </p>
                  <p>
                    Especializada en storytelling gastronómico y marketing de influencers, Sandra entiende 
                    cómo contar la historia única de cada restaurante de manera que resuene con su audiencia 
                    objetivo y genere engagement auténtico.
                  </p>
                  <p>
                    Su enfoque data-driven y su creatividad han resultado en campañas exitosas que han 
                    incrementado la visibilidad online y el reconocimiento de marca de nuestros clientes 
                    en el competitivo mercado gastronómico peruano.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 md:mb-8">
              Nuestra Misión
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-6 md:mb-8">
              Democratizar el acceso a sitios web profesionales para restaurantes en Perú, 
              combinando tecnología internacional de vanguardia con un profundo entendimiento 
              del mercado local y precios accesibles.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Creemos que cada restaurante, sin importar su tamaño, merece tener una presencia 
              digital profesional que refleje la calidad de su comida y servicio.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;