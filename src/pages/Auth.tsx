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

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);
  const navigate = useNavigate();
  
  // Get state from navigation (if redirected from signup)
  const locationState = window.history.state?.usr as { email?: string; fromSignup?: boolean } | undefined;
  const fromSignup = locationState?.fromSignup || false;
  const prefilledEmail = locationState?.email || '';

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: prefilledEmail,
      password: '',
    },
  });

  useEffect(() => {

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
      if (session) {
        redirectByRole(session);
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setTimeout(() => redirectByRole(session), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fromSignup]);

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
          <CardDescription>Panel de administración</CardDescription>
        </CardHeader>
        <CardContent>
          {fromSignup && (
            <Alert className="mb-4 bg-primary/10 border-primary">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                ¡Tu cuenta fue creada exitosamente! Por favor inicia sesión para continuar con tu registro.
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                  onClick={() => navigate('/recuperar-contrasena')}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>

              <TurnstileWidget
                ref={captchaRef}
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
        </CardContent>
      </Card>
    </div>
  );
}