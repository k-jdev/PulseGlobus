import { useRef, useMemo, useEffect, useState } from "react";
import { useMapbox } from "./hooks";
import { MapContainer, MarketStatsPopup } from "./components";
import { useGetEventsWithMarketsQuery } from "../../store/services/polymarketApi";
import {
  convertEventsWithMarketsToMapMarkers,
  MapMarker,
} from "./utils/marketMappers";
import { TimeFilter } from "../../App";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

interface GlobusMapboxProps {
  timeFilter?: TimeFilter;
  isMobileMenuOpen?: boolean;
  onThemeChange?: (theme: any, changeTheme: any) => void;
  onSpinStateChange?: (isPaused: boolean, toggleSpin: () => void) => void;
}

const GlobusMapbox = ({
  timeFilter = "24h",
  isMobileMenuOpen = false,
  onThemeChange,
  onSpinStateChange,
}: GlobusMapboxProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMarket, setSelectedMarket] = useState<MapMarker | null>(null);

  // Close popup when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      setSelectedMarket(null);
    }
  }, [isMobileMenuOpen]);

  const {
    data: events,
    isLoading,
    error,
  } = useGetEventsWithMarketsQuery({
    limit: 100,
    active: true,
    order: "volume24hr",
  });

  useEffect(() => {
    console.log("📊 Polymarket Events API:", {
      isLoading,
      error,
      eventsCount: events?.length || 0,
    });
    if (events && events.length > 0) {
      console.log("📈 First event:", events[0]);
      console.log("📦 First event markets:", events[0].markets?.length || 0);
    }
  }, [events, isLoading, error]);

  const mapMarkers = useMemo(() => {
    if (!events) return [];

    const allMarkers = convertEventsWithMarketsToMapMarkers(events);

    let filteredMarkers: MapMarker[];

    switch (timeFilter) {
      case "1h":
        filteredMarkers = [...allMarkers]
          .sort((a, b) => b.volume24hr - a.volume24hr)
          .slice(0, 30);
        break;
      case "6h":
        filteredMarkers = [...allMarkers]
          .sort((a, b) => b.volume1wk - a.volume1wk)
          .slice(0, 60);
        break;
      case "24h":
      default:
        filteredMarkers = [...allMarkers].sort(
          (a, b) => b.volume1mo - a.volume1mo
        );
        break;
    }

    console.log(`🎯 Filtered markers (${timeFilter}):`, filteredMarkers.length);
    return filteredMarkers;
  }, [events, timeFilter]);

  const { theme, changeTheme, isPaused, toggleSpin } = useMapbox(
    mapContainerRef,
    undefined,
    mapMarkers,
    (marker) => {
      setSelectedMarket(marker);
    }
  );

  const handleClosePopup = () => {
    setSelectedMarket(null);
  };

  if (onThemeChange) {
    onThemeChange(theme, changeTheme);
  }

  if (onSpinStateChange) {
    onSpinStateChange(isPaused, toggleSpin);
  }

  return (
    <>
      <MapContainer
        mapContainerRef={mapContainerRef}
        theme={theme}
        onThemeChange={changeTheme}
      />
      {selectedMarket && (
        <>
          {/* Desktop popup - right side */}
          <div className="hidden md:block fixed top-[160px] right-6 z-50">
            <MarketStatsPopup
              key={selectedMarket.id}
              title={selectedMarket.title}
              image={selectedMarket.image}
              outcomes={selectedMarket.outcomes.map((name, idx) => ({
                name,
                price: selectedMarket.outcomePrices[idx] || 0,
              }))}
              volume={selectedMarket.volume}
              volume24hr={selectedMarket.volume24hr}
              volume1wk={selectedMarket.volume1wk}
              volume1mo={selectedMarket.volume1mo}
              liquidity={selectedMarket.liquidity}
              endDate={selectedMarket.endDate}
              description={selectedMarket.description}
              slug={selectedMarket.slug}
              eventSlug={selectedMarket.eventSlug}
              onClose={handleClosePopup}
            />
          </div>
          {/* Mobile popup - centered with backdrop */}
          <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 " onClick={handleClosePopup} />
            <div className="relative z-10">
              <MarketStatsPopup
                key={`mobile-${selectedMarket.id}`}
                title={selectedMarket.title}
                image={selectedMarket.image}
                outcomes={selectedMarket.outcomes.map((name, idx) => ({
                  name,
                  price: selectedMarket.outcomePrices[idx] || 0,
                }))}
                volume={selectedMarket.volume}
                volume24hr={selectedMarket.volume24hr}
                volume1wk={selectedMarket.volume1wk}
                volume1mo={selectedMarket.volume1mo}
                liquidity={selectedMarket.liquidity}
                endDate={selectedMarket.endDate}
                description={selectedMarket.description}
                slug={selectedMarket.slug}
                eventSlug={selectedMarket.eventSlug}
                onClose={handleClosePopup}
                isMobile={true}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GlobusMapbox;
