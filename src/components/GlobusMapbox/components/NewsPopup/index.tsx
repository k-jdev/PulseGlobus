import { FC } from "react";

interface NewsPopupProps {
  title: string;
  image?: string;
  url: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
  seendate?: string;
  onClose?: () => void;
  isMobile?: boolean;
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

export const NewsPopup: FC<NewsPopupProps> = ({
  title,
  image,
  url,
  domain,
  language,
  sourcecountry,
  seendate,
  onClose,
  isMobile = false,
}) => {
  return (
    <div
      className={`bg-white border border-[#e9edf8] rounded-[14px] overflow-hidden shadow-xl ${
        isMobile ? "w-[90vw] max-w-[360px]" : "w-[380px]"
      }`}
    >
      {/* Header with close button */}
      <div className="relative">
        {/* Image */}
        {image && (
          <div className="w-full h-[160px] overflow-hidden">
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

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
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

        {/* News badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-[#ff6b35] rounded-full">
          <span className="text-white text-[12px] font-semibold">NEWS</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-[17px] font-semibold text-[#1b2430] leading-[24px] tracking-[-0.3px] mb-4 line-clamp-3">
          {title}
        </h3>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {domain && (
            <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
              <span className="text-[#808080] text-[13px] font-medium">
                {domain}
              </span>
            </div>
          )}
          {sourcecountry && (
            <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
              <span className="text-[#808080] text-[13px] font-medium">
                {sourcecountry}
              </span>
            </div>
          )}
          {language && (
            <div className="px-3 py-1 bg-[#f5f5f5] rounded-full">
              <span className="text-[#808080] text-[13px] font-medium capitalize">
                {language}
              </span>
            </div>
          )}
        </div>

        {/* Time */}
        {seendate && (
          <div className="flex items-center gap-2 mb-4 text-[#808080]">
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[13px]">{formatDate(seendate)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-[#e4e4e4] w-full mb-4" />

        {/* CTA Button */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-6 py-4 bg-[#ff6b35] rounded-full text-white hover:bg-[#e55a28] transition-colors"
        >
          <span className="text-[15px] font-semibold tracking-[-0.3px]">
            Read full article
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
    </div>
  );
};
