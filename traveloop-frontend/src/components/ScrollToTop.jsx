import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop
 * Globally resets window scroll position to (0, 0) upon route changes (PUSH/REPLACE),
 * while preserving natural browser back/forward history scrolling (POP).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, navType]);

  return null;
}
