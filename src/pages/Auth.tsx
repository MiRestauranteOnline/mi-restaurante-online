import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { TurnstileWidget, type TurnstileHandle } from '@/components/TurnstileWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const resetSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
});

type AuthFormData = z.infer<typeof authSchema>;
type ResetFormData = z.infer<typeof resetSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [isVerifyingRecovery, setIsVerifyingRecovery] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotCaptchaToken, setForgotCaptchaToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [forgotCooldown, setForgotCooldown] = useState<number>(0);
  const loginCaptchaRef = useRef<TurnstileHandle>(null);
  const forgotCaptchaRef = useRef<TurnstileHandle>(null);
  const navigate = useNavigate();
  
  // Get state from navigation (if redirected from signup)
  const locationState = window.history.state?.usr as { email?: string; fromSignup?: boolean } | undefined;
  const fromSignup = locationState?.fromSignup || false;
  const prefilledEmail = locationState?.email || '';

  const loginForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: prefilledEmail,
      password: '',
    },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: prefilledEmail,
    },
  });

  useEffect(() => {
    if (isForgotPasswordMode) {
      setForgotEmail(prefilledEmail || '');
      setForgotCaptchaToken(null);
    }
  }, [isForgotPasswordMode, prefilledEmail]);

  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => setForgotCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  useEffect(() => {
    // Check for recovery tokens in URL hash OR search (some providers/clients keep them in ?query)
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams((url.hash || '').replace(/^#/, ''));
    const searchParams = url.searchParams;

    const getParam = (name: string) => hashParams.get(name) || searchParams.get(name);

    const accessToken = getParam('access_token');
    const refreshToken = getParam('refresh_token');
    const token = getParam('token');
    const code = getParam('code');
    const type = getParam('type');

    if (type === 'recovery') {
      setIsRecoveryMode(true);
      
      // CASE 1: We have access_token/refresh_token (direct session restore)
      if (accessToken && refreshToken) {
        (async () => {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) {
              console.error('[Auth] setSession error during recovery:', error);
              toast.error('Error al verificar el enlace de recuperación');
            } else {
              console.log('[Auth] Recovery session established successfully');
            }
          } catch (e) {
            console.error('[Auth] Failed to set session during recovery:', e);
            toast.error('Error al procesar el enlace de recuperación');
          } finally {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })();
      } 
      // CASE 2: We have token or code (need to verify via OTP)
      else if (token || code) {
        console.log('[Auth] Recovery with token/code, calling verifyOtp...');
        setIsVerifyingRecovery(true);
        
        (async () => {
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              type: 'recovery',
              token_hash: token || code || '',
            });
            
            if (error) {
              console.error('[Auth] verifyOtp error:', error);
              toast.error('El enlace de recuperación es inválido o ha expirado');
              setIsRecoveryMode(false);
            } else {
              console.log('[Auth] verifyOtp success, session established:', data.session);
              toast.success('Enlace verificado. Ahora puedes establecer tu nueva contraseña.');
            }
          } catch (e) {
            console.error('[Auth] verifyOtp exception:', e);
            toast.error('Error al verificar el enlace');
            setIsRecoveryMode(false);
          } finally {
            setIsVerifyingRecovery(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })();
      } 
      // CASE 3: type=recovery but no tokens (shouldn't happen, but handle gracefully)
      else {
        console.warn('[Auth] type=recovery but no tokens/code found in URL');
        toast.error('Enlace de recuperación incompleto');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      return;
    }

    // Helper: redirect based on role
    const redirectByRole = async (session: any) => {
      try {
        // If coming from signup, redirect back to signup flow
        if (fromSignup) {
          console.log('Redirecting back to signup flow after login');
          navigate('/registro');
          return;
        }
        
        const { data, error } = await supabase.rpc('get_user_role', { _user_id: session.user.id });
        const role = (data as string) || null;
        if (!error && role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch {
        navigate('/dashboard');
      }
    };

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !isRecoveryMode) {
        redirectByRole(session);
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && !isRecoveryMode) {
        // Avoid Supabase calls directly in the callback
        setTimeout(() => redirectByRole(session), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isRecoveryMode, fromSignup]);

  const handlePasswordReset = async () => {
    // Validate with zod to keep UX consistent
    const parsed = resetSchema.safeParse({ password: newPassword, confirmPassword: confirmNewPassword });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message || 'Datos inválidos');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('¡Contraseña actualizada correctamente!');
      setIsRecoveryMode(false);
      setNewPassword('');
      setConfirmNewPassword('');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al actualizar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    console.log('[ForgotPassword] Starting with email:', email);

    if (!email) {
      console.log('[ForgotPassword] No email provided');
      toast.error('Por favor ingresa tu email');
      return;
    }

    if (!forgotCaptchaToken) {
      toast.error('Por favor completa el CAPTCHA');
      return;
    }
    
    setIsLoading(true);
    console.log('[ForgotPassword] Calling Supabase resetPasswordForEmail...');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
        captchaToken: forgotCaptchaToken,
      });

      console.log('[ForgotPassword] Supabase response:', { error });

      if (error) {
        console.error('[ForgotPassword] Error:', error);
        toast.error(error.message);
        return;
      }

      console.log('[ForgotPassword] Success! Email sent.');
      toast.success('¡Revisa tu email! Te enviamos un enlace para restablecer tu contraseña.');
      setIsForgotPasswordMode(false);
    } catch (error) {
      console.error('[ForgotPassword] Catch block error:', error);
      toast.error('Error al enviar email de recuperación');
    } finally {
      setIsLoading(false);
      // Reset Turnstile to avoid duplicate/expired token issues and start a short cooldown
      try { forgotCaptchaRef.current?.reset(); } catch {}
      setForgotCaptchaToken(null);
      setForgotCooldown((s) => (s > 0 ? s : 60));
      console.log('[ForgotPassword] Loading finished');
    }
  };

  const handleLogin = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      if (!captchaToken) {
        toast.error('Por favor completa el CAPTCHA');
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
        options: { captchaToken },
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email o contraseña incorrectos');
        } else if (error.message.toLowerCase().includes('captcha')) {
          toast.error('Verificación CAPTCHA fallida. Intenta de nuevo.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('¡Bienvenido!');
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Mi Restaurante Online</CardTitle>
          <CardDescription>
            {isRecoveryMode ? 'Establece tu nueva contraseña' : isForgotPasswordMode ? 'Recuperar contraseña' : 'Panel de administración'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fromSignup && !isForgotPasswordMode && (
            <Alert className="mb-4 bg-primary/10 border-primary">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                ¡Tu cuenta fue creada exitosamente! Por favor inicia sesión para continuar con tu registro.
              </AlertDescription>
            </Alert>
          )}
          
          {isVerifyingRecovery ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verificando enlace de recuperación...</p>
            </div>
          ) : isForgotPasswordMode ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-center">
                <TurnstileWidget
                  ref={forgotCaptchaRef}
                  onVerify={(token) => setForgotCaptchaToken(token)}
                  onError={() => setForgotCaptchaToken(null)}
                  onExpire={() => setForgotCaptchaToken(null)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsForgotPasswordMode(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => handleForgotPassword(forgotEmail)}
                  disabled={isLoading || !forgotCaptchaToken || forgotCooldown > 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : forgotCooldown > 0 ? (
                    `Reintentar en ${forgotCooldown}s`
                  ) : (
                    'Enviar enlace'
                  )}
                </Button>
              </div>
            </div>
          ) : isRecoveryMode ? (
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Nueva Contraseña</FormLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
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
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Tu contraseña"
                            {...field}
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-primary hover:underline"
                    onClick={() => setIsForgotPasswordMode(true)}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>

                <TurnstileWidget
                  onVerify={(token) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken(null)}
                  onExpire={() => setCaptchaToken(null)}
                />

                <Button type="submit" className="w-full" disabled={isLoading || !captchaToken}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}