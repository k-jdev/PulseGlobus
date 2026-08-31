import mapboxgl, { type MapboxGeoJSONFeature } from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Theme } from "@/types";

import {
  MAP_CONFIG,
  MAPBOX_ACCESS_TOKEN,
  POPUP_CONFIG,
  THEME_CONFIGS,
  type ThemeConfig,
} from "../constants/mapConfig";
import {
  createGeoJSONFromMarkers,
  type MapMarker,
} from "../utils/marketMappers";
import { createPopupContent } from "../utils/popupContent";

const MARKETS_SOURCE = "markets";
const CONNECTIONS_SOURCE = "connections";
const MOBILE_BREAKPOINT = 768;

const SECONDS_PER_REVOLUTION = 120;
const MAX_SPIN_ZOOM = 5;
const SLOW_SPIN_ZOOM = 3;
/** Below this zoom the street-level layers are hidden to keep the globe clean. */
const DETAIL_ZOOM = 8;

const DETAIL_LAYER_TOKENS = [
  "river",
  "stream",
  "canal",
  "lake",
  "road",
  "street",
  "path",
  "building",
  "landcover",
  "landuse",
  "park",
  "pitch",
  "poi",
];

const LAND_LAYER_TOKENS = [
  "land",
  "landcover",
  "landuse",
  "park",
  "pitch",
  "building",
];

const ROAD_LAYER_TOKENS = ["road", "street", "path"];
const BORDER_LAYER_TOKENS = ["admin", "boundary"];

const matchesAny = (layerId: string, tokens: string[]) =>
  tokens.some((token) => layerId.includes(token));

const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT;

const emptyFeatureCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

function setConnectionLines(
  map: mapboxgl.Map,
  lines: GeoJSON.Feature<GeoJSON.LineString>[],
) {
  const source = map.getSource(CONNECTIONS_SOURCE) as
    mapboxgl.GeoJSONSource | undefined;
  source?.setData({ type: "FeatureCollection", features: lines });
}

function buildConnectionLines(
  marker: MapMarker,
  allMarkers: MapMarker[],
): GeoJSON.Feature<GeoJSON.LineString>[] {
  const relatedIds =
    (marker.type === "market"
      ? marker.relatedNewsIds
      : marker.relatedMarketIds) ?? [];

  return relatedIds.flatMap((relatedId) => {
    const related = allMarkers.find((candidate) => candidate.id === relatedId);
    if (!related) return [];
    return [
      {
        type: "Feature" as const,
        properties: { sourceId: marker.id, targetId: relatedId },
        geometry: {
          type: "LineString" as const,
          coordinates: [marker.coordinates, related.coordinates],
        },
      },
    ];
  });
}

function applyThemeToStyle(map: mapboxgl.Map, theme: Theme) {
  const themeConfig: ThemeConfig = THEME_CONFIGS[theme];

  map.setFog(themeConfig.fog);
  map.setPaintProperty("water", "fill-color", themeConfig.water);
  map.setPaintProperty("land", "background-color", themeConfig.land);

  const labelColor = theme === "light" ? "#000000" : "#ffffff";

  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type === "fill" && matchesAny(layer.id, LAND_LAYER_TOKENS)) {
      map.setPaintProperty(layer.id, "fill-color", themeConfig.land);
    }

    if (layer.type === "line") {
      if (matchesAny(layer.id, ROAD_LAYER_TOKENS)) {
        map.setPaintProperty(layer.id, "line-color", themeConfig.roadColor);
      } else if (matchesAny(layer.id, BORDER_LAYER_TOKENS)) {
        map.setPaintProperty(layer.id, "line-color", themeConfig.borderColor);
        map.setPaintProperty(layer.id, "line-width", 0.5);
      } else if (layer.id.includes("building-outline")) {
        map.setPaintProperty(layer.id, "line-color", themeConfig.lineColor);
      }
    }

    if (layer.type === "symbol" && layer.layout?.["text-field"]) {
      map.setPaintProperty(layer.id, "text-color", labelColor);
      map.setPaintProperty(layer.id, "text-halo-width", 0);
    }
  }
}

function updateDetailLayerVisibility(map: mapboxgl.Map) {
  const visibility = map.getZoom() < DETAIL_ZOOM ? "none" : "visible";

  for (const layer of map.getStyle().layers ?? []) {
    const isLabelLayer =
      layer.type === "symbol" && layer.layout?.["text-field"];
    if (isLabelLayer) continue;
    if (matchesAny(layer.id, DETAIL_LAYER_TOKENS)) {
      map.setLayoutProperty(layer.id, "visibility", visibility);
    }
  }
}

