import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-PE')}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información que Recopilamos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-muted-foreground mb-4">
                Recopilamos la información que nos proporcionas directamente cuando:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Completas nuestro formulario de aplicación</li>
                <li>Te contactas con nosotros por WhatsApp o email</li>
                <li>Solicitas información sobre nuestros servicios</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cómo Usamos tu Información</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Crear y mantener tu sitio web profesional</li>
                <li>Proporcionarte soporte técnico</li>
                <li>Comunicarnos contigo sobre tu servicio</li>
                <li>Mejorar nuestros servicios</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protección de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad apropiadas para proteger tu información personal 
                contra acceso no autorizado, alteración, divulgación o destrucción. Todos los datos 
                se almacenan de forma segura y solo el personal autorizado tiene acceso a ellos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos a través de:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mt-4 space-y-2">
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

export default Privacy;