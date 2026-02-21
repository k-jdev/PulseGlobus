import { motion, AnimatePresence } from "framer-motion";
import { formatVolume } from "../utils/formatVolume";
import type { PositionedBubble } from "../types";

interface BubblePopupProps {
  bubble: PositionedBubble | null;
  onClose: () => void;
}

export default function BubblePopup({ bubble, onClose }: BubblePopupProps) {
  if (!bubble) return null;

  const outcomes = bubble.outcomes || [];
  const prices = bubble.outcomePrices || [];
  const polymarketUrl = bubble.eventSlug
    ? `https://polymarket.com/event/${bubble.eventSlug}`
    : `https://polymarket.com/market/${bubble.slug}`;

  return (
    <AnimatePresence>
      {bubble && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-5 pb-3">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1L13 13M13 1L1 13"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Image & Title */}
              <div className="flex items-start gap-3 pr-8">
                {bubble.image && (
                  <img
                    src={bubble.image}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-[16px] text-black leading-tight">
                    {bubble.title}
                  </h3>
                  <span className="text-[13px] text-gray-500 capitalize">
                    {bubble.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Volume Stats */}
            <div className="px-5 pb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-black">
                  {formatVolume(bubble.volume)}
                </span>
                <span className="text-[13px] text-gray-400">Vol.</span>
                {bubble.volume24hr > 0 && (
                  <>
                    <span className="text-[13px] text-gray-400 ml-2">
                      24h: {formatVolume(bubble.volume24hr)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Outcomes */}
            {outcomes.length > 0 && (
              <div className="px-5 pb-4 space-y-2">
                {outcomes.slice(0, 6).map((outcome, idx) => {
                  const price = prices[idx] || 0;
                  const pct = Math.round(price * 100);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-medium text-gray-800 truncate">
                            {outcome}
                          </span>
                          <span className="text-[13px] font-bold text-black ml-2">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                idx === 0
                                  ? "#22c55e"
                                  : idx === 1
                                    ? "#ef4444"
                                    : "#3b82f6",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Description */}
            {bubble.description && (
              <div className="px-5 pb-4">
                <p className="text-[13px] text-gray-500 line-clamp-3 leading-relaxed">
                  {bubble.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-2">
              <a
                href={polymarketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 bg-[#1452f0] hover:bg-[#1040d0] text-white rounded-xl font-semibold text-[14px] flex items-center justify-center transition-colors"
              >
                Trade on Polymarket
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
