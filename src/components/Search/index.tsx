import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import searchIcon from "../../assets/svgs/navbar/search.svg";
import { useGetMarketsQuery, Market } from "../../store/services/polymarketApi";

const CATEGORIES = [
  { label: "All Markets", value: "" },
  { label: "Politics", value: "politics" },
  { label: "Sports", value: "sports" },
  { label: "Crypto", value: "crypto" },
  { label: "Finance", value: "finance" },
  { label: "Geopolitics", value: "geopolitics" },
  { label: "Tech", value: "tech" },
  { label: "Culture", value: "culture" },
  { label: "World", value: "world" },
  { label: "Economy", value: "economy" },
  { label: "Trump", value: "trump" },
  { label: "Elections", value: "elections" },
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

  const { data: allMarkets, isFetching } = useGetMarketsQuery({
    limit: 100,
    active: true,
  });

  const searchResults = useMemo(() => {
    if (!allMarkets) return [];

    const searchQuery = debouncedQuery.toLowerCase().trim();
    if (searchQuery.length < 2) return [];

    return allMarkets
      .filter((market: Market) => {
        const question = market.question?.toLowerCase() || "";
        const description = market.description?.toLowerCase() || "";
        const category = market.category?.toLowerCase() || "";

        return (
          question.includes(searchQuery) ||
          description.includes(searchQuery) ||
          category.includes(searchQuery)
        );
      })
      .slice(0, 20);
  }, [allMarkets, debouncedQuery]);

  const filteredResults = searchResults?.filter((market: Market) => {
    if (selectedCategories.length === 0) return true;
    const marketCategory = market.category?.toLowerCase() || "";
    const marketQuestion = market.question?.toLowerCase() || "";
    return selectedCategories.some(
      (cat) => marketCategory.includes(cat) || marketQuestion.includes(cat)
    );
  });

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
    <div ref={containerRef} className="relative">
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
      {isOpen && (
        <div
          className={`absolute mt-2 bg-white rounded-[14px] border border-[#e9edf8] shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)] z-50 flex flex-col gap-4 ${
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
                Start typing to search markets...
              </p>
            ) : filteredResults && filteredResults.length > 0 ? (
              filteredResults.slice(0, isMobile ? 3 : 5).map((market) => {
                const topOutcome = getTopOutcome(market);
                const eventSlug = market.events?.[0]?.slug;
                const marketUrl =
                  eventSlug && eventSlug !== market.slug
                    ? `https://polymarket.com/event/${eventSlug}/${market.slug}`
                    : `https://polymarket.com/event/${market.slug}`;
                return (
                  <a
                    key={market.id}
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
                      className={`flex-1 font-semibold text-[19px] leading-[30px] tracking-[-0.4px] text-[#1b2430] ${
                        isMobile ? "truncate" : "truncate"
                      }`}
                    >
                      {market.question}
                    </p>

                    {/* Outcome */}
                    {topOutcome && (
                      <div className="flex flex-col gap-2 items-end flex-shrink-0">
                        <p className="font-semibold text-[20px] tracking-[-0.4px] text-[#1b2430] text-right leading-[1.14]">
                          {formatOutcomePrice(topOutcome.price)}
                        </p>
                        <p className="font-medium text-[14px] tracking-[-0.28px] text-[#bbbdc1] leading-[1.14]">
                          {topOutcome.name}
                        </p>
                      </div>
                    )}
                  </a>
                );
              })
            ) : (
              <p className="text-[#808080] text-[15px] font-medium">
                No markets found for "{debouncedQuery}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
