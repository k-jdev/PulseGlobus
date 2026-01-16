export const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoia2pkZXZzIiwiYSI6ImNtaXV6enBocjBmaW4zZ3BmZHpxMGdiMzIifQ.KDQmmvT3fMyuzy6ZNpmnsw";

export type Theme = "light" | "dark";

export const MAP_CONFIG = {
  style: "mapbox://styles/mapbox/light-v11",
  center: [-98, 38.88] as [number, number],
  maxZoom: 20,
  minZoom: 1,
  zoom: 3,
};

export const THEME_CONFIGS = {
  light: {
    style: "mapbox://styles/mapbox/light-v11",
    water: ["interpolate", ["linear"], ["zoom"], 1, "#5dd5f5"] as any,
    land: "#f0f4ff",
    lineColor: "#4a90e2",
    roadColor: "#5ba3f5",
    borderColor: "#3d7cbd",
    fog: {
      range: [1, 10] as [number, number],
      color: "#ffffff",
      "horizon-blend": 0.01,
      "high-color": "#245cdf",
      "space-color": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        "#001D68",
        7,
        "#0048FF",
      ] as any,
      "star-intensity": 0.5,
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
    ] as any,
    land: "#0a0a0c",
    lineColor: "#2d5a7b",
    roadColor: "#1e3a5f",
    borderColor: "#3d7cbd",
    fog: {
      range: [1, 10] as [number, number],
      color: "#1a1a2e",
      "horizon-blend": 0.01,
      "high-color": "#0f3460",
      "space-color": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        "#000000",
        7,
        "#0a1a2e",
      ] as any,
      "star-intensity": 0.5,
    },
  },
};

export const STYLE_CONFIG = THEME_CONFIGS.light;

export const AIRPORT_LAYER_CONFIG = {
  id: "airport",
  source: "airports",
  sourceLayer: "ne_10m_airports",
  type: "circle" as const,
  paint: {
    "circle-color": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      "#f00",
      "#4264fb",
    ],
    "circle-radius": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      6,
      ["boolean", ["feature-state", "highlight"], false],
      6,
      4,
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
};

export const AIRPORTS_SOURCE_CONFIG = {
  type: "vector" as const,
  url: "mapbox://mapbox.04w69w5j",
  promoteId: "abbrev",
};

export const POPUP_CONFIG = {
  closeButton: false,
  closeOnClick: false,
  offset: 15,
  className: "custom-popup",
  maxWidth: "350px",
};
