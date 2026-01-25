import { useState, useEffect, useRef, useMemo } from "react";
import { MapMarker } from "../utils/marketMappers";

interface UseProgressiveMarkersOptions {
  initialBatchSize?: number;

  batchSize?: number;

  delayBetweenBatches?: number;
  enabled?: boolean;
}

interface UseProgressiveMarkersResult {
  visibleMarkers: MapMarker[];
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  progress: number;
}

export function useProgressiveMarkers(
  allMarkers: MapMarker[],
  options: UseProgressiveMarkersOptions = {},
): UseProgressiveMarkersResult {
  const {
    initialBatchSize = 40,
    batchSize = 30,
    delayBetweenBatches = 16,
    enabled = true,
  } = options;

  const [visibleMarkers, setVisibleMarkers] = useState<MapMarker[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0);

  const stableMarkers = useMemo(() => {
    if (!enabled || !allMarkers) return [];
    return allMarkers;
  }, [allMarkers, enabled]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (stableMarkers.length === 0) {
      setVisibleMarkers([]);
      currentIndexRef.current = 0;
      return;
    }

    const firstBatch = stableMarkers.slice(0, initialBatchSize);
    setVisibleMarkers(firstBatch);
    currentIndexRef.current = initialBatchSize;

    if (stableMarkers.length <= initialBatchSize) {
      return;
    }

    const addNextBatch = () => {
      const startIndex = currentIndexRef.current;
      if (startIndex >= stableMarkers.length) return;

      const endIndex = Math.min(startIndex + batchSize, stableMarkers.length);
      const nextBatch = stableMarkers.slice(startIndex, endIndex);

      setVisibleMarkers((prev) => [...prev, ...nextBatch]);
      currentIndexRef.current = endIndex;

      if (endIndex < stableMarkers.length) {
        timeoutRef.current = setTimeout(addNextBatch, delayBetweenBatches);
      }
    };

    timeoutRef.current = setTimeout(addNextBatch, delayBetweenBatches);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stableMarkers, initialBatchSize, batchSize, delayBetweenBatches]);

  const loadedCount = visibleMarkers.length;
  const totalCount = stableMarkers.length;
  const progress =
    totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 100;

  return {
    visibleMarkers,
    isLoading: loadedCount < totalCount,
    loadedCount,
    totalCount,
    progress,
  };
}
