import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTopOnMount - Handles scroll behavior on route changes
 * - If there's a hash (e.g., /#DiscoverSection), scroll to that section
 * - Otherwise, scroll to top of page
 */
const ScrollToTopOnMount = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Hash navigation (e.g., /#DiscoverSection)
      // Wait a bit for the page to render, then scroll to section
      setTimeout(() => {
        const sectionId = hash.replace("#", "");
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // Normal page navigation - scroll to top
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTopOnMount;
