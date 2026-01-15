import { FC } from "react";

interface Outcome {
  name: string;
  percentage: number;
  buyPrice: string;
  sellPrice: string;
  volume?: number;
  marketSlug?: string;
}

interface MarketPopupProps {
  title: string;
  image?: string;
  outcomes: Outcome[];
  volume?: number;
  volume24hr: number;
  slug: string;
  eventSlug?: string;
  isMultiMarket?: boolean;
}

const formatCurrency = (num: number): string => {
  if (num >= 1000000) return "$" + (num / 1000000).toFixed(1) + "m";
  if (num >= 1000) return "$" + Math.round(num / 1000) + "k";
  return "$" + Math.round(num);
};

export const MarketPopup: FC<MarketPopupProps> = ({
  title,
  image,
  outcomes,
  volume,
  volume24hr,
  slug,
  eventSlug,
}) => {
  const displayVolume = volume && volume > 0 ? volume : volume24hr;

  const isBinaryMarket =
    outcomes.length === 2 &&
    outcomes.some((o) => o.name.toLowerCase() === "yes") &&
    outcomes.some((o) => o.name.toLowerCase() === "no");

  const yesOutcome = outcomes.find((o) => o.name.toLowerCase() === "yes");
  const noOutcome = outcomes.find((o) => o.name.toLowerCase() === "no");

  return (
    <div className="bg-white border border-[#e9edf8] rounded-[14px] px-6 py-5 min-w-[360px] max-w-[420px]">
      {/* Header with image and title */}
      <div className="flex items-center gap-4 mb-4">
        {image && (
          <div className="w-[54px] h-[54px] rounded-[7px] overflow-hidden flex-shrink-0">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <h3 className="text-[19px] font-semibold text-[#1b2430] leading-[30px] tracking-[-0.4px] flex-1">
          {title}
        </h3>
      </div>

      {/* Binary Yes/No market display */}
      {isBinaryMarket && yesOutcome && noOutcome ? (
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
                {yesOutcome.percentage}%
              </span>
              <div className="flex-1 h-[6px] bg-[#ececec] rounded-[41px] overflow-hidden">
                <div
                  className="h-full bg-[#1452f0]"
                  style={{ width: `${yesOutcome.percentage}%` }}
                />
              </div>
            </div>
          </div>
          {/* Buy/Sell buttons */}
          <div className="flex gap-2">
            <div className="flex-1 h-[46px] bg-[#f1f7ff] rounded-[4px] flex items-center justify-center">
              <span className="text-[#1452f0] text-[16px] font-semibold tracking-[-0.32px]">
                {yesOutcome.buyPrice}
              </span>
            </div>
            <div className="flex-1 h-[46px] bg-[#ffebeb] rounded-[4px] flex items-center justify-center">
              <span className="text-[#ee1616] text-[16px] font-semibold tracking-[-0.32px]">
                {noOutcome.buyPrice}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col gap-3 mb-4 ${
            outcomes.length > 2 ? "max-h-[100px] overflow-y-auto" : ""
          }`}
        >
          {outcomes.map((outcome, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span
                className="text-[#1b2430] text-[16px] font-medium tracking-[-0.32px] truncate max-w-[140px]"
                title={outcome.name}
              >
                {outcome.name}
              </span>
              <div className="flex items-center gap-[10px]">
                <span className="text-[#1b2430] text-[20px] font-semibold tracking-[-0.4px]">
                  {outcome.percentage}%
                </span>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[54px] bg-[#f1f7ff] rounded-[4px] px-3 py-[10px] flex items-center justify-center">
                    <span className="text-[#1452f0] text-[14px] font-semibold tracking-[-0.28px]">
                      {outcome.buyPrice}
                    </span>
                  </div>
                  <div className="w-[54px] bg-[#ffebeb] rounded-[4px] px-3 py-[10px] flex items-center justify-center">
                    <span className="text-[#ee1616] text-[14px] font-semibold tracking-[-0.28px]">
                      {outcome.sellPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volume and metadata */}
      <div className="flex flex-col gap-3">
        <div className="h-px bg-[#e4e4e4] w-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
              <span className="text-[#808080] text-[14px] font-medium leading-[21px] tracking-[-0.28px]">
                {formatCurrency(displayVolume)} Vol.
              </span>
            </div>
            <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
              <span className="text-[#808080] text-[14px] font-medium leading-[21px] tracking-[-0.28px]">
                Weekly
              </span>
            </div>
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
          {/* Pin icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="cursor-pointer"
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
        className="flex items-center justify-between w-full  mt-3 px-6 py-4 bg-[#1452f0] rounded-full text-white hover:bg-[#1240c0] transition-colors"
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
    </div>
  );
};
