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
  eventSlug?: string;
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

  const eventSlug = market.events?.[0]?.slug;

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
    eventSlug: eventSlug,
  };
};

interface LiveTradesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTrades = ({ isOpen }: LiveTradesProps) => {
  const [timeFilter] = useState<"2m" | "5m" | "15m">("2m");
  const { data: markets } = useGetMarketsQuery({ limit: 20, active: true });

  const trades: TradeItem[] =
    markets?.slice(0, 10).map(convertMarketToTrade) || [];
  const tradesCount = trades.length;

  if (!isOpen) return null;

  return (
    <div className="absolute top-[144px] md:top-[160px] left-4 md:left-8 bg-white rounded-[14px] w-[calc(100vw-32px)] md:w-[502px] max-h-[calc(100vh-180px)] md:max-h-[70vh] border-t-[6px] border-[#53BB33] overflow-hidden z-50 animate-in slide-in-from-left duration-300 shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)]">
      {/* Header */}
      <div className="px-6 pt-7 pb-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-[28px] md:text-[32px] font-bold text-black tracking-[-0.56px] leading-8">
                Live Trades <span className="text-[#4EB12F]">•</span>
              </h2>
              <p className="text-[#808080] text-[14px] md:text-[16px] font-medium tracking-[-0.32px]">
                Streaming Pulse globe markets.
              </p>
            </div>
            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-1.5">
              <div className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px]">
                {tradesCount} Trades
              </div>
              <div className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px]">
                {timeFilter}
              </div>
              {/* Chart icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 11L5.5 7.5L8 10L14 4"
                  stroke="#808080"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 4H14V8"
                  stroke="#808080"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <div className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[13px] font-medium tracking-[-0.28px]">
              {tradesCount} Trades
            </div>
            <div className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[13px] font-medium tracking-[-0.28px]">
              {timeFilter}
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 11L5.5 7.5L8 10L14 4"
                stroke="#808080"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 4H14V8"
                stroke="#808080"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-[#e4e4e4]" />

      {/* Trades List */}
      <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-380px)] md:max-h-[calc(70vh-140px)]">
        <div className="flex flex-col gap-4">
          {trades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TradeRow = ({ trade }: { trade: TradeItem }) => {
  const isBuy = trade.action === "Buy";
  const priceColor = isBuy ? "text-[#1452F0]" : "text-[#EE1616]";
  const actionBgColor = isBuy ? "bg-[#f1f7ff]" : "bg-[#ffebeb]";
  const actionTextColor = isBuy ? "text-[#1452F0]" : "text-[#EE1616]";

  return (
    <div className="flex flex-col gap-4">
      {/* Main row: Image + Question + Price */}
      <div className="flex items-center gap-4">
        {/* Image */}
        {trade.image && (
          <div className="w-9 h-9 rounded-[4.8px] overflow-hidden flex-shrink-0">
            <img
              src={trade.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Question */}
        <p className="flex-1 text-[#1B2430] font-semibold text-[19px] leading-[30px] tracking-[-0.4px]">
          {trade.question}
        </p>

        {/* Price + Amount */}
        <div className="flex flex-col items-end gap-2">
          <p
            className={`${priceColor} font-semibold text-[20px] tracking-[-0.4px]`}
          >
            {trade.price}
          </p>
          <p className="text-[#BBBDC1] font-medium text-[14px] tracking-[-0.28px]">
            {trade.amount}
          </p>
        </div>
      </div>

      {/* Tags row: Buy/Sell, Outcome, Time - left | View market - right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-3 py-1 rounded-full text-[14px] font-semibold tracking-[-0.28px] ${actionBgColor} ${actionTextColor}`}
          >
            {trade.action}
          </span>
          <span className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px]">
            {trade.outcome}
          </span>
          <span className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px]">
            {trade.timeAgo}
          </span>
        </div>

        {/* View market button */}
        <a
          href={
            trade.eventSlug && trade.eventSlug !== trade.slug
              ? `https://polymarket.com/event/${trade.eventSlug}/${trade.slug}`
              : `https://polymarket.com/event/${trade.slug}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 bg-[#f5f5f5] rounded-full text-[#808080] text-[14px] font-medium tracking-[-0.28px] hover:bg-[#e9e9e9] transition-colors"
        >
          View market
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.30237 17.5502L15.3248 10.5278L15.3155 16.625C15.3155 16.9734 15.4539 17.3076 15.7003 17.554C15.9467 17.8004 16.2809 17.9388 16.6293 17.9388C16.9777 17.9388 17.3119 17.8004 17.5583 17.554C17.8047 17.3076 17.9431 16.9734 17.9431 16.625L17.9431 7.37285C17.9393 7.20063 17.9016 7.03084 17.8321 6.87323C17.6994 6.55544 17.4467 6.30279 17.1289 6.17007C16.9713 6.10053 16.8015 6.0628 16.6293 6.05904L7.37715 6.05905C7.20442 6.05834 7.03326 6.09184 6.87354 6.15761C6.71383 6.22338 6.56871 6.32013 6.44657 6.44227C6.32443 6.56441 6.22769 6.70952 6.16191 6.86924C6.09614 7.02896 6.06264 7.20012 6.06335 7.37285C6.06264 7.54558 6.09614 7.71674 6.16191 7.87646C6.22769 8.03618 6.32443 8.18129 6.44657 8.30343C6.56871 8.42557 6.71383 8.52232 6.87354 8.58809C7.03326 8.65386 7.20442 8.68736 7.37715 8.68666L13.4743 8.6774L6.45194 15.6998C6.20656 15.9452 6.0687 16.278 6.0687 16.625C6.0687 16.972 6.20656 17.3048 6.45194 17.5502C6.69732 17.7956 7.03013 17.9335 7.37715 17.9335C7.72418 17.9335 8.05699 17.7956 8.30237 17.5502Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e4e4e4]" />
    </div>
  );
};

export default LiveTrades;
