"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import AOS from "aos";

/**
 * Initialises AOS once for the classic site and re-scans the DOM after every
 * client-side navigation so newly rendered [data-aos] elements animate.
 * Animations are disabled entirely for users who prefer reduced motion.
 */
export function AosInit() {
  const pathname = usePathname();
  const ready = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      disable: reduce,
    });
    ready.current = true;
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    // Wait a frame so the new page's DOM is in place.
    const id = window.requestAnimationFrame(() => AOS.refreshHard());
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
