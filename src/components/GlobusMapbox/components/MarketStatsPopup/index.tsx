import { FC, useState } from "react";

type TabType = "price" | "stats" | "rules";

interface OutcomeData {
  name: string;
  price: number;
}

interface MarketStatsPopupProps {
  title: string;
  image?: string;
  outcomes: OutcomeData[];
  volume: number;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  liquidity: number;
  endDate: string;
  description: string;
  slug: string;
  eventSlug?: string;
  onClose?: () => void;
}

const formatCurrency = (num: number): string => {
  if (num >= 1000000) return "$" + (num / 1000000).toFixed(1) + "m";
  if (num >= 1000) return "$" + Math.round(num / 1000) + "k";
  return "$" + Math.round(num);
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "m";
  if (num >= 1000) return Math.round(num / 1000) + "k";
  return Math.round(num).toString();
};

const formatCents = (price: number): string => {
  return (price * 100).toFixed(1) + "¢";
};

const formatTimeUntil = (endDate: string): string => {
  if (!endDate) return "—";

  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return "Closed";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h`;
};

export const MarketStatsPopup: FC<MarketStatsPopupProps> = ({
  title,
  image,
  outcomes,
  volume24hr,
  volume1wk,
  volume1mo,
  liquidity,
  endDate,
  description,
  slug,
  eventSlug,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("price");

  const tabs: { id: TabType; label: string }[] = [
    { id: "price", label: "Price" },
    { id: "stats", label: "Stats" },
    { id: "rules", label: "Rules" },
  ];

  const topOutcome =
    outcomes.length > 0
      ? outcomes.reduce(
          (max, o) => (o.price > max.price ? o : max),
          outcomes[0]
        )
      : null;

  return (
    <div className="bg-white rounded-[14px] shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)] w-[465px] overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 w-[17px] h-[17px] flex items-center justify-center text-[#adadad] hover:text-gray-600 transition-colors z-10"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1 1L11 11M1 11L11 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="px-6 py-5">
        {/* Tabs */}
        <div className="flex w-full mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 pb-2 text-center text-[16px] tracking-[-0.4px] leading-[30px] border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-[#1452f0] border-[#1452f0] font-semibold"
                  : "text-[#808080] border-[#e4e4e4] font-medium hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Price Tab */}
        {activeTab === "price" && (
          <div className="flex flex-col gap-4">
            {/* Header with image and title */}
            <div className="flex gap-4 items-center">
              {image && (
                <div className="w-9 h-9 rounded-[4.8px] overflow-hidden flex-shrink-0">
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="flex-1 text-[19px] font-semibold text-[#1b2430] leading-[30px] tracking-[-0.4px]">
                {title}
              </h3>
              {topOutcome && (
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[20px] font-semibold text-[#ee1616] tracking-[-0.4px]">
                    {formatCents(topOutcome.price)}
                  </span>
                  <span className="text-[14px] font-medium text-[#bbbdc1] tracking-[-0.28px]">
                    {topOutcome.name}
                  </span>
                </div>
              )}
            </div>

            {/* Outcomes list */}
            <div className="flex flex-col gap-2">
              {outcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b border-[#e4e4e4] last:border-b-0"
                >
                  <span className="text-[16px] font-medium text-[#1b2430]">
                    {outcome.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] font-semibold text-[#1b2430]">
                      {(outcome.price * 100).toFixed(0)}%
                    </span>
                    <span
                      className={`text-[14px] font-semibold px-3 py-1 rounded ${
                        outcome.price >= 0.5
                          ? "text-[#1452f0] bg-[#1452f0]/10"
                          : "text-[#808080] bg-gray-100"
                      }`}
                    >
                      {formatCents(outcome.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between pt-4 border-t border-[#e4e4e4]">
              <div className="flex items-center gap-[6px]">
                <span className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[14px] font-medium text-[#808080] leading-[21px] tracking-[-0.28px]">
                  {formatCurrency(volume24hr)} Vol.
                </span>
                <span className="px-3 py-1 bg-[#f5f5f5] rounded-full text-[14px] font-medium text-[#808080] leading-[21px] tracking-[-0.28px]">
                  {formatTimeUntil(endDate)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="flex flex-col gap-4">
            {/* Row 1: Liquidity & 24h Volume */}
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2 py-2 border-b border-[#e4e4e4]">
                <span className="text-[24px] font-semibold text-black tracking-[-0.56px]">
                  {formatCurrency(liquidity)}
                </span>
                <span className="text-[14px] font-medium text-[#808080] tracking-[-0.32px]">
                  Liquidity
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-2 py-2 border-b border-[#e4e4e4]">
                <span className="text-[24px] font-semibold text-black tracking-[-0.56px]">
                  {formatCurrency(volume24hr)}
                </span>
                <span className="text-[14px] font-medium text-[#808080] tracking-[-0.32px]">
                  24h Volume
                </span>
              </div>
            </div>

            {/* Row 2: Closes In & 1w Volume */}
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2 py-2 border-b border-[#e4e4e4]">
                <span className="text-[24px] font-semibold text-black tracking-[-0.56px]">
                  {formatTimeUntil(endDate)}
                </span>
                <span className="text-[14px] font-medium text-[#808080] tracking-[-0.32px]">
                  Closes In
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-2 py-2 border-b border-[#e4e4e4]">
                <span className="text-[24px] font-semibold text-black tracking-[-0.56px]">
                  {formatCurrency(volume1wk)}
                </span>
                <span className="text-[14px] font-medium text-[#808080] tracking-[-0.32px]">
                  1w Volume
                </span>
              </div>
            </div>

            {/* Row 3: 1m Volume */}
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2 py-2">
                <span className="text-[24px] font-semibold text-black tracking-[-0.56px]">
                  {formatNumber(
                    outcomes.reduce(
                      (sum, o) => sum + (o.price > 0 ? 1000 : 0),
                      0
                    )
                  )}
                </span>
                <span className="text-[14px] font-medium text-[#808080] tracking-[-0.32px]">
                  Shares
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-2 py-2">
                <span className="text-[24px] font-semibold text-black tracking-[-0.56px]">
                  {formatCurrency(volume1mo)}
                </span>
                <span className="text-[14px] font-medium text-[#808080] tracking-[-0.32px]">
                  1m Volume
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href={
                eventSlug && eventSlug !== slug
                  ? `https://polymarket.com/event/${eventSlug}/${slug}`
                  : `https://polymarket.com/event/${slug}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-6 py-4 bg-[#1452f0] rounded-full text-white hover:bg-[#1240c0] transition-colors"
            >
              <span className="text-[16px] font-semibold tracking-[-0.32px]">
                See full analysis
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17L17 7M17 7H7M17 7V17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === "rules" && (
          <div className="flex flex-col gap-4">
            <div className="text-[16px] font-medium text-[#808080] leading-[24px] tracking-[-0.32px] whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {description || "No rules available for this market."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketStatsPopup;
