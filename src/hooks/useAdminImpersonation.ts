import { useState, useEffect } from 'react';

interface ImpersonationState {
  isImpersonating: boolean;
  originalAdminId: string | null;
  impersonatedClientId: string | null;
}

export const useAdminImpersonation = () => {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    originalAdminId: null,
    impersonatedClientId: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem('admin_impersonation');
    if (stored) {
      setState(JSON.parse(stored));
    }
  }, []);

  const startImpersonation = (adminId: string, clientId: string) => {
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
