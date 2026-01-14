import { useState } from "react";
import { useGetMarketsQuery, Market } from "../../store/services/polymarketApi";

interface NewsItem {
  id: string;
  image: string;
  question: string;
  price: string;
  outcome: string;
  volume: string;
  slug: string;
}

const formatPrice = (price: number): string => {
  return (price * 100).toFixed(1) + "¢";
};

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) return "$" + (volume / 1000000).toFixed(0) + "m Vol.";
  if (volume >= 1000) return "$" + (volume / 1000).toFixed(0) + "k Vol.";
  return "$" + volume.toFixed(0) + " Vol.";
};

const convertMarketToNews = (market: Market): NewsItem => {
  const outcomes = JSON.parse(market.outcomes || '["Yes", "No"]');
  const prices = JSON.parse(market.outcomePrices || "[0.5, 0.5]");
  const maxPriceIndex = prices.indexOf(Math.max(...prices));
  const price = prices[maxPriceIndex] || 0.5;
  const volume = market.volumeNum || parseFloat(market.volume) || 0;

  return {
    id: market.id,
    image: market.imageOptimized?.imageUrlOptimized || market.image || "",
    question: market.question,
    price: formatPrice(price),
    outcome: outcomes[maxPriceIndex] || "Yes",
    volume: formatVolume(volume),
    slug: market.slug,
  };
};

interface BreakingNewsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreakingNews = ({ isOpen, onClose }: BreakingNewsProps) => {
  const [timeFilter, setTimeFilter] = useState<"1h" | "6h" | "24h">("24h");
  const { data: markets } = useGetMarketsQuery({ limit: 20, active: true });

  const news: NewsItem[] = markets?.slice(0, 8).map(convertMarketToNews) || [];

  if (!isOpen) return null;

  return (
    <div className="absolute top-[160px] left-8 bg-white border-t-[6px] border-[#EE1616] rounded-[14px] w-[502px] max-h-[70vh] overflow-hidden z-50">
      {/* Header */}
      <div className="p-6 pb-4">
        <h2 className="text-[28px] font-bold text-[#1B2430] mb-1">
          Breaking News
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Markets reacting in real time. Volatility driven by unfolding events.
        </p>

        {/* Time filters */}
        <div className="flex gap-2">
          {(["1h", "6h", "24h"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border ${
                timeFilter === filter
                  ? "bg-[#1452F01A] text-[#1452F0] border-[#0000001F]"
                  : "bg-white text-[#BBBDC1] border-[#0000001F] hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-180px)]">
        <div className="space-y-2">
          {news.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

const NewsRow = ({ item }: { item: NewsItem }) => {
  return (
    <a
      href={`https://polymarket.com/event/${item.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2 cursor-pointer"
    >
      {/* Image */}
      {item.image && (
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <img src={item.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[#1B2430] font-semibold text-[15px] leading-tight mb-2 line-clamp-2">
          {item.question}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 text-xs font-medium">
            {item.volume}
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 text-xs font-medium">
            Weekly
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
          >
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
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="text-[#1452F0] font-bold text-lg">{item.price}</p>
        <p className="text-gray-400 text-xs">{item.outcome}</p>
      </div>

      {/* Pin icon */}
      <div className="text-gray-300 flex-shrink-0 mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 4.5L11 8.5L7 10L5.5 11.5L12.5 18.5L14 17L15.5 13L19.5 9M9 15L4.5 19.5M14.5 4L20 9.5"
            stroke="#BBBDC1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </a>
  );
};

export default BreakingNews;
