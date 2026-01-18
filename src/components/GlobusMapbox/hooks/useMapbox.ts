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

// Функция для отрисовки линий связей между маркером и связанными элементами
function drawConnectionLines(
  map: mapboxgl.Map,
  clickedFeature: MapboxGeoJSONFeature,
  allMarkers: MapMarker[],
) {
  const properties = clickedFeature.properties;
  if (!properties) return;

  const clickedId = properties.id;
  const clickedType = properties.type;
  const geometry = clickedFeature.geometry as GeoJSON.Point;
  const clickedCoords = geometry.coordinates as [number, number];

  const lines: GeoJSON.Feature<GeoJSON.LineString>[] = [];

  // Получаем связанные ID
  let relatedIds: string[] = [];

  if (clickedType === "market") {
    // Маркет -> связанные новости
    const relatedNewsIds = properties.relatedNewsIds;
    if (relatedNewsIds) {
      try {
        relatedIds = JSON.parse(relatedNewsIds);
      } catch {
        relatedIds = [];
      }
    } else if (properties.relatedNewsId) {
      relatedIds = [properties.relatedNewsId];
    }
  } else if (clickedType === "news") {
    // Новость -> связанные маркеты
    const relatedMarketIds = properties.relatedMarketIds;
    if (relatedMarketIds) {
      try {
        relatedIds = JSON.parse(relatedMarketIds);
      } catch {
        relatedIds = [];
      }
    }
  }

  // Создаём линии к связанным маркерам
  for (const relatedId of relatedIds) {
    const relatedMarker = allMarkers.find((m) => m.id === relatedId);
    if (relatedMarker) {
      lines.push({
        type: "Feature",
        properties: {
          sourceId: clickedId,
          targetId: relatedId,
        },
        geometry: {
          type: "LineString",
          coordinates: [clickedCoords, relatedMarker.coordinates],
        },
      });
    }
  }

  const connectionsSource = map.getSource(
    "connections",
  ) as mapboxgl.GeoJSONSource;
  if (connectionsSource) {
    connectionsSource.setData({
      type: "FeatureCollection",
      features: lines,
    });
  }

  console.log(
    `🔗 Drawing ${lines.length} connection lines from ${clickedType} ${clickedId}`,
  );
}

// Функция для очистки линий связей
function clearConnectionLines(map: mapboxgl.Map) {
  const connectionsSource = map.getSource(
    "connections",
  ) as mapboxgl.GeoJSONSource;
  if (connectionsSource) {
    connectionsSource.setData({
      type: "FeatureCollection",
      features: [],
    });
  }
}

