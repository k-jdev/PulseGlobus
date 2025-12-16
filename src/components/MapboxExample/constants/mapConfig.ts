export const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoia2pkZXZzIiwiYSI6ImNtaXV6enBocjBmaW4zZ3BmZHpxMGdiMzIifQ.KDQmmvT3fMyuzy6ZNpmnsw";

export const MAP_CONFIG = {
  style: "mapbox://styles/mapbox/light-v11",
  center: [-98, 38.88] as [number, number],
  maxZoom: 20,
  minZoom: 1,
  zoom: 3,
};

export const STYLE_CONFIG = {
  background: "#000000",
  water: [
    "interpolate",
    ["linear"],
    ["zoom"],
    1,
    "#5dd5f5",
    5,
    "#8de5f7",
    10,
    "#ffffff",
  ],
  land: "#ffffff",
};

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
