import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const POLYMARKET_API_BASE_URL = "/api/polymarket";

const BUILDER_API_KEY = "019be474-bdb7-7d8d-9267-2d7322159eb4";

export interface ImageOptimized {
  id: string;
  imageUrlSource: string;
  imageUrlOptimized: string;
  imageSizeKbSource: number;
  imageSizeKbOptimized: number;
  imageOptimizedComplete: boolean;
}

export interface Category {
  id: string;
  label: string;
  slug: string;
}

export interface Tag {
  id: string;
  label: string;
  slug: string;
}

export interface EventMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  category: string;
  startDate: string;
  endDate: string;
  outcomes: string; // JSON string: ["Yes", "No"] или ["Option1", "Option2"]
  outcomePrices: string; // JSON string: ["0.93", "0.07"]
  volume: string;
  volumeNum: number;
  liquidity: string;
  liquidityNum: number;
  active: boolean;
  closed: boolean;
  archived?: boolean;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
  groupItemTitle?: string;
  imageOptimized?: ImageOptimized;
}

export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  volume: number;
  liquidity: number;
  category: string;
  subcategory: string;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  imageOptimized?: ImageOptimized;

  markets?: EventMarket[];
  negRisk?: boolean;
  showAllOutcomes?: boolean;
}

export interface Market {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  category: string;
  startDate: string;
  endDate: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  volumeNum: number;
  liquidity: string;
  liquidityNum: number;
  active: boolean;
  closed: boolean;
  archived: boolean;
  featured: boolean;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
  events: PolymarketEvent[];
  categories: Category[];
  tags: Tag[];
  imageOptimized?: ImageOptimized;
}

// Live trade from CLOB API
export interface LiveTrade {
  id: string;
  taker_order_id: string;
  market: string;
  asset_id: string;
  side: "BUY" | "SELL";
  size: string;
  fee_rate_bps: string;
  price: string;
  status: string;
  match_time: string;
  last_update: string;
  outcome: string;
  owner: string;
  maker_address: string;
  transaction_hash: string;
  bucket_index: number;
  maker_orders: Array<{
    order_id: string;
    owner: string;
    matched_amount: string;
  }>;
}

export interface TradesResponse {
  data: LiveTrade[];
  next_cursor?: string;
}

export const polymarketApi = createApi({
  reducerPath: "polymarketApi",
  baseQuery: fetchBaseQuery({
    baseUrl: POLYMARKET_API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("X-Builder-Api-Key", BUILDER_API_KEY);
      return headers;
    },
  }),
  tagTypes: ["Markets", "Events", "Trades"],
  endpoints: (builder) => ({
    getMarkets: builder.query<Market[], { limit?: number; active?: boolean }>({
      query: ({ limit = 300, active = true } = {}) =>
        `/markets?limit=${limit}&active=${active}&closed=false&archived=false&order=volume&ascending=false`,
      providesTags: ["Markets"],
    }),

    getMarketById: builder.query<Market, string>({
      query: (id) => `/markets/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Markets", id }],
    }),

    getEvents: builder.query<
      PolymarketEvent[],
      { limit?: number; active?: boolean; order?: string }
    >({
      query: ({ limit = 300, active = true, order = "volume24hr" } = {}) =>
        `/events?active=${active}&closed=false&limit=${limit}&order=${order}&ascending=false`,
      providesTags: ["Events"],
    }),

    getEventsWithMarkets: builder.query<
      PolymarketEvent[],
      { limit?: number; active?: boolean; order?: string }
    >({
      query: ({ limit = 300, active = true, order = "volume24hr" } = {}) =>
        `/events?active=${active}&closed=false&limit=${limit}&order=${order}&ascending=false`,
      providesTags: ["Events"],
    }),

    // Get recent trades from activity feed
    getRecentTrades: builder.query<
      Array<{
        id: string;
        market: Market;
        side: "BUY" | "SELL";
        size: number;
        price: number;
        outcome: string;
        timestamp: number;
      }>,
      { limit?: number }
    >({
      async queryFn(
        { limit = 20 } = {},
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) {
        try {
          // First get active markets sorted by recent activity
          const marketsResult = await fetchWithBQ(
            `/markets?limit=100&active=true&closed=false&order=volume24hr&ascending=false`,
          );

          if (marketsResult.error) {
            return { error: marketsResult.error };
          }

          const markets = marketsResult.data as Market[];

          // Simulate recent trades based on market activity
          // In production, this would use WebSocket or CLOB API
          const trades = markets.slice(0, limit).map((market, index) => {
            const outcomes = JSON.parse(market.outcomes || '["Yes", "No"]');
            const prices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]');
            const outcomeIndex = Math.random() > 0.5 ? 0 : 1;

            // Calculate realistic trade size based on market volume
            const avgTradeSize =
              market.volume24hr > 0
                ? Math.min(market.volume24hr / 100, 500)
                : 50;
            const tradeSize = Math.max(
              10,
              avgTradeSize * (0.5 + Math.random()),
            );

            return {
              id: `${market.id}-${Date.now()}-${index}`,
              market,
              side: (Math.random() > 0.5 ? "BUY" : "SELL") as "BUY" | "SELL",
              size: Math.round(tradeSize),
              price: parseFloat(prices[outcomeIndex]) || 0.5,
              outcome: outcomes[outcomeIndex] || "Yes",
              timestamp: Date.now() - Math.floor(Math.random() * 30000), // Last 30 seconds
            };
          });

          // Sort by timestamp (most recent first)
          trades.sort((a, b) => b.timestamp - a.timestamp);

          return { data: trades };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Trades"],
    }),

    searchMarkets: builder.query<Market[], { query: string; limit?: number }>({
      query: ({ limit = 500 }) => `/markets?limit=${limit}&active=true`,
      transformResponse: (response: Market[], _meta, arg) => {
        const searchQuery = arg.query.toLowerCase().trim();
        if (!searchQuery) return response.slice(0, 50);

        const filtered = response.filter((market) => {
          const question = market.question?.toLowerCase() || "";
          const description = market.description?.toLowerCase() || "";
          const category = market.category?.toLowerCase() || "";

          return (
            question.includes(searchQuery) ||
            description.includes(searchQuery) ||
            category.includes(searchQuery)
          );
        });

        return filtered.slice(0, 20);
      },
      serializeQueryArgs: ({ queryArgs }) => {
        return `searchMarkets-${queryArgs.query}`;
      },
      providesTags: ["Markets"],
    }),
  }),
});

export const {
  useGetMarketsQuery,
  useGetMarketByIdQuery,
  useGetEventsQuery,
  useGetEventsWithMarketsQuery,
  useGetRecentTradesQuery,
  useSearchMarketsQuery,
} = polymarketApi;
