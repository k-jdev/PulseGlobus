import { useRef, useMemo, useEffect } from "react";
import { useMapbox } from "./hooks";
import { MapContainer } from "./components";
import { useGetMarketsQuery } from "../../store/services/polymarketApi";
import { convertMarketsToMapMarkers } from "./utils/marketMappers";

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
    mapMarkers
  );

  if (onThemeChange) {
    onThemeChange(theme, changeTheme);
  }

  if (onSpinStateChange) {
    onSpinStateChange(isPaused, toggleSpin);
  }

  return (
    <MapContainer
      mapContainerRef={mapContainerRef}
      theme={theme}
      onThemeChange={changeTheme}
    />
  );
};

export default GlobusMapbox;
