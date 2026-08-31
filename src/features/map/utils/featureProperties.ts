import type { OutcomeData } from "./marketMappers";

/**
 * Shape of the GeoJSON feature properties produced by
 * `createGeoJSONFromMarkers`. Mapbox flattens properties to primitives, so
 * arrays and objects arrive JSON-encoded.
 */
export interface MarkerFeatureProperties {
  id?: string;
  type?: "market" | "news";
  title?: string;
  description?: string;
  category?: string;
  image?: string;
  slug?: string;
  eventSlug?: string;
  eventTitle?: string;
  volume?: number | string;
  volume24hr?: number | string;
  volume1wk?: number | string;
  volume1mo?: number | string;
  liquidity?: number | string;
  endDate?: string;
  /** JSON-encoded `string[]`. */
  outcomes?: string;
  /** JSON-encoded `number[]`. */
  outcomePrices?: string;
  /** JSON-encoded `OutcomeData[]`, or the array itself before serialisation. */
  eventOutcomes?: string | OutcomeData[];
  isMultiMarket?: boolean | string;
  url?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
  seendate?: string;
  relatedNewsId?: string;
  relatedNewsIds?: string;
  relatedMarketIds?: string;
  relationScore?: number;
}

export interface PopupOutcome {
  name: string;
  percentage: number;
  buyPrice: string;
  sellPrice: string;
  volume?: number;
  marketSlug?: string;
}

export function parseJsonArray<T>(
  value: string | undefined,
  fallback: T[],
): T[] {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}
