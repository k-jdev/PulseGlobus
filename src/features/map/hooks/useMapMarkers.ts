import { useMemo } from "react";

import { useGetNewsQuery } from "@/store/services/gdeltApi";
import { useGetEventsWithMarketsQuery } from "@/store/services/polymarketApi";
import type { Category, TimeFilter } from "@/types";

import {
  convertEventsWithMarketsToMapMarkers,
  convertGdeltArticlesToMapMarkers,
  linkMarketsToNews,
  type MapMarker,
} from "../utils/marketMappers";

const NEWS_QUERY =
  "(Trump OR Biden OR Ukraine OR Russia OR Israel OR Gaza OR China OR Bitcoin OR inflation)";

/**
 * How many markers each time filter shows, and which volume window ranks them.
 * Shorter windows show fewer, hotter markets.
 */
const TIME_FILTER_RULES: Record<
  TimeFilter,
  { rankBy: keyof MapMarker; markets: number; news: number }
> = {
  "1h": { rankBy: "volume24hr", markets: 25, news: 15 },
  "6h": { rankBy: "volume1wk", markets: 50, news: 30 },
  "24h": { rankBy: "volume1mo", markets: 80, news: 100 },
};

interface UseMapMarkersOptions {
  timeFilter: TimeFilter;
  activeCategory: Category;
  showNews: boolean;
}

export function useMapMarkers({
  timeFilter,
  activeCategory,
  showNews,
}: UseMapMarkersOptions): MapMarker[] {
  const { data: events } = useGetEventsWithMarketsQuery({
    limit: 80,
    active: true,
    order: "volume24hr",
  });

  const { data: newsArticles } = useGetNewsQuery({
    query: NEWS_QUERY,
    maxrecords: 120,
    timespan: "1d",
  });

  return useMemo(() => {
    const marketMarkers = events
      ? convertEventsWithMarketsToMapMarkers(events)
      : [];
    const newsMarkers =
      showNews && newsArticles
        ? convertGdeltArticlesToMapMarkers(newsArticles)
        : [];

    const linked =
      showNews && newsMarkers.length > 0
        ? linkMarketsToNews(marketMarkers, newsMarkers)
        : { markets: marketMarkers, news: newsMarkers };

    const rule = TIME_FILTER_RULES[timeFilter];
    const rankedMarkets = [...linked.markets]
      .sort((a, b) => Number(b[rule.rankBy]) - Number(a[rule.rankBy]))
      .slice(0, rule.markets);

    const markers = [...rankedMarkets, ...linked.news.slice(0, rule.news)];

    if (activeCategory === "All Markets") return markers;

    const category = activeCategory.toLowerCase();
    return markers.filter(
      (marker) =>
        marker.type === "news" ||
        marker.category?.toLowerCase().includes(category),
    );
  }, [events, newsArticles, timeFilter, showNews, activeCategory]);
}
