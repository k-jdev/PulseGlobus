import { FC } from "react";

interface Outcome {
  name: string;
  percentage: number;
  buyPrice: string;
  sellPrice: string;
}

interface MarketPopupProps {
  title: string;
  image?: string;
  outcomes: Outcome[];
  volume: string;
  slug: string;
  eventSlug?: string;
}

export const MarketPopup: FC<MarketPopupProps> = ({
  title,
  image,
  outcomes,
  volume,
  slug,
  eventSlug,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl min-w-[380px] max-w-[420px] p-6">
      {/* Header with image and title */}
      <div className="flex items-start gap-4 mb-4">
        {image && (
          <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 leading-snug flex-1">
          {title}
        </h3>
      </div>

      {/* Outcomes */}
      <div className="mb-5">
        {outcomes.map((outcome, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center py-1 border-b border-gray-100"
          >
            <span className="text-[#1B2430] text-[16px] font-medium">
              {outcome.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#1B2430] text-[20px] font-bold">
                {outcome.percentage}%
              </span>
              <span className="text-[#1452F0]  py-2.5 px-3 bg-[#1452F0]/10 rounded-[4px] text-sm font-semibold">
                {outcome.buyPrice}
              </span>
              <span className="text-[#EE1616] py-2.5 px-3 bg-[#EE1616]/10 rounded-[4px] text-sm font-semibold">
                {outcome.sellPrice}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Volume and metadata */}
      <div className="flex items-center gap-3 mb-5 pt-4 border-t border-gray-100">
        <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium">
          {volume} Vol.
        </div>
        <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium">
          Weekly
        </div>
        <div className="flex items-center ml-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <g clipPath="url(#clip0_462_13875)">
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
              <clipPath id="clip0_462_13875">
                <rect width="15.9983" height="15.9983" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="ml-auto text-gray-300 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
        className="flex items-center justify-between gap-2 w-full px-6 py-4 bg-[#1452F0] hover:bg-blue-700 text-white rounded-full font-semibold text-base transition-colors"
      >
        View market
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M8.30237 17.5502L15.3248 10.5278L15.3155 16.625C15.3155 16.9734 15.4539 17.3076 15.7003 17.554C15.9467 17.8004 16.2809 17.9388 16.6293 17.9388C16.9777 17.9388 17.3119 17.8004 17.5583 17.554C17.8047 17.3076 17.9431 16.9734 17.9431 16.625L17.9431 7.37285C17.9393 7.20063 17.9016 7.03084 17.8321 6.87323C17.6994 6.55544 17.4467 6.30279 17.1289 6.17007C16.9713 6.10053 16.8015 6.0628 16.6293 6.05904L7.37715 6.05905C7.20442 6.05834 7.03326 6.09184 6.87354 6.15761C6.71383 6.22338 6.56871 6.32013 6.44657 6.44227C6.32443 6.56441 6.22769 6.70952 6.16191 6.86924C6.09614 7.02896 6.06264 7.20012 6.06335 7.37285C6.06264 7.54558 6.09614 7.71674 6.16191 7.87646C6.22769 8.03618 6.32443 8.18129 6.44657 8.30343C6.56871 8.42557 6.71383 8.52232 6.87354 8.58809C7.03326 8.65386 7.20442 8.68736 7.37715 8.68666L13.4743 8.6774L6.45194 15.6998C6.20656 15.9452 6.0687 16.278 6.0687 16.625C6.0687 16.972 6.20656 17.3048 6.45194 17.5502C6.69732 17.7956 7.03013 17.9335 7.37715 17.9335C7.72418 17.9335 8.05699 17.7956 8.30237 17.5502Z"
            fill="white"
          />
        </svg>
      </a>
    </div>
  );
};
