import { useState, useEffect, useRef } from "react";
import mapboxgl, { MapboxGeoJSONFeature } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [selectedFeature, setSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>(null);

  const selectedFeatureRef = useRef<MapboxGeoJSONFeature | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2pkZXZzIiwiYSI6ImNtaXV6enBocjBmaW4zZ3BmZHpxMGdiMzIifQ.KDQmmvT3fMyuzy6ZNpmnsw";

    if (!mapContainerRef.current) return;

    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-98, 38.88],
      maxZoom: 20,
      minZoom: 1,
      zoom: 3,
    }));

    map.on("style.load", () => {
      map.setPaintProperty("background", "background-color", "#0c1a3b");

      map.setPaintProperty("water", "fill-color", "#c3c1c5");

      map.setPaintProperty("land", "background-color", "#344b8e");

      map.addSource("airports", {
        type: "vector",
        url: "mapbox://mapbox.04w69w5j",
        promoteId: "abbrev",
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

      // Clicking on a feature will highlight it and display popup
      map.addInteraction("click", {
        type: "click",
        target: { layerId: "airport" },
        handler: ({ feature }) => {
          if (selectedFeatureRef.current) {
            map.setFeatureState(selectedFeatureRef.current, {
              selected: false,
            });
          }
          if (
            feature &&
            feature.geometry &&
            feature.geometry.type === "Point"
          ) {
            map.setFeatureState(feature, { selected: true });
            setSelectedFeature(feature);

            if (popupRef.current) {
              popupRef.current.remove();
            }

            const properties = feature.properties || {};
            const popupContent = `
              <div style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                background: linear-gradient(135deg, #1a2332 0%, #0f1720 100%);
                color: #ffffff;
                padding: 20px;
                border-radius: 16px;
                min-width: 280px;
                max-width: 320px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
              ">
                <div style="
                  font-size: 18px; 
                  font-weight: 600; 
                  margin-bottom: 16px;
                  line-height: 1.4;
                ">${String(properties.name || "N/A")}</div>
                
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 16px;
                  padding: 12px;
                  background: rgba(255, 255, 255, 0.08);
                  border-radius: 8px;
                ">
                  <span style="color: #a0aec0; font-size: 13px;">Code</span>
                  <span style="font-size: 15px; font-weight: 600;">${String(
                    properties.abbrev || properties.iata_code || "N/A"
                  )}</span>
                </div>

                ${Object.entries(properties)
                  .filter(
                    ([key]) =>
                      key !== "name" && key !== "abbrev" && key !== "iata_code"
                  )
                  .slice(0, 5)
                  .map(
                    ([key, value]) => `
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      padding: 8px 0;
                      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                      font-size: 13px;
                    ">
                      <span style="color: #a0aec0;">${key}</span>
                      <span style="color: #ffffff; font-weight: 500;">${String(
                        value
                      )}</span>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            `;

            const coordinates = feature.geometry.coordinates as [
              number,
              number
            ];
            popupRef.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 15,
              className: "custom-popup",
              maxWidth: "350px",
            })
              .setLngLat(coordinates)
              .setHTML(popupContent)
              .addTo(map);

            popupRef.current.on("close", () => {
              if (selectedFeatureRef.current) {
                map.setFeatureState(selectedFeatureRef.current, {
                  selected: false,
                });
                setSelectedFeature(null);
              }
            });
          }
        },
      });

      map.addInteraction("map-click", {
        type: "click",
        handler: () => {
          if (selectedFeatureRef.current) {
            map.setFeatureState(selectedFeatureRef.current, {
              selected: false,
            });
            setSelectedFeature(null);
          }
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }
        },
      });

      // Hovering over a feature will highlight it
      map.addInteraction("mouseenter", {
        type: "mouseenter",
        target: { layerId: "airport" },
        handler: ({ feature }) => {
          if (feature) {
            map.setFeatureState(feature, { highlight: true });
            map.getCanvas().style.cursor = "pointer";
          }
        },
      });

      // Moving the mouse away from a feature will remove the highlight
      map.addInteraction("mouseleave", {
        type: "mouseleave",
        target: { layerId: "airport" },
        handler: ({ feature }) => {
          if (feature) {
            map.setFeatureState(feature, { highlight: false });
            map.getCanvas().style.cursor = "";
          }
          return false;
        },
      });
    });

    return () => map.remove();
  }, []);

  // Sync Ref with State
  useEffect(() => {
    selectedFeatureRef.current = selectedFeature;
  }, [selectedFeature]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapboxExample;
