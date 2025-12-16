import { useEffect, useRef, useState } from "react";
import mapboxgl, { MapboxGeoJSONFeature } from "mapbox-gl";
import {
  MAPBOX_ACCESS_TOKEN,
  MAP_CONFIG,
  STYLE_CONFIG,
  AIRPORTS_SOURCE_CONFIG,
  AIRPORT_LAYER_CONFIG,
  POPUP_CONFIG,
} from "../constants/mapConfig";
import { createPopupContent } from "../utils/popupContent";

export const useMapbox = (containerRef: React.RefObject<HTMLDivElement>) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedFeatureRef = useRef<MapboxGeoJSONFeature | null>(null);

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
      map.setPaintProperty(
        "background",
        "background-color",
        STYLE_CONFIG.background
      );
      map.setPaintProperty("water", "fill-color", STYLE_CONFIG.water as any);
      map.setPaintProperty("land", "background-color", STYLE_CONFIG.land);

      map.addSource("airports", AIRPORTS_SOURCE_CONFIG);

      map.addLayer(AIRPORT_LAYER_CONFIG as any);

      map.addInteraction("click", {
        type: "click",
        target: { layerId: "airport" },
        handler: ({ feature }) => {
          handleAirportClick(map, feature);
        },
      });

      map.addInteraction("map-click", {
        type: "click",
        handler: () => {
          handleMapClick(map);
        },
      });

      map.addInteraction("mouseenter", {
        type: "mouseenter",
        target: { layerId: "airport" },
        handler: ({ feature }) => {
          handleAirportMouseEnter(map, feature);
        },
      });

      map.addInteraction("mouseleave", {
        type: "mouseleave",
        target: { layerId: "airport" },
        handler: ({ feature }) => {
          handleAirportMouseLeave(map, feature);
        },
      });
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

  const handleAirportMouseLeave = (
    map: mapboxgl.Map,
    feature: MapboxGeoJSONFeature | undefined
  ) => {
    if (feature) {
      map.setFeatureState(feature, { highlight: false });
      map.getCanvas().style.cursor = "";
    }
  };

  return {
    mapRef,
    selectedFeature,
  };
};
