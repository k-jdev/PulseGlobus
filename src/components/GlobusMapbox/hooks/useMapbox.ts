import { useEffect, useRef, useState } from "react";
import mapboxgl, { MapboxGeoJSONFeature } from "mapbox-gl";
import {
  MAPBOX_ACCESS_TOKEN,
  MAP_CONFIG,
  POPUP_CONFIG,
  THEME_CONFIGS,
  Theme,
} from "../constants/mapConfig";
import { createPopupContent } from "../utils/popupContent";

export const useMapbox = (
  containerRef: React.RefObject<HTMLDivElement>,
  onThemeChange?: (theme: Theme) => void
) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedFeatureRef = useRef<MapboxGeoJSONFeature | null>(null);
  const userInteractingRef = useRef(false);

  const [selectedFeature, setSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>(null);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    selectedFeatureRef.current = selectedFeature;
  }, [selectedFeature]);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    if (!containerRef.current) return;

    const map = (mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      ...MAP_CONFIG,
    }));

    map.on("style.load", () => {
      const themeConfig = THEME_CONFIGS[theme];
      map.setFog(themeConfig.fog as any);

      map.setPaintProperty("land", "background-color", themeConfig.land);
    });

    const secondsPerRevolution = 120;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;

    function spinGlobe() {
      const zoom = map.getZoom();
      if (!userInteractingRef.current && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    const updateLayerVisibility = () => {
      const zoom = map.getZoom();
      const minZoomForDetails = 8;

      const layers = map.getStyle().layers;
      if (layers) {
        layers.forEach((layer: any) => {
          if (
            layer.type === "symbol" &&
            layer.layout &&
            layer.layout["text-field"]
          ) {
            return;
          }

          if (zoom < minZoomForDetails) {
            if (
              layer.id.includes("river") ||
              layer.id.includes("stream") ||
              layer.id.includes("canal") ||
              layer.id.includes("lake") ||
              layer.id.includes("road") ||
              layer.id.includes("street") ||
              layer.id.includes("path") ||
              layer.id.includes("building") ||
              layer.id.includes("landcover") ||
              layer.id.includes("landuse") ||
              layer.id.includes("park") ||
              layer.id.includes("pitch") ||
              layer.id.includes("poi")
            ) {
              map.setLayoutProperty(layer.id, "visibility", "none");
            }
          } else {
            if (
              layer.id.includes("river") ||
              layer.id.includes("stream") ||
              layer.id.includes("canal") ||
              layer.id.includes("lake") ||
              layer.id.includes("road") ||
              layer.id.includes("street") ||
              layer.id.includes("path") ||
              layer.id.includes("building") ||
              layer.id.includes("landcover") ||
              layer.id.includes("landuse") ||
              layer.id.includes("park") ||
              layer.id.includes("pitch") ||
              layer.id.includes("poi")
            ) {
              map.setLayoutProperty(layer.id, "visibility", "visible");
            }
          }
        });
      }
    };

    map.on("load", () => {
      const themeConfig = THEME_CONFIGS[theme];
      map.setPaintProperty("water", "fill-color", themeConfig.water as any);
      map.setPaintProperty("land", "background-color", themeConfig.land);

      const layers = map.getStyle().layers;
      if (layers) {
        layers.forEach((layer: any) => {
          if (layer.type === "fill") {
            if (
              layer.id.includes("land") ||
              layer.id.includes("landcover") ||
              layer.id.includes("landuse") ||
              layer.id.includes("park") ||
              layer.id.includes("pitch") ||
              layer.id.includes("building")
            ) {
              map.setPaintProperty(layer.id, "fill-color", themeConfig.land);
            }
          }

          if (layer.type === "line") {
            if (
              layer.id.includes("road") ||
              layer.id.includes("street") ||
              layer.id.includes("path")
            ) {
              map.setPaintProperty(
                layer.id,
                "line-color",
                (themeConfig as any).roadColor
              );
            } else if (
              layer.id.includes("admin") ||
              layer.id.includes("boundary")
            ) {
              map.setPaintProperty(
                layer.id,
                "line-color",
                (themeConfig as any).borderColor
              );
              map.setPaintProperty(layer.id, "line-width", 0.5);
            } else if (layer.id.includes("building-outline")) {
              map.setPaintProperty(
                layer.id,
                "line-color",
                (themeConfig as any).lineColor
              );
            }
          }

          if (layer.type === "symbol") {
            if (layer.layout && layer.layout["text-field"]) {
              const textColor = theme === "light" ? "#000000" : "#ffffff";
              map.setPaintProperty(layer.id, "text-color", textColor);
              map.setPaintProperty(layer.id, "text-halo-width", 0);
            }
          }
        });
      }

      map.addSource("airports", {
        type: "vector",
        url: "mapbox://mapbox.04w69w5j",
      });

      map.addLayer({
        id: "airport",
        source: "airports",
        "source-layer": "ne_10m_airports",
        type: "circle",
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
      });

      updateLayerVisibility();

      map.on("mousemove", "airport", (e) => {
        if (e.features && e.features.length > 0) {
          handleAirportMouseEnter(map, e.features[0]);
        }
      });

      map.on("mouseleave", "airport", () => {
        handleAirportMouseLeave(map);
      });

      map.on("click", "airport", (e) => {
        if (e.features && e.features.length > 0) {
          userInteractingRef.current = true;
          handleAirportClick(map, e.features[0]);
        }
      });

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["airport"],
        });
        if (features.length === 0) {
          handleMapClick(map);
          userInteractingRef.current = false;
          spinGlobe();
        }
      });

      map.on("mousedown", () => {
        userInteractingRef.current = true;
      });

      map.on("dragstart", () => {
        userInteractingRef.current = true;
      });

      map.on("dragend", () => {
        userInteractingRef.current = true;
      });

      map.on("pitchend", () => {
        userInteractingRef.current = true;
      });

      map.on("rotateend", () => {
        userInteractingRef.current = true;
      });

      map.on("zoomend", () => {
        updateLayerVisibility();
        if (!selectedFeatureRef.current) {
          userInteractingRef.current = false;
          spinGlobe();
        }
      });

      map.on("moveend", () => {
        if (!userInteractingRef.current && !selectedFeatureRef.current) {
          spinGlobe();
        }
      });

      spinGlobe();
    });

    return () => map.remove();
  }, [containerRef, theme]);

  const changeTheme = (newTheme: Theme) => {
    const themeConfig = THEME_CONFIGS[newTheme];
    if (mapRef.current) {
      mapRef.current.setStyle(themeConfig.style);
      setTheme(newTheme);
      if (onThemeChange) {
        onThemeChange(newTheme);
      }
    }
  };

  const handleAirportClick = (
    map: mapboxgl.Map,
    feature: MapboxGeoJSONFeature | undefined
  ) => {
    if (selectedFeatureRef.current) {
      map.setFeatureState(selectedFeatureRef.current, { selected: false });
    }

    if (feature && feature.geometry && feature.geometry.type === "Point") {
      map.setFeatureState(feature, { selected: true });
      setSelectedFeature(feature);

      if (popupRef.current) {
        popupRef.current.remove();
      }

      const properties = feature.properties || {};
      const popupContent = createPopupContent(properties);
      const coordinates = feature.geometry.coordinates as [number, number];

      popupRef.current = new mapboxgl.Popup(POPUP_CONFIG as any)
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);

      popupRef.current.on("close", () => {
        if (selectedFeatureRef.current) {
          map.setFeatureState(selectedFeatureRef.current, { selected: false });
          setSelectedFeature(null);
        }
        userInteractingRef.current = false;
      });
    }
  };

  const handleMapClick = (map: mapboxgl.Map) => {
    if (selectedFeatureRef.current) {
      map.setFeatureState(selectedFeatureRef.current, { selected: false });
      setSelectedFeature(null);
    }
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  const handleAirportMouseEnter = (
    map: mapboxgl.Map,
    feature: MapboxGeoJSONFeature | undefined
  ) => {
    if (feature) {
      map.setFeatureState(feature, { highlight: true });
      map.getCanvas().style.cursor = "pointer";
    }
  };

  const handleAirportMouseLeave = (map: mapboxgl.Map) => {
    map.getCanvas().style.cursor = "";
  };

  return {
    mapRef,
    selectedFeature,
    theme,
    changeTheme,
  };
};
