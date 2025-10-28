import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Redirects recovery token flows to /auth so the Auth page can handle password reset
export const RecoveryRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hasRecovery = (s: string) => s.includes('type=recovery') && (s.includes('access_token=') || s.includes('refresh_token=') || s.includes('code='));

    if ((hasRecovery(hash) || hasRecovery(search)) && location.pathname !== '/auth') {
      // Preserve tokens whether they came via #hash or ?search
      const suffix = hash || search;
      navigate(`/auth${suffix}` as const, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default RecoveryRedirect;
