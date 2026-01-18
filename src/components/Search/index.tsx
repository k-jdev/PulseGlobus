import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import searchIcon from "../../assets/svgs/navbar/search.svg";
import {
  useGetMarketsQuery,
  useGetEventsQuery,
  Market,
} from "../../store/services/polymarketApi";
import {
  useGetNewsByQueryQuery,
  useGetNewsQuery,
  GdeltArticle,
} from "../../store/services/gdeltApi";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Markets", value: "markets" },
  { label: "News", value: "news" },
  { label: "Politics", value: "politics" },
  { label: "Sports", value: "sports" },
  { label: "Crypto", value: "crypto" },
  { label: "Finance", value: "finance" },
  { label: "Tech", value: "tech" },
  { label: "World", value: "world" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function formatOutcomePrice(price: number): string {
  return `${Math.round(price * 100)}%`;
}

function parseOutcomePrices(pricesStr: string): number[] {
  try {
    return JSON.parse(pricesStr).map(Number);
  } catch {
    return [];
  }
}

function parseOutcomes(outcomesStr: string): string[] {
  try {
    return JSON.parse(outcomesStr);
  } catch {
    return [];
  }
}

interface SearchProps {
  isMobile?: boolean;
  onFocus?: () => void;
  onClose?: () => void;
}

export function Search({ isMobile = false, onFocus, onClose }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data: allMarkets, isFetching: isFetchingMarkets } =
    useGetMarketsQuery({
      limit: 500,
      active: true,
    });

  // Events data - для дополнительных результатов
  const { data: allEvents, isFetching: isFetchingEvents } = useGetEventsQuery({
    limit: 300,
    active: true,
  });

  // News data - поиск по запросу пользователя
  const { data: searchedNews, isFetching: isFetchingNews } =
    useGetNewsByQueryQuery(
      debouncedQuery.length >= 2 ? debouncedQuery : "politics OR economy",
      {
        skip:
          debouncedQuery.length < 2 || selectedCategories.includes("markets"),
      }
    );

  // Также загружаем общие новости для локального поиска как fallback
  const { data: generalNews } = useGetNewsQuery({
    maxrecords: 300,
    timespan: "1d",
  });

  const isFetching = isFetchingMarkets || isFetchingNews || isFetchingEvents;

  // Search in markets
  const marketResults = useMemo(() => {
    if (selectedCategories.includes("news")) return []; // Skip markets if only news selected

    const searchQuery = debouncedQuery.toLowerCase().trim();
    if (searchQuery.length < 2) return [];

    const results: Market[] = [];
    const seenIds = new Set<string>();

    // Search in markets
    if (allMarkets) {
      for (const market of allMarkets) {
        if (seenIds.has(market.id)) continue;

        const question = market.question?.toLowerCase() || "";
        const description = market.description?.toLowerCase() || "";
        const category = market.category?.toLowerCase() || "";

        const matchesSearch =
          question.includes(searchQuery) ||
          description.includes(searchQuery) ||
          category.includes(searchQuery);

        if (!matchesSearch) continue;

        // Filter by category if selected
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes("markets")
        ) {
          const matchesCategory = selectedCategories.some(
            (cat) =>
              cat !== "news" &&
              cat !== "markets" &&
              (category.includes(cat) || question.includes(cat))
          );
          if (!matchesCategory) continue;
        }

        seenIds.add(market.id);
        results.push(market);
      }
    }

    // Also search in events markets
    if (allEvents) {
      for (const event of allEvents) {
        const eventTitle = event.title?.toLowerCase() || "";
        const eventDesc = event.description?.toLowerCase() || "";

        if (
          eventTitle.includes(searchQuery) ||
          eventDesc.includes(searchQuery)
        ) {
          // Add event markets
          if (event.markets) {
            for (const market of event.markets) {
              if (seenIds.has(market.id)) continue;
              seenIds.add(market.id);

              // Convert EventMarket to Market-like object
              results.push({
                ...market,
                events: [event],
                categories: [],
                tags: [],
                featured: false,
                archived: false,
              } as Market);
            }
          }
        }
      }
    }

    return results.slice(0, 15);
  }, [allMarkets, allEvents, debouncedQuery, selectedCategories]);

  // Search in news - комбинируем API поиск и локальный поиск
  const newsResults = useMemo(() => {
    if (selectedCategories.includes("markets")) return []; // Skip news if only markets selected

    const searchQuery = debouncedQuery.toLowerCase().trim();
    if (searchQuery.length < 2) return [];

    const results: GdeltArticle[] = [];
    const seenUrls = new Set<string>();

    // Сначала добавляем результаты API поиска
    if (searchedNews) {
      for (const article of searchedNews) {
        if (seenUrls.has(article.url)) continue;

        const title = article.title?.toLowerCase() || "";

        // Filter by category if selected
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes("news")
        ) {
          const matchesCategory = selectedCategories.some(
            (cat) => cat !== "news" && cat !== "markets" && title.includes(cat)
          );
          if (!matchesCategory) continue;
        }

        seenUrls.add(article.url);
        results.push(article);
      }
    }

    // Дополняем локальным поиском по общим новостям
    if (generalNews && results.length < 15) {
      for (const article of generalNews) {
        if (seenUrls.has(article.url)) continue;

        const title = article.title?.toLowerCase() || "";
        const domain = article.domain?.toLowerCase() || "";

        // Проверяем совпадение с поисковым запросом
        if (!title.includes(searchQuery) && !domain.includes(searchQuery))
          continue;

        // Filter by category if selected
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes("news")
        ) {
          const matchesCategory = selectedCategories.some(
            (cat) => cat !== "news" && cat !== "markets" && title.includes(cat)
          );
          if (!matchesCategory) continue;
        }

        seenUrls.add(article.url);
        results.push(article);

        if (results.length >= 15) break;
      }
    }

    return results;
  }, [searchedNews, generalNews, debouncedQuery, selectedCategories]);

  // Combine and filter results
  const filteredResults = useMemo(() => {
    const markets = marketResults.map((m) => ({
      type: "market" as const,
      data: m,
    }));
    const news = newsResults.map((n) => ({ type: "news" as const, data: n }));

    // Interleave results
    const combined: Array<{
      type: "market" | "news";
      data: Market | GdeltArticle;
    }> = [];
    const maxLen = Math.max(markets.length, news.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < markets.length) combined.push(markets[i]);
      if (i < news.length) combined.push(news[i]);
    }

    return combined;
  }, [marketResults, newsResults]);

  const handleFocus = () => {
    setIsOpen(true);
    onFocus?.();
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const toggleCategory = (value: string) => {
    if (value === "") {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(value)
          ? prev.filter((c) => c !== value)
          : [...prev, value]
      );
    }
  };

  const getTopOutcome = (market: Market) => {
    const outcomes = parseOutcomes(market.outcomes || "[]");
    const prices = parseOutcomePrices(market.outcomePrices || "[]");

    if (outcomes.length === 0 || prices.length === 0) return null;

    let maxIndex = 0;
    let maxPrice = prices[0];
    prices.forEach((price, index) => {
      if (price > maxPrice) {
        maxPrice = price;
        maxIndex = index;
      }
    });

    return {
      name: outcomes[maxIndex] || "Yes",
      price: maxPrice,
    };
  };

  return (
    <div ref={containerRef} className={`relative ${isOpen ? "z-[100]" : ""}`}>
      {/* Search Input */}
      <div
        className={`flex items-center gap-6 bg-[#f5f7f9] border border-[#ebebec] rounded-full px-6 py-3 ${
          isMobile ? "h-12" : ""
        }`}
      >
        <img
          src={searchIcon}
          alt="Search"
          className="h-6 w-6"
          style={{
            filter:
              "invert(31%) sepia(96%) saturate(2448%) hue-rotate(213deg) brightness(97%) contrast(93%)",
          }}
        />
        <input
          ref={inputRef}
          className={`bg-transparent outline-none text-[16px] font-medium text-black placeholder:text-black placeholder:opacity-50 tracking-[-0.64px] leading-[1.2] ${
            isMobile ? "flex-1 min-w-0" : "w-[700px]"
          }`}
          type="text"
          placeholder={
            isMobile
              ? "Search markets, events, or topics..."
              : "Search markets, events, or topics..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
        />
        {isFetching && (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.8,
            }}
            className={`absolute mt-2 bg-white rounded-[14px] border border-[#e9edf8] shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)] z-[100] flex flex-col gap-4 ${
              isMobile
                ? "left-0 right-0 px-5 py-4 max-w-[calc(100vw-32px)]"
                : "top-[70px] left-0 right-0 px-6 py-5"
            }`}
          >
            {/* Searching For */}
            <p className="font-semibold text-[16px] leading-[30px] tracking-[-0.4px] text-[#1b2430]">
              Searching For
            </p>

            {/* Categories */}
            <div
              className={`flex gap-2 items-center ${
                isMobile
                  ? "overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
                  : "flex-wrap"
              }`}
            >
              {CATEGORIES.map((category) => {
                const isSelected =
                  (category.value === "" && selectedCategories.length === 0) ||
                  selectedCategories.includes(category.value);

                return (
                  <button
                    key={category.value}
                    onClick={() => toggleCategory(category.value)}
                    className={`h-12 px-6 py-3 rounded-full text-[15px] font-medium leading-[22.5px] tracking-[-0.3px] transition-all whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? "bg-[#1452f0] text-white shadow-[0px_2px_8px_0px_rgba(20,82,240,0.2)]"
                        : "bg-white text-[#808080] border border-[rgba(0,0,0,0.12)] hover:bg-gray-50"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[#e4e4e4]" />

            {/* Recent / Results */}
            <p className="font-semibold text-[16px] leading-[30px] tracking-[-0.4px] text-[#1b2430]">
              {debouncedQuery.length >= 2 ? "Results" : "Recent"}
            </p>

            {/* Results List */}
            <div
              className={`flex flex-col gap-4 overflow-y-auto ${
                isMobile ? "max-h-[200px]" : "max-h-[300px]"
              }`}
            >
              {debouncedQuery.length < 2 ? (
                <p className="text-[#808080] text-[15px] font-medium">
                  Start typing to search markets and news...
                </p>
              ) : filteredResults && filteredResults.length > 0 ? (
                filteredResults
                  .slice(0, isMobile ? 5 : 8)
                  .map((result, index) => {
                    if (result.type === "market") {
                      const market = result.data as Market;
                      const topOutcome = getTopOutcome(market);
                      const eventSlug = market.events?.[0]?.slug;
                      const marketUrl =
                        eventSlug && eventSlug !== market.slug
                          ? `https://polymarket.com/event/${eventSlug}/${market.slug}`
                          : `https://polymarket.com/event/${market.slug}`;
                      return (
                        <a
                          key={`market-${market.id}`}
                          href={marketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex gap-4 items-center w-full hover:bg-gray-50 rounded-lg transition-colors cursor-pointer py-1"
                        >
                          {/* Image */}
                          <div className="w-9 h-9 rounded-[4.8px] overflow-hidden flex-shrink-0">
                            {market.image ? (
                              <img
                                src={
                                  market.imageOptimized?.imageUrlOptimized ||
                                  market.image
                                }
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>

                          {/* Title */}
                          <p
                            className={`flex-1 font-semibold text-[17px] leading-[26px] tracking-[-0.4px] text-[#1b2430] truncate`}
                          >
                            {market.question}
                          </p>

                          {/* Outcome */}
                          {topOutcome && (
                            <div className="flex flex-col gap-1 items-end flex-shrink-0">
                              <p className="font-semibold text-[18px] tracking-[-0.4px] text-[#1b2430] text-right leading-[1.14]">
                                {formatOutcomePrice(topOutcome.price)}
                              </p>
                              <p className="font-medium text-[12px] tracking-[-0.28px] text-[#bbbdc1] leading-[1.14]">
                                {topOutcome.name}
                              </p>
                            </div>
                          )}
                        </a>
                      );
                    } else {
                      // News result
                      const article = result.data as GdeltArticle;
                      return (
                        <a
                          key={`news-${index}-${article.url}`}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex gap-4 items-center w-full hover:bg-gray-50 rounded-lg transition-colors cursor-pointer py-1"
                        >
                          {/* Image */}
                          <div className="w-9 h-9 rounded-[4.8px] overflow-hidden flex-shrink-0">
                            {article.socialimage ? (
                              <img
                                src={article.socialimage}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-[#1452f0] flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                                  <path d="M18 14h-8" />
                                  <path d="M15 18h-5" />
                                  <path d="M10 6h8v4h-8V6Z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <p
                            className={`flex-1 font-semibold text-[17px] leading-[26px] tracking-[-0.4px] text-[#1b2430] truncate`}
                          >
                            {article.title}
                          </p>

                          {/* News badge */}
                          <div className="flex flex-col gap-1 items-end flex-shrink-0">
                            {/* <div className="px-2 py-1 bg-[#1452f0] rounded-full">
                            <span className="text-white text-[11px] font-semibold">
                              NEWS
                            </span>
                          </div> */}
                            <p className="font-medium text-[12px] tracking-[-0.28px] text-[#bbbdc1] leading-[1.14]">
                              {article.domain}
                            </p>
                          </div>
                        </a>
                      );
                    }
                  })
              ) : (
                <p className="text-[#808080] text-[15px] font-medium">
                  No results found for "{debouncedQuery}"
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Search;
