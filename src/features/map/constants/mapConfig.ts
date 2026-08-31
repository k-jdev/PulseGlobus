import type { Theme } from "@/types";

export const MAPBOX_ACCESS_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ??
  "pk.eyJ1Ijoia2pkZXZzIiwiYSI6ImNtaXV6enBocjBmaW4zZ3BmZHpxMGdiMzIifQ.KDQmmvT3fMyuzy6ZNpmnsw";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export const getResponsiveZoom = (): number => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < MOBILE_BREAKPOINT) return 1.7;
  if (window.innerWidth < TABLET_BREAKPOINT) return 2;
  return 3;
};

export const MAP_CONFIG = {
  style: "mapbox://styles/mapbox/light-v11",
  center: [0, 20] as [number, number],
  maxZoom: 20,
  minZoom: 1,
  zoom: getResponsiveZoom(),
  // The globe is decorative: disabling antialiasing, fades and tile refresh
  // keeps the continuous spin smooth on low-end mobile GPUs.
  antialias: false,
  fadeDuration: 0,
  preserveDrawingBuffer: false,
  trackResize: true,
  refreshExpiredTiles: false,
};

export interface ThemeConfig {
  style: string;
  water: mapboxgl.Expression;
  land: string;
  lineColor: string;
  roadColor: string;
  borderColor: string;
  fog: Record<string, unknown>;
}

export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  light: {
    style: "mapbox://styles/mapbox/light-v11",
    water: ["interpolate", ["linear"], ["zoom"], 1, "#5dd5f5"],
    land: "#f0f4ff",
    lineColor: "#4a90e2",
    roadColor: "#5ba3f5",
    borderColor: "#3d7cbd",
    fog: {
      range: [1, 10],
      color: "#ffffff",
      "horizon-blend": 0.01,
      "high-color": "#245cdf",
      "space-color": "transparent",
      "star-intensity": 0,
    },
  },
  dark: {
    style: "mapbox://styles/mapbox/dark-v11",
    water: [
      "interpolate",
      ["linear"],
      ["zoom"],
      1,
      "#1b1b1d",
      5,
      "#1b1b1d",
      10,
      "#1b1b1d",
    ],
    land: "#0a0a0c",
    lineColor: "#2d5a7b",
    roadColor: "#1e3a5f",
    borderColor: "#3d7cbd",
    fog: {
      range: [1, 10],
      color: "#1a1a2e",
      "horizon-blend": 0.01,
      "high-color": "#0f3460",
      "space-color": "transparent",
      "star-intensity": 0,
    },
  },
};

export const POPUP_CONFIG = {
  closeButton: false,
  closeOnClick: false,
  offset: 15,
  className: "custom-popup",
  maxWidth: "350px",
};
