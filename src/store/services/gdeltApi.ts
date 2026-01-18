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

function diversifyArticlesByCountry(
  articles: GdeltArticle[],
  maxPerCountry: number = 20
): GdeltArticle[] {
  const countryCount: Record<string, number> = {};
  const diversified: GdeltArticle[] = [];

  const shuffled = [...articles].sort(() => Math.random() - 0.5);

  for (const article of shuffled) {
    const country = article.sourcecountry || "Unknown";
    const currentCount = countryCount[country] || 0;

    const isChineseSource =
      country.toLowerCase().includes("china") ||
      country.toLowerCase().includes("taiwan") ||
      article.language === "Chinese";
    const limit = isChineseSource ? 6 : maxPerCountry;

    if (currentCount < limit) {
      countryCount[country] = currentCount + 1;
      diversified.push(article);
    }
  }

  return diversified;
}

export const gdeltApi = createApi({
  reducerPath: "gdeltApi",
  baseQuery: fetchBaseQuery({ baseUrl: GDELT_API_BASE_URL }),
  tagTypes: ["News"],
  endpoints: (builder) => ({
    getNews: builder.query<GdeltArticle[], GdeltQueryParams>({
      query: ({
        query = "(politics OR economy OR technology OR sports OR business)",
        maxrecords = 500,
        timespan = "1d",

        sourcecountry,
        theme,
      } = {}) => {
        const params = new URLSearchParams({
          mode: "ArtList",
          format: "json",
          maxrecords: maxrecords.toString(),
          timespan,
        });

        let queryParts: string[] = [];
        if (query) queryParts.push(query);
        queryParts.push("sourcelang:english");
        if (sourcecountry) queryParts.push(`sourcecountry:${sourcecountry}`);
        if (theme) queryParts.push(`theme:${theme}`);

        params.set(
          "query",
          queryParts.join(" ") || "(politics OR economy OR technology)"
        );

        return `/doc?${params.toString()}`;
      },
      transformResponse: (response: GdeltResponse) => {
        const articles = response.articles || [];

        return diversifyArticlesByCountry(articles, 12);
      },
      providesTags: ["News"],
    }),

    getNewsByQuery: builder.query<GdeltArticle[], string>({
      query: (searchQuery) => {
        const params = new URLSearchParams({
          query: `${
            searchQuery || "(politics OR economy OR technology)"
          } sourcelang:english`,
          mode: "ArtList",
          format: "json",
          maxrecords: "250",
          timespan: "7d",
        });
        return `/doc?${params.toString()}`;
      },
      transformResponse: (response: GdeltResponse) => {
        const articles = response.articles || [];
        // Для поиска возвращаем больше результатов без сильной диверсификации
        return articles.slice(0, 100);
      },
      providesTags: ["News"],
    }),

    getBreakingNews: builder.query<
      GdeltArticle[],
      { maxrecords?: number; timespan?: string }
    >({
      query: ({ maxrecords = 400, timespan = "4h" } = {}) => {
        const params = new URLSearchParams({
          query:
            "(politics OR economy OR technology OR sports OR business OR world) sourcelang:english",
          mode: "ArtList",
          format: "json",
          maxrecords: maxrecords.toString(),
          timespan,
        });
        return `/doc?${params.toString()}`;
      },
      transformResponse: (response: GdeltResponse) => {
        const articles = response.articles || [];
        return diversifyArticlesByCountry(articles, 15);
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
