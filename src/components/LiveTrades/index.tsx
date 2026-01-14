import { useState } from "react";
import { useGetMarketsQuery, Market } from "../../store/services/polymarketApi";

interface TradeItem {
  id: string;
  image: string;
  question: string;
  price: string;
  amount: string;
  action: "Buy" | "Sell";
  outcome: string;
  timeAgo: string;
  slug: string;
}

const formatPrice = (price: number): string => {
  return (price * 100).toFixed(1) + "¢";
};

const formatAmount = (amount: number): string => {
  return "$" + amount.toFixed(0);
};

const getRandomTimeAgo = (): string => {
  const seconds = Math.floor(Math.random() * 30) + 1;
  return `${seconds}s ago`;
};

const convertMarketToTrade = (market: Market): TradeItem => {
  const outcomes = JSON.parse(market.outcomes);
  const prices = JSON.parse(market.outcomePrices);
  const randomOutcomeIndex = Math.floor(Math.random() * outcomes.length);
  const price = prices[randomOutcomeIndex] || 0.5;

  return {
    id: market.id,
    image: market.imageOptimized?.imageUrlOptimized || market.image || "",
    question: market.question,
    price: formatPrice(price),
    amount: formatAmount(Math.floor(Math.random() * 500) + 50),
    action: Math.random() > 0.5 ? "Buy" : "Sell",
    outcome: outcomes[randomOutcomeIndex] || "Yes",
    timeAgo: getRandomTimeAgo(),
    slug: market.slug,
  };
};

interface LiveTradesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTrades = ({ isOpen, onClose }: LiveTradesProps) => {
  const [timeFilter, setTimeFilter] = useState<"2m" | "5m" | "15m">("2m");
  const { data: markets } = useGetMarketsQuery({ limit: 20, active: true });

  const trades: TradeItem[] =
    markets?.slice(0, 10).map(convertMarketToTrade) || [];
  const tradesCount = trades.length;

  if (!isOpen) return null;

  return (
    <div className="absolute top-[160px] left-8 bg-white rounded-[14px] w-[502px] max-h-[70vh] border-t-[6px] border-[#53BB33] overflow-hidden z-50 animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-[28px] font-bold text-[#1B2430]">
              Live Trades
            </h2>
            <div className="w-2 h-2 bg-[#53BB33] rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium">
              {tradesCount} Trades
            </div>
            <div className="flex gap-1">
              {(["2m", "5m", "15m"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600"
                  }`}
                  aria-pressed={timeFilter === filter}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-sm">Streaming Pulse globe markets.</p>
      </div>

      {/* Trades List */}
      <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        <div className="space-y-1">
          {trades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} />
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

const TradeRow = ({ trade }: { trade: TradeItem }) => {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2">
      {/* Left: Image */}
      {trade.image && (
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={trade.image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Middle: Question + Tags */}
      <div className="flex-1 min-w-0">
        <p className="text-[#1B2430] font-semibold text-[15px] leading-tight mb-2 line-clamp-2">
          {trade.question}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              trade.action === "Buy"
                ? "bg-[#1452F0]/10 text-[#1452F0]"
                : "bg-[#EE1616]/10 text-[#EE1616]"
            }`}
          >
            {trade.action}
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-xs font-medium">
            {trade.outcome}
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-500 text-xs">
            {trade.timeAgo}
          </span>
        </div>
      </div>

      {/* Right: Price + Amount + View market */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-[#1452F0] font-bold text-lg">{trade.price}</p>
          <p className="text-gray-400 text-sm">{trade.amount}</p>
        </div>

        {/* View market button */}
        <a
          href={`https://polymarket.com/event/${trade.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-[#1452F0] hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
        >
          View market
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M8.30237 17.5502L15.3248 10.5278L15.3155 16.625C15.3155 16.9734 15.4539 17.3076 15.7003 17.554C15.9467 17.8004 16.2809 17.9388 16.6293 17.9388C16.9777 17.9388 17.3119 17.8004 17.5583 17.554C17.8047 17.3076 17.9431 16.9734 17.9431 16.625L17.9431 7.37285C17.9393 7.20063 17.9016 7.03084 17.8321 6.87323C17.6994 6.55544 17.4467 6.30279 17.1289 6.17007C16.9713 6.10053 16.8015 6.0628 16.6293 6.05904L7.37715 6.05905C7.20442 6.05834 7.03326 6.09184 6.87354 6.15761C6.71383 6.22338 6.56871 6.32013 6.44657 6.44227C6.32443 6.56441 6.22769 6.70952 6.16191 6.86924C6.09614 7.02896 6.06264 7.20012 6.06335 7.37285C6.06264 7.54558 6.09614 7.71674 6.16191 7.87646C6.22769 8.03618 6.32443 8.18129 6.44657 8.30343C6.56871 8.42557 6.71383 8.52232 6.87354 8.58809C7.03326 8.65386 7.20442 8.68736 7.37715 8.68666L13.4743 8.6774L6.45194 15.6998C6.20656 15.9452 6.0687 16.278 6.0687 16.625C6.0687 16.972 6.20656 17.3048 6.45194 17.5502C6.69732 17.7956 7.03013 17.9335 7.37715 17.9335C7.72418 17.9335 8.05699 17.7956 8.30237 17.5502Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default LiveTrades;
