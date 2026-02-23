import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import {
  useMapbox,
  MarkerClickEvent,
  useProgressiveMarkers,
  useAIEnhancedMarkers,
} from "./hooks";
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
import type { Category } from "@/components/SubNavigation";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

interface GlobusMapboxProps {
  timeFilter?: TimeFilter;
  activeCategory?: Category;
  isMobileMenuOpen?: boolean;
  onThemeChange?: (theme: any, changeTheme: any) => void;
  onSpinStateChange?: (isPaused: boolean, toggleSpin: () => void) => void;
  showNews?: boolean;
}

const GlobusMapbox = ({
  timeFilter = "24h",
  activeCategory = "All Markets",
  isMobileMenuOpen = false,
  onThemeChange,
  onSpinStateChange,
  showNews = true,
}: GlobusMapboxProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mobilePopupRef = useRef<HTMLDivElement>(null);
  const [selectedMarket, setSelectedMarket] = useState<MapMarker | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(true);

  const [markerScreenPosition, setMarkerScreenPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [popupSize, setPopupSize] = useState<{ width: number; height: number }>(
    { width: 360, height: 300 },
  );

  useEffect(() => {
    if (isMobileMenuOpen) {
      setSelectedMarket(null);
    }
  }, [isMobileMenuOpen]);

  const { data: events } = useGetEventsWithMarketsQuery({
    limit: 80,
    active: true,
    order: "volume24hr",
  });

  const { data: newsArticles } = useGetNewsQuery({
    query:
      "(Trump OR Biden OR Ukraine OR Russia OR Israel OR Gaza OR China OR Bitcoin OR inflation)",
    maxrecords: 120,
    timespan: "1d",
  });

  const mapMarkers = useMemo(() => {
    const marketMarkers = events
      ? convertEventsWithMarketsToMapMarkers(events)
      : [];
    const newsMarkers =
      showNews && newsArticles
        ? convertGdeltArticlesToMapMarkers(newsArticles)
        : [];

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
            .slice(0, 25),
          ...linkedNewsMarkers.slice(0, 15),
        ];
        break;
      case "6h":
        filteredMarkers = [
          ...linkedMarketMarkers
            .sort((a, b) => b.volume1wk - a.volume1wk)
            .slice(0, 50),
          ...linkedNewsMarkers.slice(0, 30),
        ];
        break;
      case "24h":
      default:
        filteredMarkers = [
          ...linkedMarketMarkers
            .sort((a, b) => b.volume1mo - a.volume1mo)
            .slice(0, 80),
          ...linkedNewsMarkers.slice(0, 100),
        ];
        break;
    }

    // Filter by category
    if (activeCategory !== "All Markets") {
      const categoryLower = activeCategory.toLowerCase();
      filteredMarkers = filteredMarkers.filter((marker) => {
        if (marker.type === "news") return true; // always show news
        return (
          marker.category?.toLowerCase() === categoryLower ||
          marker.category?.toLowerCase().includes(categoryLower)
        );
      });
    }

    return filteredMarkers;
  }, [events, newsArticles, timeFilter, showNews, activeCategory]);

  const { enhancedMarkers } = useAIEnhancedMarkers(mapMarkers, {
    enabled: true,
    enhanceCoordinates: false,
  });

  const { visibleMarkers } = useProgressiveMarkers(enhancedMarkers);

  const handleMarkerClick = useCallback(
    ({ marker, screenPosition }: MarkerClickEvent) => {
      setSelectedMarket(marker);

      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        setPopupPosition({ left: 16, top: 100 });

        setMarkerScreenPosition({ x: screenPosition.x, y: screenPosition.y });
      } else {
        const popupWidth = 360;
        const left = screenPosition.x - popupWidth / 2;
        const top = screenPosition.y + 20;
        setPopupPosition({ left, top });
      }
      setIsPopupVisible(true);
    },
    [],
  );

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile || !selectedMarket || !mobilePopupRef.current) return;

    const popup = mobilePopupRef.current;
    const rect = popup.getBoundingClientRect();
    const popupWidth = rect.width;
    const popupHeight = rect.height;

    setPopupSize({ width: popupWidth, height: popupHeight });

    const centerX = (window.innerWidth - popupWidth) / 2;
    const topPadding = 180;
    const centerY = topPadding;

    setPopupPosition({ left: centerX, top: centerY });
  }, [selectedMarket]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile || !mobilePopupRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setPopupSize({ width, height });
        }
      }
    });

    resizeObserver.observe(mobilePopupRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedMarket]);

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
  } = useMapbox(mapContainerRef, undefined, visibleMarkers, handleMarkerClick);

  const handleClosePopup = () => {
    setSelectedMarket(null);
    setPopupPosition(null);
    setMarkerScreenPosition(null);
    clearConnections();
  };

  useEffect(() => {
    if (selectedMarket) {
      const markerWithRelations =
        mapMarkers.find((m) => m.id === selectedMarket.id) || selectedMarket;
      drawConnections(markerWithRelations);
    } else {
      clearConnections();
    }
  }, [selectedMarket, mapMarkers, drawConnections, clearConnections]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedMarket) return;

    const updateMarkerPosition = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile || !selectedMarket) return;

      const screenPos = projectCoordinates(selectedMarket.coordinates);
      if (screenPos) {
        setMarkerScreenPosition({ x: screenPos.x, y: screenPos.y });

        const isMarkerVisible =
          screenPos.x > -50 &&
          screenPos.x < window.innerWidth + 50 &&
          screenPos.y > 50 &&
          screenPos.y < window.innerHeight - 50;

        setIsPopupVisible(isMarkerVisible);

        const isTooFarAway =
          screenPos.x < -150 ||
          screenPos.x > window.innerWidth + 150 ||
          screenPos.y < -150 ||
          screenPos.y > window.innerHeight + 150;

        if (isTooFarAway) {
          setSelectedMarket(null);
          setPopupPosition(null);
          setMarkerScreenPosition(null);
        }
      }
    };

    map.on("move", updateMarkerPosition);
    return () => {
      map.off("move", updateMarkerPosition);
    };
  }, [selectedMarket, projectCoordinates, mapRef]);

  const handleNewsClick = (_newsId: string, coordinates: [number, number]) => {
    flyToLocation(coordinates, 4);
  };

  const handleMarketClick = (
    marketId: string,
    coordinates: [number, number],
  ) => {
    const market = mapMarkers.find((m) => m.id === marketId);
    if (market) {
      setSelectedMarket(market);
      flyToLocation(coordinates, 4);
    }
  };

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

  const relatedMarkets = useMemo(() => {
    if (!selectedMarket || selectedMarket.type !== "news") {
      return [];
    }

    const newsInMapMarkers = mapMarkers.find((m) => m.id === selectedMarket.id);
    const relatedMarketIds =
      newsInMapMarkers?.relatedMarketIds || selectedMarket.relatedMarketIds;

    if (!relatedMarketIds || relatedMarketIds.length === 0) {
      return [];
    }

    return relatedMarketIds
      .map((marketId) => mapMarkers.find((m) => m.id === marketId))
      .filter(
        (market): market is MapMarker =>
          market !== undefined && market.type === "market",
      )
      .map((market) => ({
        id: market.id,
        title: market.title,
        image: market.image,
        slug: market.slug,
        eventSlug: market.eventSlug,
        outcomePrices: market.outcomePrices,
        outcomes: market.outcomes,
        coordinates: market.coordinates,
      }));
  }, [selectedMarket, mapMarkers]);

  // Notify parent about theme and spin handlers when they change
  useEffect(() => {
    if (onThemeChange) {
      onThemeChange(theme, changeTheme);
    }
    // only trigger when theme or changeTheme reference changes
  }, [onThemeChange, theme, changeTheme]);

  useEffect(() => {
    if (onSpinStateChange) {
      onSpinStateChange(isPaused, toggleSpin);
    }
  }, [onSpinStateChange, isPaused, toggleSpin]);

  return (
    <>
      <MapContainer
        mapContainerRef={mapContainerRef}
        theme={theme}
        onThemeChange={changeTheme}
      />

      {selectedMarket && (
        <>
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
                relatedMarkets={relatedMarkets}
                onMarketClick={handleMarketClick}
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
          {markerScreenPosition && popupPosition && (
            <svg
              className="md:hidden fixed inset-0 w-full h-full pointer-events-none z-10"
              style={{ overflow: "visible", clipPath: "inset(144px 0 0 0)" }}
            >
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1452f0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1452f0" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {(() => {
                const popupWidth = popupSize.width;
                const popupHeight = popupSize.height;
                const popupLeft = popupPosition.left ?? 16;
                const popupTop = popupPosition.top ?? 100;

                const popupCenterX = popupLeft + popupWidth / 2;
                const popupCenterY = popupTop + popupHeight / 2;

                const markerX = markerScreenPosition.x;
                const markerY = markerScreenPosition.y;

                const dx = markerX - popupCenterX;
                const dy = markerY - popupCenterY;

                let edgeX = popupCenterX;
                let edgeY = popupCenterY;

                const halfW = popupWidth / 2;
                const halfH = popupHeight / 2;

                if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                  const absRatioX = Math.abs(dx) / halfW;
                  const absRatioY = Math.abs(dy) / halfH;

                  if (absRatioX > absRatioY) {
                    edgeX = dx > 0 ? popupLeft + popupWidth : popupLeft;
                    const t = (edgeX - popupCenterX) / dx;
                    edgeY = popupCenterY + dy * t;

                    edgeY = Math.max(
                      popupTop,
                      Math.min(popupTop + popupHeight, edgeY),
                    );
                  } else {
                    edgeY = dy > 0 ? popupTop + popupHeight : popupTop;
                    const t = (edgeY - popupCenterY) / dy;
                    edgeX = popupCenterX + dx * t;
                    edgeX = Math.max(
                      popupLeft,
                      Math.min(popupLeft + popupWidth, edgeX),
                    );
                  }
                }

                return (
                  <>
                    <line
                      x1={markerX}
                      y1={markerY}
                      x2={edgeX}
                      y2={edgeY}
                      stroke="#1452f0"
                      strokeWidth="2"
                      strokeDasharray="8 6"
                      strokeLinecap="round"
                      opacity={isPopupVisible ? 0.6 : 0}
                      style={{ transition: "opacity 150ms ease" }}
                    />
                    <circle
                      cx={markerX}
                      cy={markerY}
                      r="8"
                      fill="#1452f0"
                      stroke="#ffffff"
                      strokeWidth="3"
                      opacity={isPopupVisible ? 1 : 0}
                      style={{ transition: "opacity 150ms ease" }}
                    />
                    <circle
                      cx={markerX}
                      cy={markerY}
                      r="3"
                      fill="#ffffff"
                      opacity={isPopupVisible ? 1 : 0}
                      style={{ transition: "opacity 150ms ease" }}
                    />
                  </>
                );
              })()}
            </svg>
          )}
          <div
            className="md:hidden fixed z-50"
            style={{
              left: popupPosition?.left ?? 16,
              top: popupPosition?.top ?? 80,
            }}
          >
            <div
              ref={mobilePopupRef}
              style={{ width: "min(360px, calc(100vw - 32px))" }}
            >
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
                  relatedMarkets={relatedMarkets}
                  onMarketClick={handleMarketClick}
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
