import { useMemo } from "react";

import type { MapMarker } from "../utils/marketMappers";

export interface RelatedNews {
  id: string;
  title: string;
  image: string;
  url?: string;
  domain?: string;
  sourcecountry?: string;
  seendate?: string;
  coordinates: [number, number];
}

export interface RelatedMarket {
  id: string;
  title: string;
  image: string;
  slug: string;
  eventSlug?: string;
  outcomePrices: number[];
  outcomes: string[];
  coordinates: [number, number];
}

function resolveRelated(
  ids: string[] | undefined,
  markers: MapMarker[],
  type: MapMarker["type"],
): MapMarker[] {
  if (!ids?.length) return [];
  return ids
    .map((id) => markers.find((marker) => marker.id === id))
    .filter((marker): marker is MapMarker => marker?.type === type);
}

export function useMarkerRelations(
  selectedMarker: MapMarker | null,
  markers: MapMarker[],
) {
  const relatedNews = useMemo<RelatedNews[]>(() => {
    if (selectedMarker?.type !== "market") return [];
    return resolveRelated(selectedMarker.relatedNewsIds, markers, "news").map(
      (news) => ({
        id: news.id,
        title: news.title,
        image: news.image,
        url: news.url,
        domain: news.domain,
        sourcecountry: news.sourcecountry,
        seendate: news.seendate,
        coordinates: news.coordinates,
      }),
    );
  }, [selectedMarker, markers]);

  const relatedMarkets = useMemo<RelatedMarket[]>(() => {
    if (selectedMarker?.type !== "news") return [];
    // Relations are computed after linking, so prefer the linked copy in the
    // marker list over the (possibly stale) selected snapshot.
    const linked = markers.find((marker) => marker.id === selectedMarker.id);
    const ids = linked?.relatedMarketIds ?? selectedMarker.relatedMarketIds;
    return resolveRelated(ids, markers, "market").map((market) => ({
      id: market.id,
      title: market.title,
      image: market.image,
      slug: market.slug,
      eventSlug: market.eventSlug,
      outcomePrices: market.outcomePrices,
      outcomes: market.outcomes,
      coordinates: market.coordinates,
    }));
  }, [selectedMarker, markers]);

  return { relatedNews, relatedMarkets };
}
