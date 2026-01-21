import { useState, useEffect, useRef, useMemo } from "react";
import { MapMarker } from "../utils/marketMappers";

interface UseProgressiveMarkersOptions {
  /** Количество маркеров в первом батче (показывается сразу) */
  initialBatchSize?: number;
  /** Количество маркеров в последующих батчах */
  batchSize?: number;
  /** Задержка между батчами в мс */
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

/**
 * Хук для плавной постепенной загрузки маркеров
 * Первый батч показывается сразу, остальные добавляются быстро
 */
export function useProgressiveMarkers(
  allMarkers: MapMarker[],
  options: UseProgressiveMarkersOptions = {},
): UseProgressiveMarkersResult {
  const {
    initialBatchSize = 40, // Сразу показываем 40 маркеров
    batchSize = 30, // Потом по 30
    delayBetweenBatches = 16, // ~60fps - незаметно для глаза
    enabled = true,
  } = options;

  const [visibleMarkers, setVisibleMarkers] = useState<MapMarker[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0);

  // Стабильная ссылка на маркеры
  const stableMarkers = useMemo(() => {
    if (!enabled || !allMarkers) return [];
    return allMarkers;
  }, [allMarkers, enabled]);

  useEffect(() => {
    // Очищаем таймеры
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (stableMarkers.length === 0) {
      setVisibleMarkers([]);
      currentIndexRef.current = 0;
      return;
    }

    // Сразу показываем первый батч
    const firstBatch = stableMarkers.slice(0, initialBatchSize);
    setVisibleMarkers(firstBatch);
    currentIndexRef.current = initialBatchSize;

    // Если маркеров меньше первого батча - готово
    if (stableMarkers.length <= initialBatchSize) {
      return;
    }

    // Добавляем остальные маркеры постепенно
    const addNextBatch = () => {
      const startIndex = currentIndexRef.current;
      if (startIndex >= stableMarkers.length) return;

      const endIndex = Math.min(startIndex + batchSize, stableMarkers.length);
      const nextBatch = stableMarkers.slice(startIndex, endIndex);

      setVisibleMarkers((prev) => [...prev, ...nextBatch]);
      currentIndexRef.current = endIndex;

      // Продолжаем если есть ещё
      if (endIndex < stableMarkers.length) {
        timeoutRef.current = setTimeout(addNextBatch, delayBetweenBatches);
      }
    };

    // Запускаем добавление с небольшой задержкой
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
