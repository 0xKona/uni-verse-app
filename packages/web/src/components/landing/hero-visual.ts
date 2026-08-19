import { useEffect, useState, useSyncExternalStore } from "react";

export function oklchToHex(str: string): string {
  const match = str.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!match) return "#8b5cf6";
  const L = parseFloat(match[1]);
  const C = parseFloat(match[2]);
  const H = parseFloat(match[3]) * (Math.PI / 180);
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const toSRGB = (x: number) => {
    const c = Math.max(0, Math.min(1, x));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  };
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");

  const r = toSRGB(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = toSRGB(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = toSRGB(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

export interface ThemeColors {
  primary: string;
  glow1: string;
  glow2: string;
  dark: boolean;
}

function readThemeColors(): ThemeColors {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const dark =
    root.classList.contains("dark") ||
    cs.getPropertyValue("color-scheme").trim().toLowerCase() === "dark";
  return {
    primary: oklchToHex(cs.getPropertyValue("--primary")),
    glow1: oklchToHex(cs.getPropertyValue("--cosmic-glow-1")),
    glow2: oklchToHex(cs.getPropertyValue("--cosmic-glow-2")),
    dark,
  };
}

export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState(readThemeColors);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setColors(readThemeColors());
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return colors;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}