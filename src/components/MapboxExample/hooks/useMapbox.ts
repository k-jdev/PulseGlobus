import { useEffect, useRef, useState } from "react";
import mapboxgl, { MapboxGeoJSONFeature } from "mapbox-gl";
import {
  MAPBOX_ACCESS_TOKEN,
  MAP_CONFIG,
  STYLE_CONFIG,
  POPUP_CONFIG,
} from "../constants/mapConfig";
import { createPopupContent } from "../utils/popupContent";

export const useMapbox = (containerRef: React.RefObject<HTMLDivElement>) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedFeatureRef = useRef<MapboxGeoJSONFeature | null>(null);
  const userInteractingRef = useRef(false);

  const [selectedFeature, setSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>(null);

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
      map.setFog({
        range: [1, 10],
        color: "#ffffff",
        "horizon-blend": 0.01,
        "high-color": "#245cdf",
        "space-color": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          "#010b19",
          7,
          "#367ab9",
        ],
        "star-intensity": 0,
      });
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

    map.on("load", () => {
      map.setPaintProperty("water", "fill-color", STYLE_CONFIG.water as any);

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
  }, [containerRef]);

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
  };
};
