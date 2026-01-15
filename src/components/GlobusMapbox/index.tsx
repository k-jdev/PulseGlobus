import { useRef, useMemo, useEffect, useState } from "react";
import { useMapbox } from "./hooks";
import { MapContainer, MarketStatsPopup } from "./components";
import { useGetMarketsQuery } from "../../store/services/polymarketApi";
import { convertMarketsToMapMarkers, MapMarker } from "./utils/marketMappers";
import { TimeFilter } from "../../App";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

interface GlobusMapboxProps {
  timeFilter?: TimeFilter;
  onThemeChange?: (theme: any, changeTheme: any) => void;
  onSpinStateChange?: (isPaused: boolean, toggleSpin: () => void) => void;
}

const GlobusMapbox = ({
  timeFilter = "24h",
  onThemeChange,
  onSpinStateChange,
}: GlobusMapboxProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMarket, setSelectedMarket] = useState<MapMarker | null>(null);

  const {
    data: markets,
    isLoading,
    error,
  } = useGetMarketsQuery({ limit: 100, active: true });

  useEffect(() => {
    console.log("📊 Polymarket API:", {
      isLoading,
      error,
      marketsCount: markets?.length || 0,
    });
    if (markets && markets.length > 0) {
      console.log("📈 First market:", markets[0]);
    }
  }, [markets, isLoading, error]);

  const mapMarkers = useMemo(() => {
    if (!markets) return [];
    const allMarkers = convertMarketsToMapMarkers(markets);

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
  }, [markets, timeFilter]);

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
        <div className="fixed top-[160px] right-6 z-50">
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
      )}
    </>
  );
};

export default GlobusMapbox;
