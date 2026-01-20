import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// DOC API для списка статей
const GDELT_DOC_API_BASE_URL = "https://api.gdeltproject.org/api/v2/doc";
// GEO API для географических данных с координатами
const GDELT_GEO_API_BASE_URL = "https://api.gdeltproject.org/api/v2/geo";

const POLYMARKET_RELEVANT_QUERY =
  "(Trump OR Biden OR Ukraine OR Russia OR Israel OR Gaza OR China OR Bitcoin OR inflation)";

const BREAKING_NEWS_QUERY =
  "(Trump OR Biden OR Ukraine OR Russia OR Israel OR China OR Bitcoin)";

// Интерфейс для статьи из DOC API
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

// Интерфейс для локации из GEO API (GeoJSON)
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

// Расширенный интерфейс статьи с координатами
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
  baseQuery: fetchBaseQuery({ baseUrl: GDELT_DOC_API_BASE_URL }),
  tagTypes: ["News", "GeoNews"],
  endpoints: (builder) => ({
    // Основной эндпоинт с координатами из GEO API
    getNewsWithCoords: builder.query<
      GdeltArticleWithCoords[],
      GdeltQueryParams
    >({
      async queryFn(
        { query = POLYMARKET_RELEVANT_QUERY, timespan = "1d" } = {},
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) {
        try {
          // Запрашиваем GEO API для получения координат
          const geoParams = new URLSearchParams({
            query: `${query} sourcelang:english`,
            mode: "PointData",
            format: "GeoJSON",
            timespan,
            maxpoints: "500",
          });

          const geoResponse = await fetch(
            `${GDELT_GEO_API_BASE_URL}/geo?${geoParams.toString()}`,
          );
          const geoData: GdeltGeoResponse = await geoResponse.json();

          // Преобразуем GeoJSON features в статьи с координатами
          const articlesWithCoords: GdeltArticleWithCoords[] = [];
          const seenUrls = new Set<string>();

          for (const feature of geoData.features || []) {
            const coords = feature.geometry?.coordinates;
            const locationName = feature.properties?.name;

            // Парсим HTML из properties для извлечения статей
            const html = feature.properties?.html || "";

            // Извлекаем URL и заголовки из HTML
            const linkRegex =
              /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
            let match;
            while ((match = linkRegex.exec(html)) !== null) {
              const url = match[1];
              const title = match[2].trim();

              if (url && title && !seenUrls.has(url)) {
                seenUrls.add(url);

                // Извлекаем изображение если есть
                const imgMatch = html.match(
                  /<img[^>]*src=["']([^"']+)["'][^>]*>/i,
                );
                const socialimage = imgMatch ? imgMatch[1] : "";

                // Извлекаем домен из URL
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

          // Дедупликация по заголовкам
          const deduplicated = deduplicateArticles(articlesWithCoords);

          return { data: deduplicated.slice(0, 150) };
        } catch (error) {
          // Fallback на обычный DOC API
          const docParams = new URLSearchParams({
            query: `${query} sourcelang:english`,
            mode: "ArtList",
            format: "json",
            maxrecords: "250",
            timespan,
          });

          const result = await fetchWithBQ(`/doc?${docParams.toString()}`);

          if (result.error) {
            return { error: result.error };
          }

          const response = result.data as GdeltResponse;
          const articles = response.articles || [];
          const deduplicated = deduplicateArticles(articles);
          const diversified = diversifyArticlesByCountry(deduplicated, 12);

          return { data: diversified as GdeltArticleWithCoords[] };
        }
      },
      providesTags: ["GeoNews"],
    }),

    // Оригинальный эндпоинт (без координат, для обратной совместимости)
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
        const deduplicated = deduplicateArticles(articles);
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
        const deduplicated = deduplicateArticles(articles);
        return diversifyArticlesByCountry(deduplicated, 15);
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
