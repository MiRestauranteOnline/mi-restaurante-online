import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TurnstileWidget } from '@/components/TurnstileWidget';
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

type AuthFormData = z.infer<typeof authSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptchaWarning, setShowCaptchaWarning] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
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

  useEffect(() => {
    // Check for recovery tokens in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      setIsRecoveryMode(true);
      // Set session with the recovery token
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      });
      // Clear the hash from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Helper: redirect based on role
    const redirectByRole = async (session: any) => {
      try {
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
  }, [navigate, isRecoveryMode]);

  const handlePasswordReset = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('¡Contraseña actualizada correctamente!');
      setIsRecoveryMode(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al actualizar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: AuthFormData) => {
    setIsLoading(true);
    
    // Check if CAPTCHA is configured and token is present
    if (!captchaToken) {
      setShowCaptchaWarning(true);
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
        options: {
          captchaToken: captchaToken,
        },
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email o contraseña incorrectos');
        } else if (error.message.includes('captcha')) {
          toast.error('Verificación de seguridad fallida. Por favor, intenta de nuevo.');
          setCaptchaToken(null); // Reset CAPTCHA
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('¡Bienvenido!');
    } catch (error) {
      toast.error('Error al iniciar sesión');
      setCaptchaToken(null); // Reset CAPTCHA on error
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
            {isRecoveryMode ? 'Establece tu nueva contraseña' : 'Panel de administración'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRecoveryMode ? (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
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

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirma tu nueva contraseña"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
            </Form>
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

                {/* CAPTCHA Widget */}
                {showCaptchaWarning && !captchaToken && (
                  <Alert variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Por favor, completa la verificación de seguridad antes de continuar.
                    </AlertDescription>
                  </Alert>
                )}
                
                <TurnstileWidget
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setShowCaptchaWarning(false);
                  }}
                  onError={() => {
                    setCaptchaToken(null);
                    toast.error('Error en la verificación de seguridad. Por favor, recarga la página.');
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                    setShowCaptchaWarning(true);
                  }}
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