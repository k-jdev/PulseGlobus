import type { Map as MapboxMap } from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";

import type { MapMarker } from "../utils/marketMappers";

const MOBILE_BREAKPOINT = 768;
const POPUP_TOP_PADDING = 180;
const DEFAULT_POPUP_SIZE = { width: 360, height: 300 };
/** Distance past the viewport edge at which the popup is dismissed entirely. */
const DISMISS_MARGIN = 150;
const VISIBILITY_MARGIN = 50;

export const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT;

interface Point {
  x: number;
  y: number;
}

interface UseMobileMarkerPopupOptions {
  selectedMarker: MapMarker | null;
  mapRef: React.RefObject<MapboxMap | null>;
  projectCoordinates: (coordinates: [number, number]) => Point | null;
  onDismiss: () => void;
}

/**
 * Positions the mobile marker card and keeps the marker anchor in sync while
 * the globe moves. Desktop uses a static slot and does not need any of this.
 */
export function useMobileMarkerPopup({
  selectedMarker,
  mapRef,
  projectCoordinates,
  onDismiss,
}: UseMobileMarkerPopupOptions) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupOrigin, setPopupOrigin] = useState<Point | null>(null);
  const [popupSize, setPopupSize] = useState(DEFAULT_POPUP_SIZE);
  const [markerPosition, setMarkerPosition] = useState<Point | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const reset = useCallback(() => {
    setPopupOrigin(null);
    setMarkerPosition(null);
  }, []);

  const anchorTo = useCallback((screenPosition: Point) => {
    if (isMobileViewport()) {
      setMarkerPosition(screenPosition);
    }
    setIsVisible(true);
  }, []);

  // Centre the card once its rendered size is known.
  useEffect(() => {
    const popup = popupRef.current;
    if (!isMobileViewport() || !selectedMarker || !popup) return;

    const { width, height } = popup.getBoundingClientRect();
    setPopupSize({ width, height });
    setPopupOrigin({
      x: (window.innerWidth - width) / 2,
      y: POPUP_TOP_PADDING,
    });
  }, [selectedMarker]);

  useEffect(() => {
    const popup = popupRef.current;
    if (!isMobileViewport() || !popup) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setPopupSize({ width, height });
      }
    });
    observer.observe(popup);
    return () => observer.disconnect();
  }, [selectedMarker]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedMarker || !isMobileViewport()) return;

    const syncAnchor = () => {
      const position = projectCoordinates(selectedMarker.coordinates);
      if (!position) return;

      setMarkerPosition(position);
      setIsVisible(
        position.x > -VISIBILITY_MARGIN &&
          position.x < window.innerWidth + VISIBILITY_MARGIN &&
          position.y > VISIBILITY_MARGIN &&
          position.y < window.innerHeight - VISIBILITY_MARGIN,
      );

      const isOffScreen =
        position.x < -DISMISS_MARGIN ||
        position.x > window.innerWidth + DISMISS_MARGIN ||
        position.y < -DISMISS_MARGIN ||
        position.y > window.innerHeight + DISMISS_MARGIN;

      if (isOffScreen) {
        reset();
        onDismiss();
      }
    };

    map.on("move", syncAnchor);
    return () => {
      map.off("move", syncAnchor);
    };
  }, [selectedMarker, projectCoordinates, mapRef, onDismiss, reset]);

  const popupRect = popupOrigin
    ? {
        left: popupOrigin.x,
        top: popupOrigin.y,
        width: popupSize.width,
        height: popupSize.height,
      }
    : null;

  return { popupRef, popupRect, markerPosition, isVisible, anchorTo, reset };
}
