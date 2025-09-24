import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Términos de Servicio
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-PE')}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Sobre Nuestros Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                <strong>IMPORTANTE:</strong> Los paquetes incluyen sitios web de alta calidad. 
                Utilizamos plantillas creadas internamente con las últimas tecnologías.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>No ofrecemos funciones completamente personalizadas</strong> que no estén 
                listadas en nuestra página dentro del paquete básico. Las opciones de desarrollo 
                adicional pueden ser discutidas pero serán manejadas a través de cotizaciones personalizadas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paquetes y Funcionalidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Plan Básico (S/297/mes)</h4>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Sitio profesional en 72 horas</li>
                    <li>Hosting + SSL incluido</li>
                    <li>SEO básico optimizado</li>
                    <li>Botón WhatsApp integrado</li>
                    <li>Menú descargable en PDF</li>
                    <li>Cambios auto-gestionables (PIN)</li>
                    <li>Soporte por WhatsApp</li>
                    <li>Hasta 3,000 visitas/mes o 6 GB</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Plan Avanzado (S/497/mes)</h4>
                  <p className="text-muted-foreground">Incluye todo del Plan Básico más:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                    <li>1 hora/mes de cambios extendidos</li>
                    <li>Cambios de textos e imágenes</li>
                    <li>Nuevas secciones personalizadas</li>
                    <li>Soporte prioritario</li>
                    <li>Login opcional si necesitas</li>
                    <li>Asesoría mensual incluida</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitaciones y Sobrecargos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Sobrecargo: S/15 por cada 1,000 visitas adicionales o 3 GB (lo que sea mayor)</li>
                <li>Los dominios se adquieren por separado (recomendamos Namecheap)</li>
                <li>Evitamos GoDaddy por costos altos y panel confuso</li>
                <li>Las funciones no listadas requieren cotización personalizada</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Garantías y Cancelación</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Precio fijo de por vida si contratas durante el período promocional</li>
                <li>Demo funcional entregado en 72 horas</li>
                <li>Tras 6 meses de cancelación, el sitio se desactiva</li>
                <li>No ofrecemos servicios de migración (sitio administrado)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para preguntas sobre estos términos, contacta:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>WhatsApp: +51 999 999 999</li>
                <li>Email: info@mirestaurante.online</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;