import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const GDELT_API_BASE_URL = "https://api.gdeltproject.org/api/v2/doc";

export interface GdeltArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

export interface GdeltResponse {
  articles: GdeltArticle[];
}

export interface GdeltQueryParams {
  query?: string;
  maxrecords?: number;
  timespan?: string;
  sourcelang?: string;
  sourcecountry?: string;
  theme?: string;
}

export const gdeltApi = createApi({
  reducerPath: "gdeltApi",
  baseQuery: fetchBaseQuery({ baseUrl: GDELT_API_BASE_URL }),
  tagTypes: ["News"],
  endpoints: (builder) => ({
    getNews: builder.query<GdeltArticle[], GdeltQueryParams>({
      query: ({
        query = "(politics OR economy OR technology OR sports OR business)",
        maxrecords = 150,
        timespan = "1d",
        sourcelang,
        sourcecountry,
        theme,
      } = {}) => {
        const params = new URLSearchParams({
          mode: "ArtList",
          format: "json",
          maxrecords: maxrecords.toString(),
          timespan,
        });

        // Build query string with filters
        let queryParts: string[] = [];
        if (query) queryParts.push(query);
        if (sourcelang) queryParts.push(`sourcelang:${sourcelang}`);
        if (sourcecountry) queryParts.push(`sourcecountry:${sourcecountry}`);
        if (theme) queryParts.push(`theme:${theme}`);

        params.set(
          "query",
          queryParts.join(" ") || "(politics OR economy OR technology)"
        );

        return `/doc?${params.toString()}`;
      },
      transformResponse: (response: GdeltResponse) => {
        return response.articles || [];
      },
      providesTags: ["News"],
    }),

    getNewsByQuery: builder.query<GdeltArticle[], string>({
      query: (searchQuery) => {
        const params = new URLSearchParams({
          query: searchQuery || "(politics OR economy OR technology)",
          mode: "ArtList",
          format: "json",
          maxrecords: "150",
          timespan: "1d",
        });
        return `/doc?${params.toString()}`;
      },
      transformResponse: (response: GdeltResponse) => {
        return response.articles || [];
      },
      providesTags: ["News"],
    }),

    getBreakingNews: builder.query<
      GdeltArticle[],
      { maxrecords?: number; timespan?: string }
    >({
      query: ({ maxrecords = 100, timespan = "1h" } = {}) => {
        const params = new URLSearchParams({
          query: "(politics OR economy OR technology OR sports)",
          mode: "ArtList",
          format: "json",
          maxrecords: maxrecords.toString(),
          timespan,
        });
        return `/doc?${params.toString()}`;
      },
      transformResponse: (response: GdeltResponse) => {
        return response.articles || [];
      },
      providesTags: ["News"],
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetNewsByQueryQuery,
  useGetBreakingNewsQuery,
} = gdeltApi;
