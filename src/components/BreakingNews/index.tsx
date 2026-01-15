import { useMemo, useState } from "react";
import {
  useGetEventsQuery,
  useGetMarketsQuery,
  PolymarketEvent,
  Market,
} from "../../store/services/polymarketApi";

type TimeFilter = "1h" | "6h" | "24h";

interface NewsItem {
  id: string;
  image: string;
  title: string;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  slug: string;
  endDate: string;
  price?: number;
  outcome?: string;
}

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) return "$" + (volume / 1000000).toFixed(1) + "m Vol.";
  if (volume >= 1000) return "$" + (volume / 1000).toFixed(0) + "k Vol.";
  return "$" + volume.toFixed(0) + " Vol.";
};

const formatPrice = (price: number): string => {
  return (price * 100).toFixed(1) + "¢";
};

// const endsWithinHours = (endDate: string, hours: number): boolean => {
//   if (!endDate) return false;
//   const end = new Date(endDate);
//   const now = new Date();
//   const diffMs = end.getTime() - now.getTime();
//   const diffHours = diffMs / (1000 * 60 * 60);
//   return diffHours > 0 && diffHours <= hours;
// };

const convertEventToNews = (event: PolymarketEvent): NewsItem => {
  return {
    id: event.id,
    image: event.imageOptimized?.imageUrlOptimized || event.image || "",
    title: event.title,
    volume24hr: event.volume24hr || 0,
    volume1wk: event.volume1wk || 0,
    volume1mo: event.volume1mo || 0,
    slug: event.slug,
    endDate: event.endDate || "",
  };
};

interface BreakingNewsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreakingNews = ({ isOpen }: BreakingNewsProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");

  const { data: events } = useGetEventsQuery({
    limit: 100,
    active: true,
    order: "volume24hr",
  });

  const { data: markets } = useGetMarketsQuery({ limit: 100, active: true });

  // Create a map of event slug to market data for price info
  const marketMap = useMemo(() => {
    const map = new Map<string, Market>();
    if (markets) {
      markets.forEach((market) => {
        if (market.slug) {
          map.set(market.slug, market);
        }
      });
    }
    return map;
  }, [markets]);

  const news: NewsItem[] = useMemo(() => {
    if (!events) return [];

    const converted = events.map((event) => {
      const newsItem = convertEventToNews(event);
      // Try to find matching market for price data
      const market = marketMap.get(event.slug);
      if (market) {
        try {
          const outcomes = JSON.parse(market.outcomes);
          const prices = JSON.parse(market.outcomePrices);
          // Get the highest price outcome
          let maxPriceIndex = 0;
          let maxPrice = parseFloat(prices[0]) || 0;
          prices.forEach((p: string, i: number) => {
            const price = parseFloat(p) || 0;
            if (price > maxPrice) {
              maxPrice = price;
              maxPriceIndex = i;
            }
          });
          newsItem.price = maxPrice;
          newsItem.outcome = outcomes[maxPriceIndex] || "Yes";
        } catch {
          // Fallback values
          newsItem.price = 0.5;
          newsItem.outcome = "Yes";
        }
      }
      return newsItem;
    });

    const sortedByActivity = [...converted]
      .filter((item) => item.volume24hr > 0)
      .sort((a, b) => b.volume24hr - a.volume24hr);

    switch (timeFilter) {
      case "1h":
        return sortedByActivity.slice(0, 8);
      case "6h":
        return sortedByActivity.slice(8, 16);
      case "24h":
      default:
        return sortedByActivity.slice(16, 24);
    }
  }, [events, timeFilter, marketMap]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-[144px] md:top-[160px] left-4 md:left-8 bg-white border-t-[6px] border-[#EE1616] rounded-[14px] w-[calc(100vw-32px)] md:w-[502px] max-h-[calc(100vh-180px)] md:max-h-[70vh] overflow-hidden z-50 shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)]">
      {/* Header */}
      <div className="px-6 pt-7 pb-4">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-[32px] font-bold text-black tracking-[-0.56px] leading-8">
            Breaking News
          </h2>
          <p className="text-[#808080] text-[16px] font-medium tracking-[-0.32px]">
            Markets reacting in real time. Volatility driven by unfolding
            events.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex gap-2">
          {(["1h", "6h", "24h"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`h-12 px-6 py-3 rounded-full text-[15px] font-medium transition-colors border border-[rgba(0,0,0,0.12)] ${
                timeFilter === filter
                  ? "bg-[rgba(20,82,240,0.1)] text-[#1452F0]"
                  : "bg-white text-[#BBBDC1] hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-[#e4e4e4]" />

      {/* News List */}
      <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-380px)] md:max-h-[calc(70vh-200px)]">
        <div className="flex flex-col gap-4">
          {news.map((item) => (
            <NewsRow key={item.id} item={item} timeFilter={timeFilter} />
          ))}
        </div>
      </div>
    </div>
  );
};

const NewsRow = ({
  item,
  timeFilter,
}: {
  item: NewsItem;
  timeFilter: TimeFilter;
}) => {
  const displayVolume =
    timeFilter === "1h"
      ? item.volume24hr
      : timeFilter === "6h"
      ? item.volume1wk
      : item.volume1mo;

  const priceColor =
    item.price && item.price >= 0.5 ? "text-[#1452F0]" : "text-[#EE1616]";

  return (
    <div className="flex flex-col gap-4">
      {/* Main row: Image + Title + Price */}
      <div className="flex items-center gap-4">
        {/* Image */}
        {item.image && (
          <div className="w-9 h-9 rounded-[4.8px] overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <p className="flex-1 text-[#1B2430] font-semibold text-[19px] leading-[30px] tracking-[-0.4px]">
          {item.title}
        </p>

        {/* Price + Outcome */}
        {item.price !== undefined && (
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p
              className={`${priceColor} font-semibold text-[20px] tracking-[-0.4px]`}
            >
              {formatPrice(item.price)}
            </p>
            <p className="text-[#BBBDC1] font-medium text-[14px] tracking-[-0.28px]">
              {item.outcome}
            </p>
          </div>
        )}
      </div>

      {/* Tags row: Volume, Time filter, Chart icon - left | Pin icon - right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px]">
            {formatVolume(displayVolume)}
          </span>
          <span className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px]">
            {timeFilter === "1h"
              ? "Hourly"
              : timeFilter === "6h"
              ? "Daily"
              : "Weekly"}
          </span>
          {/* Chart icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g clipPath="url(#clip_news_row)">
              <path
                d="M14.6649 4.66626L8.99884 10.3323L5.66587 6.99934L1.33301 11.3322"
                stroke="#53BB33"
                strokeWidth="1.33319"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.6655 4.66626H14.6655V8.66626"
                stroke="#53BB33"
                strokeWidth="1.33319"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip_news_row">
                <rect width="15.9983" height="15.9983" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* Pin icon */}
        <a
          href={`https://polymarket.com/event/${item.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#BBBDC1] hover:text-[#808080] transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9.5 14.5L3 21M15 3.5L20.5 9L16.5 13L17 17L7 7L11 6.5L15 3.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e4e4e4]" />
    </div>
  );
};

export default BreakingNews;
