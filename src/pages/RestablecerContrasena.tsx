import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function RestablecerContrasena() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery tokens in URL
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams((url.hash || '').replace(/^#/, ''));
    const searchParams = url.searchParams;

    const getParam = (name: string) => hashParams.get(name) || searchParams.get(name);

    const accessToken = getParam('access_token');
    const refreshToken = getParam('refresh_token');
    const token = getParam('token');
    const code = getParam('code');
    const type = getParam('type');

    console.log('[RestablecerContrasena] URL params:', { type, hasAccessToken: !!accessToken, hasToken: !!token, hasCode: !!code });

    if (type !== 'recovery') {
      console.warn('[RestablecerContrasena] No recovery type found, redirecting to auth');
      toast.error('Enlace de recuperación inválido');
      navigate('/auth');
      return;
    }

    // CASE 1: We have access_token/refresh_token (direct session restore)
    if (accessToken && refreshToken) {
      (async () => {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error('[RestablecerContrasena] setSession error:', error);
            toast.error('Error al verificar el enlace de recuperación');
            navigate('/auth');
          } else {
            console.log('[RestablecerContrasena] Session established successfully');
            setIsVerifying(false);
          }
        } catch (e) {
          console.error('[RestablecerContrasena] Failed to set session:', e);
          toast.error('Error al procesar el enlace de recuperación');
          navigate('/auth');
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      })();
    }
    // CASE 2: We have token or code (need to verify via OTP)
    else if (token || code) {
      console.log('[RestablecerContrasena] Verifying token/code...');
      (async () => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: token || code || '',
          });

          if (error) {
            console.error('[RestablecerContrasena] verifyOtp error:', error);
            toast.error('El enlace de recuperación es inválido o ha expirado');
            navigate('/auth');
          } else {
            console.log('[RestablecerContrasena] verifyOtp success:', data.session);
            toast.success('Enlace verificado. Ahora puedes establecer tu nueva contraseña.');
            setIsVerifying(false);
          }
        } catch (e) {
          console.error('[RestablecerContrasena] verifyOtp exception:', e);
          toast.error('Error al verificar el enlace');
          navigate('/auth');
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      })();
    }
    // CASE 3: type=recovery but no tokens
    else {
      console.warn('[RestablecerContrasena] type=recovery but no tokens found');
      toast.error('Enlace de recuperación incompleto');
      navigate('/auth');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('[RestablecerContrasena] updateUser error:', error);
        toast.error(error.message);
        return;
      }
      console.log('[RestablecerContrasena] Password updated successfully');
      toast.success('¡Contraseña actualizada correctamente!');
      
      // Clear form and redirect
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('[RestablecerContrasena] Exception:', error);
      toast.error('Error al actualizar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verificando enlace de recuperación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Nueva Contraseña</CardTitle>
          <CardDescription>
            Establece tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Contraseña</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 px-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Nueva Contraseña</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
