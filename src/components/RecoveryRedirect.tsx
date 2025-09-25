import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Redirects recovery token flows to /auth so the Auth page can handle password reset
export const RecoveryRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash || "";
    const hasRecovery = hash.includes("type=recovery") && hash.includes("access_token=");

    if (hasRecovery && location.pathname !== "/auth") {
      // Preserve the hash (contains tokens) when navigating to /auth
      navigate(`/auth${hash}` as const, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default RecoveryRedirect;
