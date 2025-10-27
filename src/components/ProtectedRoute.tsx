import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * SECURITY: This component enforces route-level access control.
 * CRITICAL: All authorization checks MUST be server-side via RLS and database queries.
 * Never rely on client-side state (localStorage, cookies) for access control.
 */
export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // SECURITY: Verify session with Supabase server
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth', { replace: true });
        return;
      }

      if (requireAdmin) {
        // SECURITY: Server-side role check via RLS-protected function
        // This cannot be bypassed by localStorage manipulation
        const { data: isAdmin, error } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });

        if (error || !isAdmin) {
          console.warn('Unauthorized admin access attempt');
          navigate('/client', { replace: true });
          return;
        }
      } else {
        // For non-admin routes (client dashboard), check if signup is completed
        const { data: userClient, error: clientError } = await supabase
          .from('user_clients')
          .select(`
            client_id,
            clients!inner(signup_completed)
          `)
          .eq('user_id', session.user.id)
          .single();

        if (clientError || !userClient) {
          console.warn('No client found for user, redirecting to signup');
          navigate('/registro', { replace: true });
          return;
        }

        const client = userClient.clients as any;
        
        // If signup not completed, redirect to signup flow
        if (!client.signup_completed) {
          console.warn('Signup not completed, redirecting to signup');
          navigate('/registro', { replace: true });
          return;
        }
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
    
    // SECURITY: Re-check auth on session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Unauthorized Access</div>
      </div>
    );
  }

  return <>{children}</>;
}
