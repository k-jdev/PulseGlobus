import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const GDELT_API_BASE_URL = "https://api.gdeltproject.org/api/v2/doc";

const POLYMARKET_RELEVANT_QUERY =
  "(Trump OR Biden OR Ukraine OR Russia OR Israel OR Gaza OR China OR Bitcoin OR inflation)";

const BREAKING_NEWS_QUERY =
  "(Trump OR Biden OR Ukraine OR Russia OR Israel OR China OR Bitcoin)";

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
  maxPerCountry: number = 20,
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

function deduplicateArticles(articles: GdeltArticle[]): GdeltArticle[] {
  const seenTitles = new Set<string>();
  const deduplicated: GdeltArticle[] = [];

  for (const article of articles) {
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const titlePrefix = normalizedTitle.slice(0, 50);

    if (!seenTitles.has(normalizedTitle) && !seenTitles.has(titlePrefix)) {
      seenTitles.add(normalizedTitle);
      seenTitles.add(titlePrefix);
      deduplicated.push(article);
    }
  }

  return deduplicated;
}

export const gdeltApi = createApi({
  reducerPath: "gdeltApi",
  baseQuery: fetchBaseQuery({ baseUrl: GDELT_API_BASE_URL }),
  tagTypes: ["News"],
  endpoints: (builder) => ({
    getNews: builder.query<GdeltArticle[], GdeltQueryParams>({
      query: ({
        query = POLYMARKET_RELEVANT_QUERY,
        maxrecords = 250,
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

        params.set("query", queryParts.join(" ") || POLYMARKET_RELEVANT_QUERY);

        return `/doc?${params.toString()}`;
      },
      transformResponse: (response: GdeltResponse) => {
        const articles = response.articles || [];
        const deduplicated = deduplicateArticles(articles);
        return diversifyArticlesByCountry(deduplicated, 12);
      },
      providesTags: ["News"],
    }),

    getNewsByQuery: builder.query<GdeltArticle[], string>({
      query: (searchQuery) => {
        const params = new URLSearchParams({
          query: `${
            searchQuery || POLYMARKET_RELEVANT_QUERY
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
        // Deduplicate for search results
        return deduplicated.slice(0, 100);
      },
      providesTags: ["News"],
    }),

    getBreakingNews: builder.query<
      GdeltArticle[],
      { maxrecords?: number; timespan?: string }
    >({
      query: ({ maxrecords = 250, timespan = "4h" } = {}) => {
        const params = new URLSearchParams({
          query: `${BREAKING_NEWS_QUERY} sourcelang:english`,
          mode: "ArtList",
          format: "json",
          maxrecords: maxrecords.toString(),
          timespan,
        });
        return `/doc?${params.toString()}`;
      },
      transformResponse: (response: GdeltResponse) => {
        const articles = response.articles || [];
        // First deduplicate, then diversify by country
        return diversifyArticlesByCountry(deduplicated, 15);
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
