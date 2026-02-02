import { useEffect, useRef, useState } from "react";
import {
  checkBrowserAI,
  classifyByKeywords,
  COUNTRY_COORDINATES,
} from "../../../store/services/browserAI";
import { MapMarker } from "../utils/marketMappers";

interface AIEnhancementResult {
  isAIAvailable: boolean;
  method: "browser-ai" | "keywords" | "none";
  enhancedMarkers: MapMarker[];
  isProcessing: boolean;
  stats: {
    total: number;
    enhanced: number;
    confidence: number;
  };
}

export function useAIEnhancedMarkers(
  markers: MapMarker[],
  options: { enabled?: boolean; enhanceCoordinates?: boolean } = {},
): AIEnhancementResult {
  const { enabled = true, enhanceCoordinates = true } = options;

  const [isAIAvailable, setIsAIAvailable] = useState(false);
  const [method, setMethod] = useState<"browser-ai" | "keywords" | "none">(
    "none",
  );
  const [enhancedMarkers, setEnhancedMarkers] = useState<MapMarker[]>(markers);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ total: 0, enhanced: 0, confidence: 0 });

  const processedIdsRef = useRef<Set<string>>(new Set());
  const aiCheckedRef = useRef(false);

  useEffect(() => {
    if (aiCheckedRef.current) return;
    aiCheckedRef.current = true;

    const checkAI = async () => {
      try {
        const status = await checkBrowserAI();
        setIsAIAvailable(status.available);
        setMethod(status.method);
      } catch (error) {
        console.warn("AI check failed:", error);
        setMethod("keywords");
      }
    };

    checkAI();
  }, []);

  useEffect(() => {
    if (!enabled || !markers.length) {
      setEnhancedMarkers(markers);
      return;
    }

    const newMarkers = markers.filter(
      (m) => !processedIdsRef.current.has(m.id),
    );

    if (newMarkers.length === 0) {
      setEnhancedMarkers((prev) => {
        const prevMap = new Map(prev.map((m) => [m.id, m]));
        return markers.map((m) => prevMap.get(m.id) || m);
      });
      return;
    }

    const enhanceMarkers = async () => {
      setIsProcessing(true);

      try {
        let enhanced = 0;
        let totalConfidence = 0;

        const processedMarkers = await Promise.all(
          newMarkers.map(async (marker) => {
            if (marker.type === "news" && marker.coordinates) {
              processedIdsRef.current.add(marker.id);
              return marker;
            }

            const text = `${marker.title} ${marker.description || ""}`;
            const classification = classifyByKeywords(text);

            if (
              enhanceCoordinates &&
              classification.confidence > 60 &&
              COUNTRY_COORDINATES[classification.country]
            ) {
              const countryCoords =
                COUNTRY_COORDINATES[classification.country].coords;

              const jitter = () => (Math.random() - 0.5) * 3;
              const newCoords: [number, number] = [
                countryCoords[0] + jitter(),
                countryCoords[1] + jitter(),
              ];

              enhanced++;
              totalConfidence += classification.confidence;
              processedIdsRef.current.add(marker.id);

              return {
                ...marker,
                coordinates: newCoords,
                category: classification.category || marker.category,
              };
            }

            processedIdsRef.current.add(marker.id);
            return marker;
          }),
        );

        setEnhancedMarkers((prev) => {
          const prevMap = new Map(prev.map((m) => [m.id, m]));
          const processedMap = new Map(
            processedMarkers.map((m: MapMarker) => [m.id, m]),
          );

          return markers.map(
            (m) => processedMap.get(m.id) || prevMap.get(m.id) || m,
          );
        });

        setStats({
          total: newMarkers.length,
          enhanced,
          confidence: enhanced > 0 ? Math.round(totalConfidence / enhanced) : 0,
        });
      } catch (error) {
        console.error("Error enhancing markers:", error);
        setEnhancedMarkers(markers);
      } finally {
        setIsProcessing(false);
      }
    };

    enhanceMarkers();
  }, [markers, enabled, enhanceCoordinates]);

  return {
    isAIAvailable,
    method,
    enhancedMarkers,
    isProcessing,
    stats,
  };
}

export { classifyByKeywords } from "../../../store/services/browserAI";

export default useAIEnhancedMarkers;
