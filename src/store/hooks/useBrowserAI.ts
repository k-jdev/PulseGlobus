import { useState, useEffect, useCallback, useRef } from "react";
import {
  checkBrowserAI,
  classifyNews,
  classifyMarkets,
  matchNewsToMarkets,
  destroyAISession,
  ClassifiedItem,
  COUNTRY_COORDINATES,
} from "../services/browserAI";
import { GdeltArticleWithCoords } from "../services/gdeltApi";
import { PolymarketEvent, Market } from "../services/polymarketApi";

interface UseBrowserAIOptions {
  autoClassify?: boolean;
  batchSize?: number;
}

interface UseBrowserAIResult {
  isAvailable: boolean;
  method: "browser-ai" | "keywords" | "none";
  statusMessage: string;
  isLoading: boolean;
  error: string | null;

  classifiedNews: ClassifiedItem[];
  classifiedMarkets: ClassifiedItem[];
  newsToMarketsMap: Map<string, ClassifiedItem[]>;

  classifyNewsData: (articles: GdeltArticleWithCoords[]) => Promise<void>;
  classifyMarketsData: (markets: (PolymarketEvent | Market)[]) => Promise<void>;
  matchData: () => void;
  reset: () => void;

  getCountryCoordinates: (
    countryCode: string,
  ) => { name: string; coords: [number, number] } | undefined;
  getMarketRelatedNews: (marketId: string) => ClassifiedItem[];
}

export function useBrowserAI(
  options: UseBrowserAIOptions = {},
): UseBrowserAIResult {
  const { batchSize = 10 } = options;

  const [isAvailable, setIsAvailable] = useState(false);
  const [method, setMethod] = useState<"browser-ai" | "keywords" | "none">(
    "none",
  );
  const [statusMessage, setStatusMessage] = useState("Проверка AI...");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [classifiedNews, setClassifiedNews] = useState<ClassifiedItem[]>([]);
  const [classifiedMarkets, setClassifiedMarkets] = useState<ClassifiedItem[]>(
    [],
  );
  const [newsToMarketsMap, setNewsToMarketsMap] = useState<
    Map<string, ClassifiedItem[]>
  >(new Map());

  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      try {
        const status = await checkBrowserAI();
        setIsAvailable(status.available);
        setMethod(status.method);
        setStatusMessage(status.message);
      } catch (err) {
        setError(String(err));
        setMethod("keywords");
        setStatusMessage("Ошибка инициализации, используем keywords");
      }
    };

    init();

    return () => {
      destroyAISession();
    };
  }, []);

  const classifyNewsData = useCallback(
    async (articles: GdeltArticleWithCoords[]) => {
      if (!articles.length) return;

      setIsLoading(true);
      setError(null);

      try {
        const classified = await classifyNews(articles, batchSize);
        setClassifiedNews(classified);
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [batchSize],
  );

  const classifyMarketsData = useCallback(
    async (markets: (PolymarketEvent | Market)[]) => {
      if (!markets.length) return;

      setIsLoading(true);
      setError(null);

      try {
        const classified = await classifyMarkets(markets, batchSize);
        setClassifiedMarkets(classified);
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [batchSize],
  );

  const matchData = useCallback(() => {
    if (!classifiedNews.length || !classifiedMarkets.length) return;

    const map = matchNewsToMarkets(classifiedNews, classifiedMarkets);
    setNewsToMarketsMap(map);
  }, [classifiedNews, classifiedMarkets]);

  const reset = useCallback(() => {
    setClassifiedNews([]);
    setClassifiedMarkets([]);
    setNewsToMarketsMap(new Map());
    setError(null);
  }, []);

  const getCountryCoordinates = useCallback((countryCode: string) => {
    return COUNTRY_COORDINATES[countryCode];
  }, []);

  const getMarketRelatedNews = useCallback(
    (marketId: string): ClassifiedItem[] => {
      return newsToMarketsMap.get(marketId) || [];
    },
    [newsToMarketsMap],
  );

  return {
    isAvailable,
    method,
    statusMessage,
    isLoading,
    error,
    classifiedNews,
    classifiedMarkets,
    newsToMarketsMap,
    classifyNewsData,
    classifyMarketsData,
    matchData,
    reset,
    getCountryCoordinates,
    getMarketRelatedNews,
  };
}

export default useBrowserAI;
