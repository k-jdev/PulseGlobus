import { useState } from "react";
import { useGetMarketsQuery, Market } from "../../store/services/polymarketApi";

interface NewsItem {
  id: string;
  image: string;
  question: string;
  price: string;
  priceNum: number;
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
    priceNum: price,
    outcome: outcomes[maxPriceIndex] || "Yes",
    volume: formatVolume(volume),
    slug: market.slug,
  };
};

interface BreakingNewsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreakingNews = ({ isOpen }: BreakingNewsProps) => {
  const [timeFilter, setTimeFilter] = useState<"1h" | "6h" | "24h">("24h");
  const { data: markets } = useGetMarketsQuery({ limit: 20, active: true });

  const news: NewsItem[] = markets?.slice(0, 8).map(convertMarketToNews) || [];

  if (!isOpen) return null;

  return (
    <div className="absolute top-[160px] left-8 bg-white border-t-[6px] border-[#EE1616] rounded-[14px] w-[502px] max-h-[70vh] overflow-hidden z-50 shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)]">
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
      <div className="px-6 py-4 overflow-y-auto max-h-[calc(70vh-200px)]">
        <div className="flex flex-col gap-4">
          {news.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

const NewsRow = ({ item }: { item: NewsItem }) => {
  // Цена красная если меньше 50%, иначе синяя
  const priceColor = item.priceNum < 0.5 ? "text-[#EE1616]" : "text-[#1452F0]";

  return (
    <div className="flex flex-col gap-4">
      {/* Main row: Image + Question + Price */}
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

        {/* Question */}
        <p className="flex-1 text-[#1B2430] font-semibold text-[19px] leading-[30px] tracking-[-0.4px]">
          {item.question}
        </p>

        {/* Price + Outcome */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p
            className={`${priceColor} font-semibold text-[20px] tracking-[-0.4px]`}
          >
            {item.price}
          </p>
          <p className="text-[#BBBDC1] font-medium text-[14px] tracking-[-0.28px]">
            {item.outcome}
          </p>
        </div>
      </div>

      {/* Tags row: Volume, Weekly, Chart icon - left | Pin icon - right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px]">
            {item.volume}
          </span>
          <span className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px]">
            Weekly
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
              d="M15 4.5L11 8.5L7 10L5.5 11.5L12.5 18.5L14 17L15.5 13L19.5 9M9 15L4.5 19.5M14.5 4L20 9.5"
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
