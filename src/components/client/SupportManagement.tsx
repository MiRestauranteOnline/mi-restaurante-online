import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, MessageCircle, Phone, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { businessData } from '@/config/businessData';

interface SupportManagementProps {
  clientId: string;
  client: any;
}

interface PremiumFeatures {
  unique_support_pin?: string;
}

export function SupportManagement({ clientId, client }: SupportManagementProps) {
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPremiumFeatures();
  }, [clientId]);

  const fetchPremiumFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_features')
        .select('unique_support_pin')
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching premium features:', error);
        setPremiumFeatures(null);
      } else {
        setPremiumFeatures(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setPremiumFeatures(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "PIN copiado al portapapeles",
    });
  };

  const isAdvancedPlan = client?.plan_type === 'advanced';

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Soporte</h1>
        <Badge variant={isAdvancedPlan ? "default" : "secondary"}>
          Plan {isAdvancedPlan ? 'Avanzado' : 'Básico'}
        </Badge>
      </div>

      {isAdvancedPlan ? (
        <div className="space-y-6">
          {/* Premium Support Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Soporte Premium Activado
              </CardTitle>
              <CardDescription>
                Como cliente del plan avanzado, tienes acceso a soporte prioritario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {premiumFeatures?.unique_support_pin && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Tu PIN único de soporte:</h3>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-3 py-2 rounded text-lg font-mono border">
                      {premiumFeatures.unique_support_pin}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(premiumFeatures.unique_support_pin!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Usa este PIN junto con tu email ({client?.email}) para acceder a soporte premium
                  </p>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Email registrado:</h3>
                <p className="font-mono">{client?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este email te ayuda a obtener soporte más rápido
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Options */}
          <Card>
            <CardHeader>
              <CardTitle>Contacta nuestro soporte</CardTitle>
              <CardDescription>
                Elige tu método preferido para obtener ayuda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  const supportMessage = `Hola, soy cliente del plan avanzado de soporte para ${client?.restaurant_name || 'mi restaurante'}. Mi email es: ${client?.email}. Mi PIN único es: ${premiumFeatures?.unique_support_pin}.`;
                  const whatsappUrl = `${businessData.contact.whatsapp.url}?text=${encodeURIComponent(supportMessage)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp - Soporte Premium
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/soporte')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Soporte Rápido - Formulario
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Básico - Soporte Incluido</CardTitle>
              <CardDescription>
                Tu plan incluye soporte estándar por email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Soporte por email</p>
                    <p className="text-sm text-muted-foreground">Respuesta en 24-48 horas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Soporte prioritario por WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Disponible en plan avanzado</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => navigate('/soporte')}
                  className="w-full"
                >
                  Contactar Soporte
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">¿Necesitas soporte premium?</CardTitle>
              <CardDescription>
                Actualiza a nuestro plan avanzado para obtener:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Soporte prioritario por WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">PIN único para identificación rápida</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Respuesta en menos de 24 horas</span>
                </li>
              </ul>
              
              <Button className="w-full mt-4">
                Actualizar a Plan Avanzado
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}