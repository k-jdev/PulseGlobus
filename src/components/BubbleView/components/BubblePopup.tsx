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
    ? `https://polymarket.com/event/${bubble.eventSlug}/${bubble.slug}`
    : `https://polymarket.com/event/${bubble.slug}`;

  const displayVolume = bubble.volume > 0 ? bubble.volume : bubble.volume24hr;

  const isBinary =
    outcomes.length === 2 &&
    outcomes.some((o) => o.toLowerCase() === "yes") &&
    outcomes.some((o) => o.toLowerCase() === "no");

  const yesIdx = outcomes.findIndex((o) => o.toLowerCase() === "yes");
  const noIdx = outcomes.findIndex((o) => o.toLowerCase() === "no");
  const yesPct = yesIdx >= 0 ? Math.round((prices[yesIdx] || 0) * 100) : 0;
  const noPct = noIdx >= 0 ? Math.round((prices[noIdx] || 0) * 100) : 0;
  const yesOutcome = yesIdx >= 0 ? yesIdx : undefined;
  const noOutcome = noIdx >= 0 ? noIdx : undefined;

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

          {/* Centering wrapper */}
          <div
            className="fixed z-[61] left-1/2 -translate-x-1/2"
            style={{
              top: 166,
              width: 420,
              maxWidth: "calc(100vw - 32px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="bg-white border border-[#e9edf8] rounded-[14px] shadow-2xl overflow-hidden w-full px-6 py-5"
            >
              {/* Header with image and title */}
              <div className="flex items-center gap-4 mb-4">
                {bubble.image && (
                  <div className="w-[54px] h-[54px] rounded-[7px] overflow-hidden flex-shrink-0">
                    <img
                      src={bubble.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-[19px] font-semibold text-[#1b2430] leading-[30px] tracking-[-0.4px] flex-1">
                  {bubble.title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0 self-start"
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
              </div>

              {/* Binary Yes/No or Multi-outcome */}
              {isBinary &&
              yesOutcome !== undefined &&
              noOutcome !== undefined ? (
                <div className="flex flex-col gap-3 mb-4">
                  {/* Chance row with progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center">
                      <span className="text-[16px] font-medium tracking-[-0.32px]">
                        <span className="text-[#1b2430]">Chance </span>
                        <span className="text-[#bbbdc1]">%</span>
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-[#1b2430] text-[20px] font-semibold tracking-[-0.4px]">
                        {yesPct}%
                      </span>
                      <div className="flex-1 h-[6px] bg-[#ececec] rounded-[41px] overflow-hidden">
                        <div
                          className="h-full bg-[#1452f0]"
                          style={{ width: `${yesPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Buy/Sell buttons */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-[46px] bg-[#f1f7ff] rounded-[4px] flex items-center justify-center">
                      <span className="text-[#1452f0] text-[16px] font-semibold tracking-[-0.32px]">
                        {yesPct}¢
                      </span>
                    </div>
                    <div className="flex-1 h-[46px] bg-[#ffebeb] rounded-[4px] flex items-center justify-center">
                      <span className="text-[#ee1616] text-[16px] font-semibold tracking-[-0.32px]">
                        {noPct}¢
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                outcomes.length > 0 && (
                  <div
                    className={`flex flex-col gap-3 mb-4 ${
                      outcomes.length > 2 ? "max-h-[100px] overflow-y-auto" : ""
                    }`}
                  >
                    {outcomes.slice(0, 6).map((outcome, idx) => {
                      const price = prices[idx] || 0;
                      const pct = Math.round(price * 100);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <span
                            className="text-[#1b2430] text-[16px] font-medium tracking-[-0.32px] truncate max-w-[140px]"
                            title={outcome}
                          >
                            {outcome}
                          </span>
                          <div className="flex items-center gap-[10px]">
                            <span className="text-[#1b2430] text-[20px] font-semibold tracking-[-0.4px]">
                              {pct}%
                            </span>
                            <div className="flex items-center gap-[6px]">
                              <div className="w-[54px] bg-[#f1f7ff] rounded-[4px] px-3 py-[10px] flex items-center justify-center">
                                <span className="text-[#1452f0] text-[14px] font-semibold tracking-[-0.28px]">
                                  {pct}¢
                                </span>
                              </div>
                              <div className="w-[54px] bg-[#ffebeb] rounded-[4px] px-3 py-[10px] flex items-center justify-center">
                                <span className="text-[#ee1616] text-[14px] font-semibold tracking-[-0.28px]">
                                  {100 - pct}¢
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Volume and metadata */}
              <div className="flex flex-col gap-3">
                <div className="h-px bg-[#e4e4e4] w-full" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[6px]">
                    <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
                      <span className="text-[#808080] text-[14px] font-medium leading-[21px] tracking-[-0.28px]">
                        {formatVolume(displayVolume)} Vol.
                      </span>
                    </div>
                    {bubble.volume24hr > 0 && (
                      <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
                        <span className="text-[#808080] text-[14px] font-medium leading-[21px] tracking-[-0.28px]">
                          24h: {formatVolume(bubble.volume24hr)}
                        </span>
                      </div>
                    )}
                    {/* Trend icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M14.6649 4.66626L8.99884 10.3323L5.66587 6.99934L1.33301 11.3322"
                        stroke="#53BB33"
                        strokeWidth="1.33"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.6655 4.66626H14.6655V8.66626"
                        stroke="#53BB33"
                        strokeWidth="1.33"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href={polymarketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full mt-3 px-6 py-4 bg-[#1452f0] rounded-full text-white hover:bg-[#1240c0] transition-colors"
              >
                <span className="text-[16px] font-semibold tracking-[-0.32px]">
                  View market
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
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