export const useMapbox = (
  containerRef: React.RefObject<HTMLDivElement>,
  onThemeChange?: (theme: Theme) => void,
  markers?: MapMarker[],
  onMarkerClick?: (marker: MapMarker) => void,
) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedFeatureRef = useRef<MapboxGeoJSONFeature | null>(null);
  const userInteractingRef = useRef(false);
  const isPausedRef = useRef(window.innerWidth < 768);
  const markersRef = useRef<MapMarker[]>([]);
  const isPopupPinnedRef = useRef(false); // Флаг закреплённого попапа
  const onMarkerClickRef = useRef<((marker: MapMarker) => void) | undefined>(
    undefined,
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
  const [isPaused, setIsPaused] = useState(() => window.innerWidth < 768);

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
        !!source,
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
                (themeConfig as any).roadColor,
              );
            } else if (
              layer.id.includes("admin") ||
              layer.id.includes("boundary")
            ) {
              map.setPaintProperty(
                layer.id,
                "line-color",
                (themeConfig as any).borderColor,
              );
              map.setPaintProperty(layer.id, "line-width", 0.5);
            } else if (layer.id.includes("building-outline")) {
              map.setPaintProperty(
                layer.id,
                "line-color",
                (themeConfig as any).lineColor,
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

      // Источник для линий связей между маркетами и новостями
      map.addSource("connections", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Слой линий связей (рисуется под маркерами)
      map.addLayer({
        id: "connections",
        source: "connections",
        type: "line",
        paint: {
          "line-color": "#2563eb", // Синий цвет для связей
          "line-width": 2,
          "line-opacity": 0.6,
          "line-dasharray": [2, 2], // Пунктирная линия
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
            ["match", ["get", "type"], "news", "#EE1616", "#2563eb"],
          ],
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 1,
        },
      });

      updateLayerVisibility();

      map.on("mouseenter", "markets", (e) => {
        // Не показываем hover попап, если уже есть закреплённый
        if (isPopupPinnedRef.current) return;

        if (e.features && e.features.length > 0) {
          handleMarketMouseEnter(map, e.features[0]);
        }
      });

      map.on("mouseleave", "markets", () => {
        // Не закрываем попап, если он закреплён кликом
        if (isPopupPinnedRef.current) return;

        handleMarketMouseLeave(map);
      });

      map.on("click", "markets", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];

          // Закрываем предыдущий попап и открываем новый
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }

          // Закрепляем попап при клике
          isPopupPinnedRef.current = true;

          // Открываем попап для нового маркера
          handleMarketMouseEnter(map, feature);

          // Рисуем линии связей
          drawConnectionLines(map, feature, markersRef.current);

          // Вызываем callback если есть
          if (onMarkerClickRef.current && markersRef.current.length > 0) {
            const marketId = feature.properties?.id;
            const marker = markersRef.current.find((m) => m.id === marketId);
            if (marker) {
              onMarkerClickRef.current(marker);
            }
          }
        }
      });

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["markets"],
        });

        // Клик вне маркера - закрываем попап и очищаем линии связей
        if (features.length === 0) {
          if (isPopupPinnedRef.current) {
            isPopupPinnedRef.current = false;
            handleMarketMouseLeave(map);
            clearConnectionLines(map); // Очищаем линии связей при клике вне маркера
          }
          handleMapClick(map);
          userInteractingRef.current = false;
          spinGlobe();
        }
      });

      map.on("mousedown", () => {
        userInteractingRef.current = true;
      });

      // Mobile: stop spinning on touch and allow interaction
      map.on("touchstart", () => {
        userInteractingRef.current = true;
        // On mobile, stop spinning when user touches the globe
        if (window.innerWidth < 768 && !isPausedRef.current) {
          setIsPaused(true);
        }
      });

      map.on("dragstart", () => {
        userInteractingRef.current = true;
      });

      map.on("dragend", () => {
        userInteractingRef.current = false;
        spinGlobe();
      });

      map.on("pitchend", () => {
        userInteractingRef.current = false;
        spinGlobe();
      });

      map.on("rotateend", () => {
        userInteractingRef.current = false;
        spinGlobe();
      });

      map.on("zoomstart", () => {
        userInteractingRef.current = true;
      });

      map.on("zoomend", () => {
        updateLayerVisibility();
        userInteractingRef.current = false;
        if (!selectedFeatureRef.current) {
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

    if (mapRef.current) {
      const map = mapRef.current;

      if (isPausedRef.current) {
        // Мгновенно останавливаем анимацию
        map.stop();
      } else {
        // Если снимаем паузу, запускаем вращение
        const zoom = map.getZoom();
        if (zoom < 5) {
          const center = map.getCenter();
          const distancePerSecond = 360 / 120;
          center.lng -= distancePerSecond;
          map.easeTo({ center, duration: 1000, easing: (n) => n });
        }
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
        { selected: false },
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
    feature: MapboxGeoJSONFeature | undefined,
  ) => {
    if (feature) {
      map.getCanvas().style.cursor = "pointer";

      if (
        selectedFeatureRef.current &&
        selectedFeatureRef.current.id !== undefined
      ) {
        map.setFeatureState(
          { source: "markets", id: selectedFeatureRef.current.id } as any,
          { selected: false },
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

      // Не показываем попап на мобильных устройствах (ширина < 768px)
      const isMobile = window.innerWidth < 768;
      if (isMobile) return;

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
        { selected: false },
      );
      setSelectedFeature(null);
    }

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  // Функция для очистки линий связей извне (вызывается при закрытии попапа)
  const clearConnections = () => {
    if (mapRef.current) {
      clearConnectionLines(mapRef.current);
    }
  };

  // Функция для перелёта к определённым координатам
  const flyToLocation = (coordinates: [number, number], zoom: number = 4) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: coordinates,
        zoom: zoom,
        duration: 1500,
        essential: true,
      });
    }
  };

  return {
    mapRef,
    selectedFeature,
    theme,
    changeTheme,
    isPaused,
    toggleSpin,
    clearConnections,
    flyToLocation,
  };
};