function addMarkerLayers(map: mapboxgl.Map) {
  map.addSource(MARKETS_SOURCE, {
    type: "geojson",
    data: emptyFeatureCollection,
  });
  map.addSource(CONNECTIONS_SOURCE, {
    type: "geojson",
    data: emptyFeatureCollection,
  });

  map.addLayer({
    id: CONNECTIONS_SOURCE,
    source: CONNECTIONS_SOURCE,
    type: "line",
    paint: {
      "line-color": "#2563eb",
      "line-width": 2,
      "line-opacity": 0.6,
      "line-dasharray": [2, 2],
    },
  });

  map.addLayer({
    id: MARKETS_SOURCE,
    source: MARKETS_SOURCE,
    type: "circle",
    paint: {
      "circle-color": [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        "#f59e0b",
        ["match", ["get", "type"], "news", "#EE1616", "#2563eb"],
      ],
      "circle-radius": 6,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 1,
    },
  });
}

export interface MarkerClickEvent {
  marker: MapMarker;
  screenPosition: { x: number; y: number };
}

export const useMapbox = (
  containerRef: React.RefObject<HTMLDivElement>,
  markers?: MapMarker[],
  onMarkerClick?: (event: MarkerClickEvent) => void,
) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedFeatureIdRef = useRef<string | number | null>(null);
  const userInteractingRef = useRef(false);
  const isPausedRef = useRef(isMobileViewport());
  const markersRef = useRef<MapMarker[]>([]);
  const isPopupPinnedRef = useRef(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  const themeRef = useRef<Theme>("light");

  const [theme, setTheme] = useState<Theme>("light");
  const [isPaused, setIsPaused] = useState(isPausedRef.current);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    markersRef.current = markers ?? [];
  }, [markers]);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  const clearSelectedFeature = useCallback((map: mapboxgl.Map) => {
    if (selectedFeatureIdRef.current === null) return;
    map.setFeatureState(
      { source: MARKETS_SOURCE, id: selectedFeatureIdRef.current },
      { selected: false },
    );
    selectedFeatureIdRef.current = null;
  }, []);

  const removePopup = useCallback(() => {
    popupRef.current?.remove();
    popupRef.current = null;
  }, []);

  const highlightFeature = useCallback(
    (map: mapboxgl.Map, feature: MapboxGeoJSONFeature) => {
      map.getCanvas().style.cursor = "pointer";
      clearSelectedFeature(map);

      if (feature.id !== undefined) {
        map.setFeatureState(
          { source: MARKETS_SOURCE, id: feature.id },
          { selected: true },
        );
        selectedFeatureIdRef.current = feature.id;
      }

      removePopup();

      // On small screens the React card replaces the mapbox popup.
      if (isMobileViewport() || feature.geometry.type !== "Point") return;

      popupRef.current = new mapboxgl.Popup(POPUP_CONFIG)
        .setLngLat(feature.geometry.coordinates as [number, number])
        .setHTML(createPopupContent(feature.properties ?? {}))
        .addTo(map);
    },
    [clearSelectedFeature, removePopup],
  );

  const clearHighlight = useCallback(
    (map: mapboxgl.Map) => {
      map.getCanvas().style.cursor = "";
      clearSelectedFeature(map);
      removePopup();
    },
    [clearSelectedFeature, removePopup],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      ...MAP_CONFIG,
    });
    mapRef.current = map;

    function spinGlobe() {
      const zoom = map.getZoom();
      if (userInteractingRef.current || isPausedRef.current) return;
      if (zoom >= MAX_SPIN_ZOOM) return;

      let distancePerSecond = 360 / SECONDS_PER_REVOLUTION;
      if (zoom > SLOW_SPIN_ZOOM) {
        distancePerSecond *=
          (MAX_SPIN_ZOOM - zoom) / (MAX_SPIN_ZOOM - SLOW_SPIN_ZOOM);
      }

      const center = map.getCenter();
      center.lng -= distancePerSecond;
      map.easeTo({ center, duration: 1000, easing: (n) => n });
    }

    const releaseInteraction = () => {
      userInteractingRef.current = false;
      spinGlobe();
    };

    // Fires on the initial load and again after every setStyle(), which is why
    // sources, layers and marker data are (re)installed here rather than on
    // "load" — a theme switch replaces the whole style.
    map.on("style.load", () => {
      applyThemeToStyle(map, themeRef.current);
      addMarkerLayers(map);
      updateDetailLayerVisibility(map);

      const source = map.getSource(MARKETS_SOURCE) as
        mapboxgl.GeoJSONSource | undefined;
      source?.setData(createGeoJSONFromMarkers(markersRef.current));

      setMapLoaded(true);
    });

    map.on("load", () => {
      spinGlobe();
    });

    map.on("mouseenter", MARKETS_SOURCE, (event) => {
      if (isPopupPinnedRef.current) return;
      const feature = event.features?.[0];
      if (feature) highlightFeature(map, feature);
    });

    map.on("mouseleave", MARKETS_SOURCE, () => {
      if (isPopupPinnedRef.current) return;
      clearHighlight(map);
    });

    map.on("click", MARKETS_SOURCE, (event) => {
      const feature = event.features?.[0];
      if (!feature) return;

      removePopup();
      isPopupPinnedRef.current = true;
      highlightFeature(map, feature);

      const marker = markersRef.current.find(
        (candidate) => candidate.id === feature.properties?.id,
      );
      if (marker) {
        onMarkerClickRef.current?.({
          marker,
          screenPosition: { x: event.point.x, y: event.point.y },
        });
      }
    });

    map.on("click", (event) => {
      const hits = map.queryRenderedFeatures(event.point, {
        layers: [MARKETS_SOURCE],
      });
      if (hits.length > 0) return;

      if (isPopupPinnedRef.current) {
        isPopupPinnedRef.current = false;
        setConnectionLines(map, []);
      }
      clearHighlight(map);
      releaseInteraction();
    });

    map.on("mousedown", () => {
      userInteractingRef.current = true;
    });

    map.on("touchstart", () => {
      userInteractingRef.current = true;
      if (isMobileViewport() && !isPausedRef.current) {
        isPausedRef.current = true;
        setIsPaused(true);
      }
    });

    map.on("dragstart", () => {
      userInteractingRef.current = true;
    });

    map.on("zoomstart", () => {
      userInteractingRef.current = true;
    });

    map.on("dragend", releaseInteraction);
    map.on("pitchend", releaseInteraction);
    map.on("rotateend", releaseInteraction);

    map.on("zoomend", () => {
      updateDetailLayerVisibility(map);
      releaseInteraction();
    });

    map.on("moveend", () => {
      if (!userInteractingRef.current) spinGlobe();
    });

    return () => {
      setMapLoaded(false);
      removePopup();
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef, highlightFeature, clearHighlight, removePopup]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !markers) return;

    const source = map.getSource(MARKETS_SOURCE) as
      mapboxgl.GeoJSONSource | undefined;
    source?.setData(createGeoJSONFromMarkers(markers));
  }, [markers, mapLoaded]);

  const changeTheme = useCallback((nextTheme: Theme) => {
    const map = mapRef.current;
    if (!map || nextTheme === themeRef.current) return;

    themeRef.current = nextTheme;
    setTheme(nextTheme);
    setMapLoaded(false);
    map.setStyle(THEME_CONFIGS[nextTheme].style);
  }, []);

  const toggleSpin = useCallback(() => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);

    const map = mapRef.current;
    if (!map) return;

    if (isPausedRef.current) {
      map.stop();
      return;
    }

    if (map.getZoom() < MAX_SPIN_ZOOM) {
      const center = map.getCenter();
      center.lng -= 360 / SECONDS_PER_REVOLUTION;
      map.easeTo({ center, duration: 1000, easing: (n) => n });
    }
  }, []);

  const clearConnections = useCallback(() => {
    if (mapRef.current) setConnectionLines(mapRef.current, []);
  }, []);

  const drawConnections = useCallback((marker: MapMarker) => {
    if (!mapRef.current) return;
    setConnectionLines(
      mapRef.current,
      buildConnectionLines(marker, markersRef.current),
    );
  }, []);

  const flyToLocation = useCallback(
    (coordinates: [number, number], zoom: number = 4) => {
      mapRef.current?.flyTo({
        center: coordinates,
        zoom,
        duration: 1500,
        essential: true,
      });
    },
    [],
  );

  const projectCoordinates = useCallback(
    (coordinates: [number, number]): { x: number; y: number } | null => {
      if (!mapRef.current) return null;
      const point = mapRef.current.project(coordinates);
      return { x: point.x, y: point.y };
    },
    [],
  );

  return {
    mapRef,
    theme,
    changeTheme,
    isPaused,
    toggleSpin,
    clearConnections,
    drawConnections,
    flyToLocation,
    projectCoordinates,
  };
};
