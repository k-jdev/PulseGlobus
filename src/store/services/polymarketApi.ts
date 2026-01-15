import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const POLYMARKET_API_BASE_URL = "/api/polymarket";

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

export const polymarketApi = createApi({
  reducerPath: "polymarketApi",
  baseQuery: fetchBaseQuery({ baseUrl: POLYMARKET_API_BASE_URL }),
  tagTypes: ["Markets", "Events"],
  endpoints: (builder) => ({
    getMarkets: builder.query<Market[], { limit?: number; active?: boolean }>({
      query: ({ limit = 100, active = true } = {}) =>
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
      query: ({ limit = 100, active = true, order = "volume24hr" } = {}) =>
        `/events?active=${active}&closed=false&limit=${limit}&order=${order}&ascending=false`,
      providesTags: ["Events"],
    }),

    searchMarkets: builder.query<Market[], { query: string; limit?: number }>({
      query: ({ limit = 200 }) => `/markets?limit=${limit}&active=true`,
      transformResponse: (response: Market[], _meta, arg) => {
        const searchQuery = arg.query.toLowerCase().trim();
        if (!searchQuery) return response.slice(0, 20);

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
  useSearchMarketsQuery,
} = polymarketApi;
