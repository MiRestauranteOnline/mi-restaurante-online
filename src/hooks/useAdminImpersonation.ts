import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ImpersonationState {
  isImpersonating: boolean;
  originalAdminId: string | null;
  impersonatedClientId: string | null;
}

/**
 * SECURITY: This hook manages admin impersonation of client accounts.
 * CRITICAL: All impersonation state must be validated server-side.
 * Client-side localStorage is used ONLY for UX convenience.
 * Actual authorization is enforced via database RLS policies and server-side role checks.
 */
export const useAdminImpersonation = () => {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    originalAdminId: null,
    impersonatedClientId: null,
  });

  useEffect(() => {
    // SECURITY: Validate stored impersonation state on load
    const validateStoredImpersonation = async () => {
      const stored = localStorage.getItem('admin_impersonation');
      if (!stored) return;

      try {
        const parsedState = JSON.parse(stored);
        
        // Verify current user is actually an admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          localStorage.removeItem('admin_impersonation');
          return;
        }

        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });

        // If not admin, clear impersonation state
        if (!isAdmin) {
          localStorage.removeItem('admin_impersonation');
          setState({
            isImpersonating: false,
            originalAdminId: null,
            impersonatedClientId: null,
          });
          return;
        }

        // Valid admin - restore state
        setState(parsedState);
      } catch (error) {
        console.error('Error validating impersonation state:', error);
        localStorage.removeItem('admin_impersonation');
      }
    };

    validateStoredImpersonation();
  }, []);

  const startImpersonation = async (adminId: string, clientId: string) => {
    // SECURITY: Verify the user initiating impersonation is actually an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const { data: isAdmin, error } = await supabase.rpc('has_role', {
      _user_id: session.user.id,
      _role: 'admin'
    });

    if (error || !isAdmin) {
      throw new Error('Unauthorized: Only admins can impersonate users');
    }

    const newState = {
      isImpersonating: true,
      originalAdminId: adminId,
      impersonatedClientId: clientId,
    };
    localStorage.setItem('admin_impersonation', JSON.stringify(newState));
    setState(newState);
  };

  const endImpersonation = () => {
    localStorage.removeItem('admin_impersonation');
    setState({
      isImpersonating: false,
      originalAdminId: null,
      impersonatedClientId: null,
    });
  };

  return {
    ...state,
    startImpersonation,
    endImpersonation,
  };
};
