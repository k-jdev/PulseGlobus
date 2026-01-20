import { FC } from "react";
import { motion } from "framer-motion";

interface NewsMarkerProps {
  title: string;
  image?: string;
  url: string;
  domain?: string;
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

export const NewsMarker: FC<NewsMarkerProps> = ({
  title,
  image,
  url,
  domain,
  sourcecountry,
  seendate,
  onClose,
  isMobile = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`bg-white border border-[#e9edf8] rounded-[14px] relative shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)] ${
        isMobile ? "px-5 py-4 w-full" : "px-6 py-5 min-w-[360px] max-w-[420px]"
      }`}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-[#e5e5e5] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#808080"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Header with image and title */}
      <div className="flex items-start gap-4 mb-4 pr-10">
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
        <h3 className="text-[19px] font-semibold text-[#1b2430] leading-[26px] tracking-[-0.4px] flex-1 line-clamp-3">
          {title}
        </h3>
      </div>

      {/* Meta info */}
      <div className="flex flex-col gap-3">
        <div className="h-px bg-[#e4e4e4] w-full" />
        <div className="flex items-center justify-between">
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
        </div>
      </div>

      {/* CTA Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full mt-3 px-6 py-4 bg-[#1452f0] rounded-full text-white hover:bg-[#1240c0] transition-colors"
      >
        <span className="text-[16px] font-semibold tracking-[-0.32px]">
          Read article
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
  );
};
