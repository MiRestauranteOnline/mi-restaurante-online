import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TurnstileWidget, type TurnstileHandle } from '@/components/TurnstileWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const captchaRef = useRef<TurnstileHandle>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    if (!captchaToken) {
      toast.error('Por favor completa el CAPTCHA');
      return;
    }

    setIsLoading(true);
    console.log('[RecuperarContrasena] Sending reset email to:', email);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/restablecer-contrasena`,
        captchaToken,
      });

      if (error) {
        console.error('[RecuperarContrasena] Error:', error);
        toast.error(error.message);
        return;
      }

      console.log('[RecuperarContrasena] Success! Email sent.');
      toast.success('¡Revisa tu email! Te enviamos un enlace para restablecer tu contraseña.');
      
      // Reset form
      setEmail('');
      setCaptchaToken(null);
      
      // Navigate back after showing success
      setTimeout(() => navigate('/auth'), 2000);
    } catch (error) {
      console.error('[RecuperarContrasena] Exception:', error);
      toast.error('Error al enviar email de recuperación');
    } finally {
      setIsLoading(false);
      try { captchaRef.current?.reset(); } catch {}
      setCaptchaToken(null);
      setCooldown(60);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-center">
              <TurnstileWidget
                ref={captchaRef}
                onVerify={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/auth')}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !captchaToken || cooldown > 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : cooldown > 0 ? (
                  `Reintentar en ${cooldown}s`
                ) : (
                  'Enviar enlace'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
