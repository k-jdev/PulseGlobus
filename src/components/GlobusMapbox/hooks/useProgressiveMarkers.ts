import { useMemo } from "react";
import { MapMarker } from "../utils/marketMappers";

interface UseProgressiveMarkersOptions {
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
  const { enabled = true } = options;

  const stableMarkers = useMemo(() => {
    if (!enabled || !allMarkers) return [];
    return allMarkers;
  }, [allMarkers, enabled]);

  return {
    visibleMarkers: stableMarkers,
    isLoading: false,
    loadedCount: stableMarkers.length,
    totalCount: stableMarkers.length,
    progress: 100,
  };
}
