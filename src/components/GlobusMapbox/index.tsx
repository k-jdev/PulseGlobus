import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useMapbox, MarkerClickEvent } from "./hooks";
import { MapContainer, MarketStatsPopup, NewsMarker } from "./components";
import { useGetEventsWithMarketsQuery } from "../../store/services/polymarketApi";
import { useGetNewsQuery } from "../../store/services/gdeltApi";
import {
  convertEventsWithMarketsToMapMarkers,
  convertGdeltArticlesToMapMarkers,
  linkMarketsToNews,
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
  showNews?: boolean;
}

const GlobusMapbox = ({
  timeFilter = "24h",
  isMobileMenuOpen = false,
  onThemeChange,
  onSpinStateChange,
  showNews = true,
}: GlobusMapboxProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMarket, setSelectedMarket] = useState<MapMarker | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(true);

  // Close popup when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      setSelectedMarket(null);
    }
  }, [isMobileMenuOpen]);

  // Polymarket data
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useGetEventsWithMarketsQuery({
    limit: 100,
    active: true,
    order: "volume24hr",
  });

  // GDELT News data - crypto-relevant global events
  const {
    data: newsArticles,
    isLoading: isLoadingNews,
    error: newsError,
  } = useGetNewsQuery({
    query:
      "(war OR conflict OR earthquake OR election OR sanctions OR bitcoin OR crisis OR Ukraine OR Israel OR China)",
    maxrecords: 200,
    timespan: "1d",
  });

  useEffect(() => {
    console.log("📊 Polymarket Events API:", {
      isLoading: isLoadingEvents,
      error: eventsError,
      eventsCount: events?.length || 0,
    });
    if (events && events.length > 0) {
      console.log("📈 First event:", events[0]);
      console.log("📦 First event markets:", events[0].markets?.length || 0);
    }
  }, [events, isLoadingEvents, eventsError]);

  useEffect(() => {
    console.log("📰 GDELT News API:", {
      isLoading: isLoadingNews,
      error: newsError,
      articlesCount: newsArticles?.length || 0,
    });
    if (newsArticles && newsArticles.length > 0) {
      console.log("📰 First article:", newsArticles[0]);
    }
  }, [newsArticles, isLoadingNews, newsError]);

  const mapMarkers = useMemo(() => {
    const marketMarkers = events
      ? convertEventsWithMarketsToMapMarkers(events)
      : [];
    const newsMarkers =
      showNews && newsArticles
        ? convertGdeltArticlesToMapMarkers(newsArticles)
        : [];

    // Link markets to nearby news based on content matching
    let linkedMarketMarkers: MapMarker[];
    let linkedNewsMarkers: MapMarker[];

    if (showNews && newsMarkers.length > 0) {
      const linked = linkMarketsToNews(marketMarkers, newsMarkers);
      linkedMarketMarkers = linked.markets;
      linkedNewsMarkers = linked.news;
    } else {
      linkedMarketMarkers = marketMarkers;
      linkedNewsMarkers = newsMarkers;
    }

    let filteredMarkers: MapMarker[];

    switch (timeFilter) {
      case "1h":
        filteredMarkers = [
          ...linkedMarketMarkers
            .sort((a, b) => b.volume24hr - a.volume24hr)
            .slice(0, 30),
          ...linkedNewsMarkers.slice(0, 20),
        ];
        break;
      case "6h":
        filteredMarkers = [
          ...linkedMarketMarkers
            .sort((a, b) => b.volume1wk - a.volume1wk)
            .slice(0, 60),
          ...linkedNewsMarkers.slice(0, 40),
        ];
        break;
      case "24h":
      default:
        filteredMarkers = [
          ...linkedMarketMarkers.sort((a, b) => b.volume1mo - a.volume1mo),
          ...linkedNewsMarkers,
        ];
        break;
    }

    console.log(
      `🎯 Filtered markers (${timeFilter}):`,
      filteredMarkers.length,
      `(markets: ${linkedMarketMarkers.length}, news: ${linkedNewsMarkers.length})`,
    );
    return filteredMarkers;
  }, [events, newsArticles, timeFilter, showNews]);

  const handleMarkerClick = useCallback(
    ({ marker, screenPosition }: MarkerClickEvent) => {
      console.log(
        "🔍 Marker clicked:",
        marker.id,
        "type:",
        marker.type,
        "at:",
        screenPosition,
      );
      setSelectedMarket(marker);
      // Позиция попапа точно под маркером
      const popupWidth = 360;
      const left = screenPosition.x - popupWidth / 2;
      const top = screenPosition.y + 20;
      setPopupPosition({ left, top });
      setIsPopupVisible(true);
    },
    [],
  );

  const {
    theme,
    changeTheme,
    isPaused,
    toggleSpin,
    clearConnections,
    flyToLocation,
    projectCoordinates,
    mapRef,
  } = useMapbox(mapContainerRef, undefined, mapMarkers, handleMarkerClick);

  const handleClosePopup = () => {
    setSelectedMarket(null);
    setPopupPosition(null);
    clearConnections(); // Очищаем линии связей при закрытии попапа
  };

  // Обновляем позицию попапа при движении карты (только на мобильных)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedMarket) return;

    const updatePopupPosition = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile || !selectedMarket) return;

      const screenPos = projectCoordinates(selectedMarket.coordinates);
      if (screenPos) {
        const popupWidth = 360;
        const minTop = 120; // Минимальная позиция маркера (навбар + поиск)
        const left = screenPos.x - popupWidth / 2;
        const top = screenPos.y + 20;
        setPopupPosition({ left, top });

        // Проверяем видимость - скрываем если маркер вышел за границы экрана или под навбар
        const isMarkerVisible =
          screenPos.x > -popupWidth / 2 &&
          screenPos.x < window.innerWidth + popupWidth / 2 &&
          screenPos.y > minTop &&
          screenPos.y < window.innerHeight - 50;

        setIsPopupVisible(isMarkerVisible);
      }
    };

    map.on("move", updatePopupPosition);
    return () => {
      map.off("move", updatePopupPosition);
    };
  }, [selectedMarket, projectCoordinates, mapRef]);

  // Обработчик клика на новость во вкладке News - перелёт к месту на карте
  const handleNewsClick = (newsId: string, coordinates: [number, number]) => {
    console.log("📍 Flying to news location:", newsId, coordinates);
    flyToLocation(coordinates, 4);
  };

  // Get related news for selected market
  const relatedNews = useMemo(() => {
    if (
      !selectedMarket ||
      selectedMarket.type !== "market" ||
      !selectedMarket.relatedNewsIds
    ) {
      return [];
    }
    return selectedMarket.relatedNewsIds
      .map((newsId) => mapMarkers.find((m) => m.id === newsId))
      .filter(
        (news): news is MapMarker => news !== undefined && news.type === "news",
      )
      .map((news) => ({
        id: news.id,
        title: news.title,
        image: news.image,
        url: news.url,
        domain: news.domain,
        sourcecountry: news.sourcecountry,
        seendate: news.seendate,
        coordinates: news.coordinates,
      }));
  }, [selectedMarket, mapMarkers]);

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
            {selectedMarket.type === "news" ? (
              <NewsMarker
                key={selectedMarket.id}
                title={selectedMarket.title}
                image={selectedMarket.image}
                url={selectedMarket.url || selectedMarket.slug}
                domain={selectedMarket.domain}
                sourcecountry={selectedMarket.sourcecountry}
                seendate={selectedMarket.seendate}
                onClose={handleClosePopup}
              />
            ) : (
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
                relatedNews={relatedNews}
                onNewsClick={handleNewsClick}
              />
            )}
          </div>
          {/* Mobile popup - positioned near marker, doesn't block map interaction */}
          <div
            className={`md:hidden fixed z-50 pointer-events-none transition-opacity duration-150 ${isPopupVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={{
              left: popupPosition?.left ?? 16,
              top: popupPosition?.top ?? 100,
            }}
          >
            <div className="pointer-events-auto w-[360px] max-w-[calc(100vw-32px)]">
              {selectedMarket.type === "news" ? (
                <NewsMarker
                  key={`mobile-${selectedMarket.id}`}
                  title={selectedMarket.title}
                  image={selectedMarket.image}
                  url={selectedMarket.url || selectedMarket.slug}
                  domain={selectedMarket.domain}
                  sourcecountry={selectedMarket.sourcecountry}
                  seendate={selectedMarket.seendate}
                  onClose={handleClosePopup}
                  isMobile={true}
                />
              ) : (
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
                  relatedNews={relatedNews}
                  onNewsClick={handleNewsClick}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GlobusMapbox;
