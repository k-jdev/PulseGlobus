import { FC, useState } from "react";
import { motion } from "framer-motion";

type TabType = "article" | "markets";

interface RelatedMarketItem {
  id: string;
  title: string;
  image?: string;
  slug: string;
  eventSlug?: string;
  outcomePrices: number[];
  outcomes: string[];
  coordinates: [number, number];
}

interface NewsMarkerProps {
  title: string;
  image?: string;
  url: string;
  domain?: string;
  sourcecountry?: string;
  seendate?: string;
  onClose?: () => void;
  isMobile?: boolean;
  relatedMarkets?: RelatedMarketItem[];
  onMarketClick?: (marketId: string, coordinates: [number, number]) => void;
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "";

  // GDELT format: 20260116T013000Z
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(9, 11);
  const minute = dateStr.substring(11, 13);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number): string => {
  return (price * 100).toFixed(0) + "¢";
};

export const NewsMarker: FC<NewsMarkerProps> = ({
  title,
  image,
  url,
  domain,
  sourcecountry,
  seendate,
  onClose,
  isMobile = false,
  relatedMarkets = [],
  onMarketClick,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("article");

  const tabs: { id: TabType; label: string }[] = [
    { id: "article", label: "Article" },
    {
      id: "markets",
      label: `Markets${relatedMarkets.length > 0 ? ` (${relatedMarkets.length})` : ""}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`bg-white rounded-[14px] shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)] overflow-hidden ${
        isMobile ? "w-full" : "w-[420px]"
      }`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 w-[24px] h-[24px] flex items-center justify-center text-[#adadad] hover:text-gray-600 transition-colors z-10 bg-white/80 rounded-full"
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

      <div className={`${isMobile ? "px-5 py-4" : "px-6 py-5"}`}>
        {/* Header with image and title - always visible */}
        <div className="flex items-start gap-4 mb-4 pr-8">
          {image && (
            <div className="w-[54px] h-[54px] rounded-[7px] overflow-hidden flex-shrink-0">
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <h3 className="text-[17px] font-semibold text-[#1b2430] leading-[24px] tracking-[-0.3px] flex-1 line-clamp-3">
            {title}
          </h3>
        </div>

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

        {/* Article Tab */}
        {activeTab === "article" && (
          <div className="flex flex-col gap-3">
            {/* Meta info */}
            <div className="flex items-center gap-[6px] flex-wrap">
              {domain && (
                <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
                  <span className="text-[#808080] text-[14px] font-medium leading-[21px] tracking-[-0.28px]">
                    {domain}
                  </span>
                </div>
              )}
              {sourcecountry && (
                <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
                  <span className="text-[#808080] text-[14px] font-medium leading-[21px] tracking-[-0.28px]">
                    {sourcecountry}
                  </span>
                </div>
              )}
              {seendate && (
                <div className="flex items-center gap-1 px-3 py-1 bg-[#f1f7ff] rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1452f0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-[#1452f0] text-[14px] font-medium leading-[21px] tracking-[-0.28px]">
                    {formatDate(seendate)}
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full mt-2 px-6 py-4 bg-[#1452f0] rounded-full text-white hover:bg-[#1240c0] transition-colors"
            >
              <span className="text-[16px] font-semibold tracking-[-0.32px]">
                Read full article
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
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

        {/* Markets Tab */}
        {activeTab === "markets" && (
          <div className="flex flex-col gap-3">
            {relatedMarkets.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto">
                {relatedMarkets.map((market) => {
                  const yesIndex = market.outcomes.findIndex(
                    (o) => o.toLowerCase() === "yes",
                  );
                  const yesPrice =
                    yesIndex !== -1
                      ? market.outcomePrices[yesIndex]
                      : market.outcomePrices[0];

                  return (
                    <button
                      key={market.id}
                      onClick={() => {
                        if (onMarketClick) {
                          onMarketClick(market.id, market.coordinates);
                        }
                      }}
                      className="flex gap-3 p-3 bg-[#f8f9fb] rounded-[10px] hover:bg-[#f0f2f5] transition-colors group text-left w-full"
                    >
                      {market.image && (
                        <div className="w-[48px] h-[48px] rounded-[6px] overflow-hidden flex-shrink-0">
                          <img
                            src={market.image}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-medium text-[#1b2430] leading-[18px] tracking-[-0.28px] line-clamp-2 group-hover:text-[#1452f0] transition-colors">
                          {market.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[12px] font-semibold text-[#22c55e] tracking-[-0.24px]">
                            Yes {formatPrice(yesPrice)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-[14px] font-medium text-[#808080] tracking-[-0.28px]">
                  No related markets found
                </span>
                <span className="text-[12px] text-[#bbbdc1] tracking-[-0.24px] mt-1">
                  Prediction markets related to this news will appear here
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
