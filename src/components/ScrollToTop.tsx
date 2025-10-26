import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component - scrolls to top of page on route change
 * This ensures every page starts at the top when navigating
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
