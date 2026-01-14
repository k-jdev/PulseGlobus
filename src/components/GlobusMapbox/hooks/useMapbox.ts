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
import { MapMarker, createGeoJSONFromMarkers } from "../utils/marketMappers";

export const useMapbox = (
  containerRef: React.RefObject<HTMLDivElement>,
  onThemeChange?: (theme: Theme) => void,
  markers?: MapMarker[],
  onMarkerClick?: (marker: MapMarker) => void
) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedFeatureRef = useRef<MapboxGeoJSONFeature | null>(null);
  const userInteractingRef = useRef(false);
  const isPausedRef = useRef(false);
  const markersRef = useRef<MapMarker[]>([]);
  const onMarkerClickRef = useRef<((marker: MapMarker) => void) | undefined>(
    undefined
  );

  // Обновляем refs при изменении props
  useEffect(() => {
    markersRef.current = markers || [];
  }, [markers]);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  const [selectedFeature, setSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    selectedFeatureRef.current = selectedFeature;
  }, [selectedFeature]);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Обновляем маркеры на карте когда приходят новые данные
  useEffect(() => {
    if (mapRef.current && mapLoaded && markers && markers.length > 0) {
      const map = mapRef.current;
      const source = map.getSource("markets") as mapboxgl.GeoJSONSource;

      console.log(
        "📍 Updating markers:",
        markers.length,
        "source exists:",
        !!source
      );

      if (source) {
        const geojson = createGeoJSONFromMarkers(markers);
        console.log("🗺️ GeoJSON features:", geojson.features.length);
        source.setData(geojson);
      }
    }
  }, [markers, mapLoaded]);

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
      if (
        !userInteractingRef.current &&
        !isPausedRef.current &&
        zoom < maxSpinZoom
      ) {
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

      map.addSource("markets", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "markets",
        source: "markets",
        type: "circle",
        paint: {
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#f59e0b",
            "#2563eb",
          ],
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 1,
        },
      });

      updateLayerVisibility();

      map.on("mouseenter", "markets", (e) => {
        if (e.features && e.features.length > 0) {
          handleMarketMouseEnter(map, e.features[0]);
        }
      });

      map.on("mouseleave", "markets", () => {
        handleMarketMouseLeave(map);
      });

      map.on("click", "markets", (e) => {
        if (
          e.features &&
          e.features.length > 0 &&
          onMarkerClickRef.current &&
          markersRef.current.length > 0
        ) {
          const feature = e.features[0];
          const marketId = feature.properties?.id;
          const marker = markersRef.current.find((m) => m.id === marketId);

          if (marker) {
            // Закрываем hover попап
            handleMarketMouseLeave(map);

            onMarkerClickRef.current(marker);
          }
        }
      });

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["markets"],
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

      // Карта загружена, можно обновлять маркеры
      setMapLoaded(true);
      console.log("🗺️ Map loaded, ready for markers");
    });

    return () => {
      setMapLoaded(false);
      map.remove();
    };
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

  const toggleSpin = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);

    // Если снимаем паузу, запускаем вращение
    if (!isPausedRef.current && mapRef.current) {
      const map = mapRef.current;
      const zoom = map.getZoom();
      if (zoom < 5) {
        const center = map.getCenter();
        const distancePerSecond = 360 / 120;
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }
  };

  // const handleMarketClick = (
  //   map: mapboxgl.Map,
  //   feature: MapboxGeoJSONFeature | undefined
  // ) => {
  //   if (
  //     selectedFeatureRef.current &&
  //     selectedFeatureRef.current.id !== undefined
  //   ) {
  //     map.setFeatureState(
  //       { source: "markets", id: selectedFeatureRef.current.id } as any,
  //       { selected: false }
  //     );
  //   }

  //   if (feature && feature.geometry && feature.geometry.type === "Point") {
  //     if (feature.id !== undefined) {
  //       map.setFeatureState({ source: "markets", id: feature.id } as any, {
  //         selected: true,
  //       });
  //     }
  //     setSelectedFeature(feature);

  //     if (popupRef.current) {
  //       popupRef.current.remove();
  //     }

  //     const properties = feature.properties || {};
  //     const popupContent = createPopupContent(properties);
  //     const coordinates = feature.geometry.coordinates as [number, number];

  //     popupRef.current = new mapboxgl.Popup(POPUP_CONFIG as any)
  //       .setLngLat(coordinates)
  //       .setHTML(popupContent)
  //       .addTo(map);

  //     popupRef.current.on("close", () => {
  //       if (
  //         selectedFeatureRef.current &&
  //         selectedFeatureRef.current.id !== undefined
  //       ) {
  //         map.setFeatureState(
  //           { source: "markets", id: selectedFeatureRef.current.id } as any,
  //           { selected: false }
  //         );
  //         setSelectedFeature(null);
  //       }
  //       userInteractingRef.current = false;
  //     });
  //   }
  // };

  const handleMapClick = (map: mapboxgl.Map) => {
    if (
      selectedFeatureRef.current &&
      selectedFeatureRef.current.id !== undefined
    ) {
      map.setFeatureState(
        { source: "markets", id: selectedFeatureRef.current.id } as any,
        { selected: false }
      );
      setSelectedFeature(null);
    }
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  const handleMarketMouseEnter = (
    map: mapboxgl.Map,
    feature: MapboxGeoJSONFeature | undefined
  ) => {
    if (feature) {
      map.getCanvas().style.cursor = "pointer";

      if (
        selectedFeatureRef.current &&
        selectedFeatureRef.current.id !== undefined
      ) {
        map.setFeatureState(
          { source: "markets", id: selectedFeatureRef.current.id } as any,
          { selected: false }
        );
      }

      if (feature.id !== undefined) {
        map.setFeatureState({ source: "markets", id: feature.id } as any, {
          selected: true,
        });
      }
      setSelectedFeature(feature);

      if (popupRef.current) {
        popupRef.current.remove();
      }

      if (feature.geometry && feature.geometry.type === "Point") {
        const properties = feature.properties || {};
        const popupContent = createPopupContent(properties);
        const coordinates = feature.geometry.coordinates as [number, number];

        popupRef.current = new mapboxgl.Popup({
          ...POPUP_CONFIG,
          closeButton: false,
          closeOnClick: false,
        } as any)
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map);
      }
    }
  };

  const handleMarketMouseLeave = (map: mapboxgl.Map) => {
    map.getCanvas().style.cursor = "";

    if (
      selectedFeatureRef.current &&
      selectedFeatureRef.current.id !== undefined
    ) {
      map.setFeatureState(
        { source: "markets", id: selectedFeatureRef.current.id } as any,
        { selected: false }
      );
      setSelectedFeature(null);
    }

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  return {
    mapRef,
    selectedFeature,
    theme,
    changeTheme,
    isPaused,
    toggleSpin,
  };
};
