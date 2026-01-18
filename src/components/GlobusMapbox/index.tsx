import { useRef, useMemo, useEffect, useState } from "react";
import { useMapbox } from "./hooks";
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
      `(markets: ${linkedMarketMarkers.length}, news: ${linkedNewsMarkers.length})`
    );
    return filteredMarkers;
  }, [events, newsArticles, timeFilter, showNews]);

  const { theme, changeTheme, isPaused, toggleSpin } = useMapbox(
    mapContainerRef,
    undefined,
    mapMarkers,
    (marker) => {
      console.log("🔍 Marker clicked:", marker.id, "type:", marker.type);
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
              />
            )}
          </div>
          {/* Mobile popup - centered with backdrop */}
          <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 " onClick={handleClosePopup} />
            <div className="relative z-10">
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
