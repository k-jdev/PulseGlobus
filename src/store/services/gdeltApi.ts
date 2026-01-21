import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Список CORS прокси для обхода блокировки GDELT API (с фолбэком)
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest=",
];

// Функция для запроса через прокси с фолбэком
async function fetchWithProxy(url: string): Promise<Response> {
  let lastError: Error | null = null;

  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }

  // Если все прокси не работают, пробуем напрямую (на случай если CORS разрешён)
  try {
    return await fetch(url);
  } catch {
    throw lastError || new Error("All proxies failed");
  }
}

const GDELT_DOC_API_BASE = "https://api.gdeltproject.org/api/v2/doc";
const GDELT_GEO_API_BASE = "https://api.gdeltproject.org/api/v2/geo";

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

export interface GdeltGeoFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    name: string;
    count: number;
    html?: string;
    articles?: Array<{
      url: string;
      title: string;
      image?: string;
      domain?: string;
      seendate?: string;
    }>;
  };
}

export interface GdeltGeoResponse {
  type: "FeatureCollection";
  features: GdeltGeoFeature[];
}

export interface GdeltArticleWithCoords extends GdeltArticle {
  coordinates?: [number, number]; // [longitude, latitude]
  locationName?: string;
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
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["News", "GeoNews"],
  endpoints: (builder) => ({
    getNewsWithCoords: builder.query<
      GdeltArticleWithCoords[],
      GdeltQueryParams
    >({
      async queryFn(
        { query = POLYMARKET_RELEVANT_QUERY, timespan = "1d" } = {},
        _queryApi,
        _extraOptions,
        _fetchWithBQ,
      ) {
        try {
          const geoParams = new URLSearchParams({
            query: `${query} sourcelang:english`,
            mode: "PointData",
            format: "GeoJSON",
            timespan,
            maxpoints: "500",
          });

          const geoUrl = `${GDELT_GEO_API_BASE}/geo?${geoParams.toString()}`;
          const geoResponse = await fetchWithProxy(geoUrl);
          const geoData: GdeltGeoResponse = await geoResponse.json();

          const articlesWithCoords: GdeltArticleWithCoords[] = [];
          const seenUrls = new Set<string>();

          for (const feature of geoData.features || []) {
            const coords = feature.geometry?.coordinates;
            const locationName = feature.properties?.name;

            const html = feature.properties?.html || "";

            const linkRegex =
              /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
            let match;
            while ((match = linkRegex.exec(html)) !== null) {
              const url = match[1];
              const title = match[2].trim();

              if (url && title && !seenUrls.has(url)) {
                seenUrls.add(url);

                const imgMatch = html.match(
                  /<img[^>]*src=["']([^"']+)["'][^>]*>/i,
                );
                const socialimage = imgMatch ? imgMatch[1] : "";

                let domain = "";
                try {
                  domain = new URL(url).hostname;
                } catch {
                  domain = "";
                }

                articlesWithCoords.push({
                  url,
                  url_mobile: url,
                  title,
                  seendate: new Date().toISOString(),
                  socialimage,
                  domain,
                  language: "English",
                  sourcecountry: locationName || "Unknown",
                  coordinates: coords as [number, number],
                  locationName,
                });
              }
            }
          }

          const deduplicated = deduplicateArticles(articlesWithCoords);

          return { data: deduplicated.slice(0, 150) };
        } catch (error) {
          // Fallback: используем Doc API если Geo API не работает
          try {
            const docParams = new URLSearchParams({
              query: `${query} sourcelang:english`,
              mode: "ArtList",
              format: "json",
              maxrecords: "250",
              timespan,
            });

            const docUrl = `${GDELT_DOC_API_BASE}/doc?${docParams.toString()}`;
            const response = await fetchWithProxy(docUrl);
            const data: GdeltResponse = await response.json();

            const articles = data.articles || [];
            const deduplicated = deduplicateArticles(articles);
            const diversified = diversifyArticlesByCountry(deduplicated, 12);

            return { data: diversified as GdeltArticleWithCoords[] };
          } catch (fallbackError) {
            return {
              error: {
                status: "FETCH_ERROR",
                error: String(fallbackError),
              } as any,
            };
          }
        }
      },
      providesTags: ["GeoNews"],
    }),

    getNews: builder.query<GdeltArticle[], GdeltQueryParams>({
      async queryFn({
        query = POLYMARKET_RELEVANT_QUERY,
        maxrecords = 250,
        timespan = "1d",
        sourcecountry,
        theme,
      } = {}) {
        try {
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
            queryParts.join(" ") || POLYMARKET_RELEVANT_QUERY,
          );

          const url = `${GDELT_DOC_API_BASE}/doc?${params.toString()}`;
          const response = await fetchWithProxy(url);
          const data: GdeltResponse = await response.json();

          const articles = data.articles || [];
          const deduplicated = deduplicateArticles(articles);
          return { data: diversifyArticlesByCountry(deduplicated, 12) };
        } catch (error) {
          return {
            error: { status: "FETCH_ERROR", error: String(error) } as any,
          };
        }
      },
      providesTags: ["News"],
    }),

    getNewsByQuery: builder.query<GdeltArticle[], string>({
      async queryFn(searchQuery) {
        try {
          const params = new URLSearchParams({
            query: `${searchQuery || POLYMARKET_RELEVANT_QUERY} sourcelang:english`,
            mode: "ArtList",
            format: "json",
            maxrecords: "250",
            timespan: "7d",
          });

          const url = `${GDELT_DOC_API_BASE}/doc?${params.toString()}`;
          const response = await fetchWithProxy(url);
          const data: GdeltResponse = await response.json();

          const articles = data.articles || [];
          const deduplicated = deduplicateArticles(articles);
          return { data: deduplicated.slice(0, 100) };
        } catch (error) {
          return {
            error: { status: "FETCH_ERROR", error: String(error) } as any,
          };
        }
      },
      providesTags: ["News"],
    }),

    getBreakingNews: builder.query<
      GdeltArticle[],
      { maxrecords?: number; timespan?: string }
    >({
      async queryFn({ maxrecords = 250, timespan = "4h" } = {}) {
        try {
          const params = new URLSearchParams({
            query: `${BREAKING_NEWS_QUERY} sourcelang:english`,
            mode: "ArtList",
            format: "json",
            maxrecords: maxrecords.toString(),
            timespan,
          });

          const url = `${GDELT_DOC_API_BASE}/doc?${params.toString()}`;
          const response = await fetchWithProxy(url);
          const data: GdeltResponse = await response.json();

          const articles = data.articles || [];
          const deduplicated = deduplicateArticles(articles);
          return { data: diversifyArticlesByCountry(deduplicated, 15) };
        } catch (error) {
          return {
            error: { status: "FETCH_ERROR", error: String(error) } as any,
          };
        }
      },
      providesTags: ["News"],
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetNewsWithCoordsQuery,
  useGetNewsByQueryQuery,
  useGetBreakingNewsQuery,
} = gdeltApi;
