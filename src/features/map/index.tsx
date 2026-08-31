import { useCallback, useEffect, useRef, useState } from "react";

import { useMapControls } from "@/lib/map/context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  globeSpinPausedChanged,
  selectActiveCategory,
  selectIsMobileMenuOpen,
  selectTimeFilter,
  themeChanged,
} from "@/store/slices/uiSlice";

import { MapContainer, MarkerConnector, MarkerDetail } from "./components";
import {
  useAIEnhancedMarkers,
  useMapbox,
  useMapMarkers,
  useMarkerRelations,
  useProgressiveMarkers,
  type MarkerClickEvent,
} from "./hooks";
import { useMobileMarkerPopup } from "./hooks/useMobileMarkerPopup";
import type { MapMarker } from "./utils/marketMappers";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

interface GlobusMapboxProps {
  showNews?: boolean;
}

const FLY_TO_ZOOM = 4;

const GlobusMapbox = ({ showNews = true }: GlobusMapboxProps) => {
  const dispatch = useAppDispatch();
  const timeFilter = useAppSelector(selectTimeFilter);
  const activeCategory = useAppSelector(selectActiveCategory);
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const { registerControls } = useMapControls();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const mapMarkers = useMapMarkers({ timeFilter, activeCategory, showNews });
  const { enhancedMarkers } = useAIEnhancedMarkers(mapMarkers, {
    enabled: true,
    enhanceCoordinates: false,
  });
  const { visibleMarkers } = useProgressiveMarkers(enhancedMarkers);
  const { relatedNews, relatedMarkets } = useMarkerRelations(
    selectedMarker,
    mapMarkers,
  );

  // The mobile anchor handler comes from a hook that itself needs the map
  // instance, so it is reached through a ref to break the dependency cycle.
  const anchorPopupRef = useRef<(position: { x: number; y: number }) => void>(
    () => {},
  );

  const handleMarkerClick = useCallback(
    ({ marker, screenPosition }: MarkerClickEvent) => {
      setSelectedMarker(marker);
      anchorPopupRef.current(screenPosition);
    },
    [],
  );

  const {
    theme,
    changeTheme,
    isPaused,
    toggleSpin,
    clearConnections,
    drawConnections,
    flyToLocation,
    projectCoordinates,
    mapRef,
  } = useMapbox(mapContainerRef, visibleMarkers, handleMarkerClick);

  const dismissMarker = useCallback(() => setSelectedMarker(null), []);

  const mobilePopup = useMobileMarkerPopup({
    selectedMarker,
    mapRef,
    projectCoordinates,
    onDismiss: dismissMarker,
  });

  useEffect(() => {
    anchorPopupRef.current = mobilePopup.anchorTo;
  }, [mobilePopup.anchorTo]);

  const handleClosePopup = useCallback(() => {
    setSelectedMarker(null);
    mobilePopup.reset();
    clearConnections();
  }, [clearConnections, mobilePopup]);

  useEffect(() => {
    if (isMobileMenuOpen) setSelectedMarker(null);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    registerControls({ changeTheme, toggleSpin });
    return () => registerControls(null);
  }, [registerControls, changeTheme, toggleSpin]);

  useEffect(() => {
    dispatch(themeChanged(theme));
  }, [dispatch, theme]);

  useEffect(() => {
    dispatch(globeSpinPausedChanged(isPaused));
  }, [dispatch, isPaused]);

  useEffect(() => {
    if (!selectedMarker) {
      clearConnections();
      return;
    }
    const linked =
      mapMarkers.find((marker) => marker.id === selectedMarker.id) ??
      selectedMarker;
    drawConnections(linked);
  }, [selectedMarker, mapMarkers, drawConnections, clearConnections]);

  const flyToMarker = useCallback(
    (_id: string, coordinates: [number, number]) => {
      flyToLocation(coordinates, FLY_TO_ZOOM);
    },
    [flyToLocation],
  );

  const selectRelatedMarket = useCallback(
    (marketId: string, coordinates: [number, number]) => {
      const market = mapMarkers.find((marker) => marker.id === marketId);
      if (!market) return;
      setSelectedMarker(market);
      flyToLocation(coordinates, FLY_TO_ZOOM);
    },
    [mapMarkers, flyToLocation],
  );

  const detailProps = selectedMarker && {
    marker: selectedMarker,
    relatedNews,
    relatedMarkets,
    onClose: handleClosePopup,
    onNewsClick: flyToMarker,
    onMarketClick: selectRelatedMarket,
  };

  return (
    <>
      <MapContainer mapContainerRef={mapContainerRef} theme={theme} />

      {detailProps && (
        <>
          <div className="hidden md:block fixed top-[160px] right-6 z-50">
            <MarkerDetail key={selectedMarker.id} {...detailProps} />
          </div>

          {mobilePopup.markerPosition && mobilePopup.popupRect && (
            <MarkerConnector
              markerPosition={mobilePopup.markerPosition}
              popup={mobilePopup.popupRect}
              isVisible={mobilePopup.isVisible}
            />
          )}

          <div
            className="md:hidden fixed z-50"
            style={{
              left: mobilePopup.popupRect?.left ?? 16,
              top: mobilePopup.popupRect?.top ?? 80,
            }}
          >
            <div
              ref={mobilePopup.popupRef}
              style={{ width: "min(360px, calc(100vw - 32px))" }}
            >
              <MarkerDetail
                key={`mobile-${selectedMarker.id}`}
                isMobile
                {...detailProps}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GlobusMapbox;
