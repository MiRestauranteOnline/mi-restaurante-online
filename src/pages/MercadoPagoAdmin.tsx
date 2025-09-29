import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MercadoPagoSetup } from "@/components/MercadoPagoSetup";

const MercadoPagoAdmin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Administración Mercado Pago
            </h1>
            <p className="text-muted-foreground">
              Configura y gestiona los planes de suscripción
            </p>
          </div>
          
          <MercadoPagoSetup />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MercadoPagoAdmin;
