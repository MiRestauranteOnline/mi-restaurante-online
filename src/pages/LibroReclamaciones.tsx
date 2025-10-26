import { Helmet } from "react-helmet";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ReclamacionesForm } from "@/components/ReclamacionesForm";
import { businessData } from "@/config/businessData";

const LibroReclamaciones = () => {
  return (
    <>
      <Helmet>
        <title>Libro de Reclamaciones - {businessData.company.name}</title>
        <meta name="description" content="Libro de Reclamaciones Virtual conforme al Código de Protección y Defensa del Consumidor (Ley N.º 29571). Presenta tu reclamo o queja." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main id="main-content" className="flex-grow">
          <section className="pt-24 pb-16 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Libro de Reclamaciones
                </h1>
                
                <div className="bg-card border border-border rounded-lg p-6 text-left space-y-4">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">{businessData.company.legalName} (RUC {businessData.company.ruc})</strong> pone a tu disposición el <strong className="text-foreground">Libro de Reclamaciones Virtual</strong>, conforme al Reglamento del Libro de Reclamaciones del <strong className="text-foreground">Código de Protección y Defensa del Consumidor (Ley N.º 29571)</strong>.
                  </p>
                  
                  <p className="text-muted-foreground">
                    El plazo de atención de tu <strong className="text-foreground">reclamo o queja</strong> puede ser de <strong className="text-foreground">hasta 30 días calendario</strong>.
                  </p>
                  
                  <p className="text-muted-foreground">
                    Los datos que proporciones serán tratados de acuerdo con nuestra <strong className="text-foreground">Política de Datos Personales</strong>, exclusivamente para <strong className="text-foreground">gestionar y responder</strong> tu solicitud dentro del plazo legal.
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Rellena el Formulario
                </h2>
                <p className="text-muted-foreground mb-6">
                  Conforme a la Ley N.º 29571. Completa el formulario y te responderemos en un máximo de 30 días calendario.
                </p>
                
                <ReclamacionesForm />
              </div>

              {/* Footer Note */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  * Plazo de respuesta: hasta 30 días calendario. Si no quedas conforme, puedes acudir a INDECOPI con tu código de registro.
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default LibroReclamaciones;
