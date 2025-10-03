import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DNSInstructionsProps {
  domainVerified: boolean;
}

export const DNSInstructions = ({ domainVerified }: DNSInstructionsProps) => {
  const [isOpen, setIsOpen] = useState(!domainVerified);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copiado",
        description: "IP copiada al portapapeles"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <span>📋 Instrucciones de Configuración DNS</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                La propagación DNS puede tardar entre 24-48 horas
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <p className="font-semibold">Pasos a seguir:</p>
              
              <ol className="space-y-3 list-decimal list-inside">
                <li>Ve al panel de tu registrador de dominios (GoDaddy, Namecheap, etc.)</li>
                <li>Busca la sección de configuración DNS o Nameservers</li>
                <li>Agrega los siguientes registros A:</li>
              </ol>

              <div className="bg-muted p-4 rounded-lg space-y-3 ml-6">
                <div className="space-y-1">
                  <p className="font-mono text-xs">
                    <span className="text-muted-foreground">Tipo:</span> A<br />
                    <span className="text-muted-foreground">Nombre:</span> @<br />
                    <span className="text-muted-foreground">Valor:</span> 185.158.133.1<br />
                    <span className="text-muted-foreground">TTL:</span> 3600
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-xs">
                    <span className="text-muted-foreground">Tipo:</span> A<br />
                    <span className="text-muted-foreground">Nombre:</span> www<br />
                    <span className="text-muted-foreground">Valor:</span> 185.158.133.1<br />
                    <span className="text-muted-foreground">TTL:</span> 3600
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('185.158.133.1')}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar IP: 185.158.133.1
                    </>
                  )}
                </Button>
              </div>

              <ol start={4} className="space-y-2 list-decimal list-inside">
                <li>Guarda los cambios</li>
                <li>Espera la propagación DNS (24-48 horas)</li>
                <li>El certificado SSL se emitirá automáticamente</li>
                <li>Haz clic en "Verificar Dominio" abajo cuando hayas completado la configuración</li>
              </ol>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
