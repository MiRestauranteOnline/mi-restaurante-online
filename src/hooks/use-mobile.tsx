import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function computeIsMobile() {
  if (typeof window === "undefined") return false;
  const small = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const touch = (navigator as any)?.maxTouchPoints > 0 || 'ontouchstart' in window;
  return small || coarse || touch;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => computeIsMobile());

  React.useEffect(() => {
    const mqlSmall = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const mqlCoarse = window.matchMedia("(pointer: coarse)");

    const onChange = () => setIsMobile(computeIsMobile());

    mqlSmall.addEventListener("change", onChange);
    mqlCoarse.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);

    // Set once on mount
    onChange();

    return () => {
      mqlSmall.removeEventListener("change", onChange);
      mqlCoarse.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  return isMobile;
}

