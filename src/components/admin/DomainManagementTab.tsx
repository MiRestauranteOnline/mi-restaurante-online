import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, RefreshCw, Trash2, AlertCircle, Info } from 'lucide-react';
import { useClientDomain } from '@/hooks/useClientDomain';
import { DomainStatusCard } from './DomainStatusCard';
import { DNSInstructions } from './DNSInstructions';
import { DomainProgressStepper } from './DomainProgressStepper';

const domainSchema = z.object({
  domain: z.string()
    .trim()
    .min(3, "El dominio es muy corto")
    .max(253, "El dominio es muy largo")
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
      "Formato de dominio inválido"
    )
    .transform(val => {
      return val.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    })
});

interface DomainManagementTabProps {
  clientId: string;
}

export const DomainManagementTab = ({ clientId }: DomainManagementTabProps) => {
  const [inputDomain, setInputDomain] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { domainData, isLoading, fetchDomainData, addDomain, verifyDomain, removeDomain } = useClientDomain(clientId);

  useEffect(() => {
    if (clientId) {
      fetchDomainData();
    }
  }, [clientId]);

  const handleAddDomain = async () => {
    setValidationError('');
    
    try {
      const validatedData = domainSchema.parse({ domain: inputDomain });
      await addDomain(validatedData.domain);
      setInputDomain('');
    } catch (error: any) {
      if (error?.issues) {
        setValidationError(error.issues[0]?.message || 'Error de validación');
      } else {
        setValidationError(error.message || 'Error al agregar el dominio');
      }
    }
  };

  const handleVerifyDomain = async () => {
    await verifyDomain(false);
  };

  const handleRemoveDomain = async () => {
    await removeDomain();
    setShowDeleteDialog(false);
  };

  const hasDomain = !!domainData.custom_domain;

  return (
    <div className="space-y-6">
      {!hasDomain ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Dominio Personalizado</CardTitle>
              <CardDescription>
                Configura un dominio personalizado para el cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Los dominios personalizados permiten que tu cliente acceda a su sitio web desde su propio dominio en lugar de un subdominio .lovable.app
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="custom_domain">Dominio Personalizado</Label>
                <Input
                  id="custom_domain"
                  value={inputDomain}
                  onChange={(e) => {
                    setInputDomain(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="www.restaurante.com o restaurante.com"
                  disabled={isLoading}
                />
                {validationError && (
                  <p className="text-sm text-destructive">{validationError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  El dominio donde los clientes accederán al sitio
                </p>
              </div>

              <Button 
                onClick={handleAddDomain} 
                disabled={isLoading || !inputDomain.trim()}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Agregar Dominio
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <DomainStatusCard
            domain={domainData.custom_domain}
            domainVerified={domainData.domain_verified}
            sslStatus={domainData.ssl_status}
            verificationDate={domainData.domain_verification_date}
            lastCheck={domainData.last_domain_check}
          />

          <DomainProgressStepper
            domainAdded={!!domainData.custom_domain}
            dnsConfigured={domainData.domain_verified}
            sslActive={domainData.ssl_status === 'active'}
            domainActive={domainData.domain_verified && domainData.ssl_status === 'active'}
          />

          <DNSInstructions domainVerified={domainData.domain_verified} />

          {!domainData.domain_verified && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Tu dominio aún no está activo. Por favor completa la configuración DNS siguiendo las instrucciones arriba.
              </AlertDescription>
            </Alert>
          )}

          {domainData.ssl_status === 'failed' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ❌ La verificación del dominio falló. Verifica que los registros DNS estén configurados correctamente y espera la propagación.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleVerifyDomain}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Dominio
              </Button>

              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Dominio
              </Button>
            </CardContent>
          </Card>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar dominio personalizado?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El dominio personalizado será eliminado y el cliente volverá a usar el subdominio .lovable.app
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemoveDomain}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};
