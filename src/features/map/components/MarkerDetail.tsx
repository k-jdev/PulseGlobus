import { MarketStatsPopup } from "./MarketStatsPopup";
import { NewsMarker } from "./NewsMarker";
import type { RelatedMarket, RelatedNews } from "../hooks/useMarkerRelations";
import type { MapMarker } from "../utils/marketMappers";

interface MarkerDetailProps {
  marker: MapMarker;
  isMobile?: boolean;
  relatedNews: RelatedNews[];
  relatedMarkets: RelatedMarket[];
  onClose: () => void;
  onNewsClick: (newsId: string, coordinates: [number, number]) => void;
  onMarketClick: (marketId: string, coordinates: [number, number]) => void;
}

export function MarkerDetail({
  marker,
  isMobile = false,
  relatedNews,
  relatedMarkets,
  onClose,
  onNewsClick,
  onMarketClick,
}: MarkerDetailProps) {
  if (marker.type === "news") {
    return (
      <NewsMarker
        title={marker.title}
        image={marker.image}
        url={marker.url || marker.slug}
        domain={marker.domain}
        sourcecountry={marker.sourcecountry}
        seendate={marker.seendate}
        onClose={onClose}
        isMobile={isMobile}
        relatedMarkets={relatedMarkets}
        onMarketClick={onMarketClick}
      />
    );
  }

  return (
    <MarketStatsPopup
      title={marker.title}
      image={marker.image}
      outcomes={marker.outcomes.map((name, index) => ({
        name,
        price: marker.outcomePrices[index] || 0,
      }))}
      volume={marker.volume}
      volume24hr={marker.volume24hr}
      volume1wk={marker.volume1wk}
      volume1mo={marker.volume1mo}
      liquidity={marker.liquidity}
      endDate={marker.endDate}
      description={marker.description}
      slug={marker.slug}
      eventSlug={marker.eventSlug}
      onClose={onClose}
      isMobile={isMobile}
      relatedNews={relatedNews}
      onNewsClick={onNewsClick}
    />
  );
}
