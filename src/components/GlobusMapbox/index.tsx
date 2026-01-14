import { useRef, useMemo, useEffect, useState } from "react";
import { useMapbox } from "./hooks";
import { MapContainer, MarketStatsPopup } from "./components";
import { useGetMarketsQuery } from "../../store/services/polymarketApi";
import { convertMarketsToMapMarkers, MapMarker } from "./utils/marketMappers";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

interface GlobusMapboxProps {
  onThemeChange?: (theme: any, changeTheme: any) => void;
  onSpinStateChange?: (isPaused: boolean, toggleSpin: () => void) => void;
}

const GlobusMapbox = ({
  onThemeChange,
  onSpinStateChange,
}: GlobusMapboxProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMarket, setSelectedMarket] = useState<MapMarker | null>(null);

  // Получаем данные с Polymarket
  const {
    data: markets,
    isLoading,
    error,
  } = useGetMarketsQuery({ limit: 100, active: true });

  // Логируем для отладки
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

  // Конвертируем маркеты в маркеры для карты
  const mapMarkers = useMemo(() => {
    if (!markets) return [];
    const markers = convertMarketsToMapMarkers(markets);
    console.log("🎯 Converted markers:", markers.length);
    return markers;
  }, [markets]);

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
            onClose={handleClosePopup}
          />
        </div>
      )}
    </>
  );
};

export default GlobusMapbox;
