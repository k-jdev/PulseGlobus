import { useState, useEffect, useRef } from "react";
import {
  playIcon,
  pauseIcon,
  sunIcon,
  moonIcon,
  moonBlueIcon,
} from "@/assets/svgs/mainNavigation";
import LiveTrades from "@/components/LiveTrades";
import BreakingNews from "@/components/BreakingNews";
import type { TimeFilter, ViewMode } from "@/App";
import type { Theme } from "@/components/GlobusMapbox/constants/mapConfig";

const ALL_CATEGORIES = [
  "All Markets",
  "Politics",
  "Sports",
  "Crypto",
  "Finance",
  "Geopolitics",
  "Tech",
  "Culture",
] as const;

export type Category = (typeof ALL_CATEGORIES)[number];

const GlobeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0004 3C9.45431 3 7.01251 4.01143 5.21217 5.81177C3.41182 7.61212 2.40039 10.0539 2.40039 12.6C2.40039 15.1461 3.41182 17.5879 5.21217 19.3882C7.01251 21.1886 9.45431 22.2 12.0004 22.2C14.5465 22.2 16.9883 21.1886 18.7886 19.3882C20.589 17.5879 21.6004 15.1461 21.6004 12.6C21.6004 10.0539 20.589 7.61212 18.7886 5.81177C16.9883 4.01143 14.5465 3 12.0004 3ZM7.20039 6.78103C5.99392 7.77631 5.12666 9.12202 4.71867 10.6319C4.31068 12.1418 4.38212 13.7411 4.92312 15.2086C5.46411 16.6761 6.4479 17.9391 7.73832 18.8228C9.02873 19.7066 10.5619 20.1673 12.1258 20.1413C13.6896 20.1153 15.2066 19.6039 16.4669 18.6777C17.7273 17.7516 18.6685 16.4565 19.1604 14.9719C19.6523 13.4872 19.6706 11.8864 19.2126 10.3909C18.7547 8.89545 17.8432 7.57931 16.6043 6.62469L15.7128 7.51611C15.6224 7.60585 15.5507 7.7127 15.502 7.83043C15.4532 7.94816 15.4284 8.07441 15.429 8.20183C15.429 8.73669 14.9942 9.17143 14.4594 9.17143H12.586C12.4629 9.17138 12.342 9.20474 12.2364 9.26797C12.1307 9.3312 12.0442 9.42192 11.9861 9.53046C11.9279 9.639 11.9003 9.76128 11.9062 9.88427C11.9122 10.0073 11.9513 10.1263 12.0196 10.2288L12.3624 10.7445C12.4515 10.8786 12.5867 10.9754 12.7424 11.0166C12.8981 11.0578 13.0635 11.0405 13.2072 10.968C13.4547 10.8439 13.735 10.8009 14.0083 10.8452C14.2816 10.8895 14.534 11.0189 14.7295 11.2149L15.5154 12.0007C15.6955 12.1807 15.8219 12.4073 15.8805 12.655C15.9391 12.9028 15.9276 13.162 15.8472 13.4037L14.4594 17.5659C14.3501 17.8937 14.1212 18.1681 13.8184 18.3344C13.5156 18.5007 13.1612 18.5466 12.826 18.4629L12.3528 18.3449C12.0563 18.2706 11.793 18.0994 11.6049 17.8583C11.4169 17.6173 11.3147 17.3204 11.3147 17.0146V16.5963C11.3146 16.2326 11.1701 15.8839 10.9128 15.6267L9.39468 14.1086C9.17693 13.8901 9.05467 13.5942 9.05467 13.2857C9.05467 12.9772 9.17693 12.6814 9.39468 12.4629C9.69639 12.1611 9.69639 11.6674 9.39468 11.3657L8.40588 10.3769C8.02364 9.99479 7.72044 9.5411 7.5136 9.04176C7.30675 8.54243 7.20033 8.00723 7.20039 7.46674V6.78103Z"
      fill="currentColor"
    />
  </svg>
);

const BubbleIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M17 12.002C19.2091 12.002 21 10.2111 21 8.00195C21 5.79281 19.2091 4.00195 17 4.00195C14.7909 4.00195 13 5.79281 13 8.00195C13 10.2111 14.7909 12.002 17 12.002Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 20C13.6569 20 15 18.6569 15 17C15 15.3431 13.6569 14 12 14C10.3431 14 9 15.3431 9 17C9 18.6569 10.3431 20 12 20Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M6.5 12.002C7.88071 12.002 9 10.8827 9 9.50195C9 8.12124 7.88071 7.00195 6.5 7.00195C5.11929 7.00195 4 8.12124 4 9.50195C4 10.8827 5.11929 12.002 6.5 12.002Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const ChevronDownIcon = ({
  className = "",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronRightIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="12"
    height="24"
    viewBox="0 0 12 24"
    fill="none"
    stroke="#1452f0"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 9 12 3 18" />
  </svg>
);

/* ── Component ── */

interface SubNavigationProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: Theme;
  onThemeChange?: ((theme: Theme) => void) | null;
  isPaused: boolean;
  onToggleSpin?: (() => void) | null;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  isMobileMenuOpen: boolean;
  onClosePopups?: (closeFn: () => void) => void;
}

function SubNavigation({
  viewMode,
  onViewModeChange,
  theme,
  onThemeChange,
  isPaused,
  onToggleSpin,
  timeFilter,
  onTimeFilterChange,
  activeCategory,
  onCategoryChange,
  isMobileMenuOpen,
  onClosePopups,
}: SubNavigationProps) {
  const [isLiveTradesOpen, setIsLiveTradesOpen] = useState(false);
  const [isBreakingNewsOpen, setIsBreakingNewsOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsLiveTradesOpen(false);
      setIsBreakingNewsOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    onClosePopups?.(() => {
      setIsLiveTradesOpen(false);
      setIsBreakingNewsOpen(false);
    });
  }, [onClosePopups]);

  useEffect(() => {
    const el = categoriesRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [activeCategory]);

  const scrollCategories = () => {
    categoriesRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const handleCatMouseDown = (e: React.MouseEvent) => {
    const el = categoriesRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    scrollStartX.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = categoriesRef.current;
    if (!el) return;
    const dx = e.clientX - dragStartX.current;
    el.scrollLeft = scrollStartX.current - dx;
  };

  const handleCatMouseUp = () => {
    isDragging.current = false;
    const el = categoriesRef.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.userSelect = "";
    }
  };

  const handleLiveClick = () => {
    setIsLiveTradesOpen(!isLiveTradesOpen);
    if (!isLiveTradesOpen) setIsBreakingNewsOpen(false);
  };

  const handleBreakingClick = () => {
    setIsBreakingNewsOpen(!isBreakingNewsOpen);
    if (!isBreakingNewsOpen) setIsLiveTradesOpen(false);
  };

  const timeFilters: TimeFilter[] = ["1h", "6h", "24h"];

  return (
    <>
      {/* ═══════ Desktop ═══════ */}
      <div className="hidden md:flex absolute top-[72px] left-0 w-full z-[15] bg-[#edf1fe] shadow-[0px_14px_21.9px_0px_rgba(20,82,240,0.14)] px-8 py-3 items-center gap-12">
        {/* ── Left: controls ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Globe / Bubble toggle */}
          <div className="flex items-center h-12 bg-white border border-[#ebebec] rounded-full p-1 gap-0.5">
            <button
              onClick={() => onViewModeChange("globe")}
              className={`flex items-center justify-center h-10 rounded-full transition-all duration-200 ${
                viewMode === "globe"
                  ? "bg-[#1452f0] text-white gap-2 px-4"
                  : "text-[#1b2430] w-10 hover:bg-gray-100"
              }`}
            >
              <GlobeIcon
                className={`w-5 h-5 flex-shrink-0 ${viewMode === "globe" ? "text-white" : "text-[#1b2430]"}`}
              />
              {viewMode === "globe" && (
                <span className="text-[15px] font-medium tracking-[-0.3px] whitespace-nowrap">
                  Globe
                </span>
              )}
            </button>
            <button
              onClick={() => onViewModeChange("bubble")}
              className={`flex items-center justify-center h-10 rounded-full transition-all duration-200 ${
                viewMode === "bubble"
                  ? "bg-[#1452f0] text-white gap-2 px-4"
                  : "text-[#1b2430] w-10 hover:bg-gray-100"
              }`}
            >
              <BubbleIcon
                className={`w-5 h-5 flex-shrink-0 ${viewMode === "bubble" ? "text-white" : "text-[#1b2430]"}`}
              />
              {viewMode === "bubble" && (
                <span className="text-[15px] font-medium tracking-[-0.3px] whitespace-nowrap">
                  Bubble
                </span>
              )}
            </button>
          </div>

          {/* Breaking */}
          <button
            onClick={handleBreakingClick}
            className={`flex items-center gap-2.5 h-12 pl-6 pr-4 rounded-full border transition-all ${
              isBreakingNewsOpen
                ? "bg-[#1452f0] text-white border-[#1452f0]"
                : "bg-white border-[rgba(0,0,0,0.12)] text-[#1b2430] hover:bg-gray-50"
            }`}
          >
            <span className="text-[15px] font-medium tracking-[-0.3px] leading-[22.5px]">
              Breaking
            </span>
            <ChevronDownIcon
              className={`transition-transform duration-300 ${isBreakingNewsOpen ? "rotate-180" : ""}`}
              color={isBreakingNewsOpen ? "white" : "#1b2430"}
            />
          </button>

          {/* LIVE */}
          <button
            onClick={handleLiveClick}
            className={`flex items-center gap-2.5 h-12 px-6 rounded-full border transition-all ${
              isLiveTradesOpen
                ? "bg-[#53bb33] text-white border-[#53bb33]"
                : "bg-white border-[rgba(0,0,0,0.12)] hover:bg-gray-50"
            }`}
          >
            <div
              className={`w-[7px] h-[7px] rounded-full animate-pulse ${
                isLiveTradesOpen ? "bg-white" : "bg-[#53bb33]"
              }`}
            />
            <span
              className={`text-[15px] font-medium tracking-[-0.3px] leading-[22.5px] ${
                isLiveTradesOpen ? "text-white" : "text-[#53bb33]"
              }`}
            >
              LIVE
            </span>
            <ChevronDownIcon
              className={`transition-transform duration-300 ${isLiveTradesOpen ? "rotate-180" : ""}`}
              color={isLiveTradesOpen ? "white" : "#53bb33"}
            />
          </button>
        </div>

        {/* ── Center: categories (flex-1) ── */}
        <div className="flex-1 min-w-0 flex items-center">
          <div className="flex-1 min-w-0 relative">
            <div
              ref={categoriesRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide cursor-grab"
              onMouseDown={handleCatMouseDown}
              onMouseMove={handleCatMouseMove}
              onMouseUp={handleCatMouseUp}
              onMouseLeave={handleCatMouseUp}
            >
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`flex-shrink-0 h-12 px-6 py-3 rounded-full text-[15px] font-medium tracking-[-0.3px] leading-[22.5px] transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-[#1452f0] text-white shadow-[0px_2px_8px_0px_rgba(20,82,240,0.2)]"
                      : "bg-white text-[#808080] border border-[rgba(0,0,0,0.12)] hover:text-[#1b2430]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Gradient fade on right */}
            {canScrollRight && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[62px] h-[63px] bg-gradient-to-l from-[#edf1fe] to-transparent pointer-events-none" />
            )}
          </div>
          {/* Scroll arrow */}
          {canScrollRight && (
            <button
              onClick={scrollCategories}
              className="flex-shrink-0 ml-1 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <ChevronRightIcon />
            </button>
          )}
        </div>

        {/* ── Right: time filters + pause ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => onTimeFilterChange(filter)}
              className={`h-12 px-6 py-3 rounded-full border border-[rgba(0,0,0,0.12)] text-[15px] font-medium tracking-[-0.3px] leading-[22.5px] transition-all ${
                timeFilter === filter
                  ? "bg-white text-[#1452f0]"
                  : "bg-white text-[#bbbdc1] hover:text-[#1b2430]"
              }`}
            >
              {filter}
            </button>
          ))}

          {/* Theme toggle — globe mode only */}
          {viewMode === "globe" && onThemeChange && (
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => theme !== "light" && onThemeChange("light")}
                disabled={theme === "light"}
                className={`w-12 h-12 flex items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] transition-all ${
                  theme === "light"
                    ? "bg-white"
                    : "bg-[#002175]/40 hover:bg-[#002175]/60"
                }`}
                title="Light theme"
              >
                <img
                  src={sunIcon}
                  alt="Sun"
                  className={`w-5 h-5 ${theme !== "light" ? "brightness-0 invert" : ""}`}
                />
              </button>
              <button
                onClick={() => theme !== "dark" && onThemeChange("dark")}
                disabled={theme === "dark"}
                className={`w-12 h-12 flex items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] transition-all ${
                  theme === "dark"
                    ? "bg-white"
                    : "bg-[#002175]/40 hover:bg-[#002175]/60"
                }`}
                title="Dark theme"
              >
                <img
                  src={theme === "dark" ? moonBlueIcon : moonIcon}
                  alt="Moon"
                  className="w-5 h-5"
                />
              </button>
            </div>
          )}

          {/* Play / Pause — globe mode only */}
          {viewMode === "globe" && onToggleSpin && (
            <button
              onClick={onToggleSpin}
              className="w-12 h-12 rounded-full border border-[rgba(0,0,0,0.12)] bg-white hover:bg-gray-50 flex items-center justify-center transition-all"
            >
              <img
                src={isPaused ? playIcon : pauseIcon}
                alt={isPaused ? "Play" : "Pause"}
                className="w-5 h-5"
              />
            </button>
          )}
        </div>
      </div>

      <div className="flex md:hidden absolute top-[72px] left-0 w-full z-[15] bg-[#edf1fe] shadow-[0px_14px_21.9px_0px_rgba(20,82,240,0.14)] px-3 py-2 items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* View toggle */}
        <div className="flex-shrink-0 flex items-center h-10 bg-white border border-[#ebebec] rounded-full p-1 gap-0.5">
          <button
            onClick={() => onViewModeChange("globe")}
            className={`flex items-center justify-center h-8 rounded-full transition-all duration-200 ${
              viewMode === "globe"
                ? "bg-[#1452f0] text-white gap-1.5 px-3"
                : "text-[#1b2430] w-8 hover:bg-gray-100"
            }`}
          >
            <GlobeIcon
              className={`w-4 h-4 flex-shrink-0 ${viewMode === "globe" ? "text-white" : "text-[#1b2430]"}`}
            />
            {viewMode === "globe" && (
              <span className="text-[12px] font-medium tracking-[-0.3px] whitespace-nowrap">
                Globe
              </span>
            )}
          </button>
          <button
            onClick={() => onViewModeChange("bubble")}
            className={`flex items-center justify-center h-8 rounded-full transition-all duration-200 ${
              viewMode === "bubble"
                ? "bg-[#1452f0] text-white gap-1.5 px-3"
                : "text-[#1b2430] w-8 hover:bg-gray-100"
            }`}
          >
            <BubbleIcon
              className={`w-4 h-4 flex-shrink-0 ${viewMode === "bubble" ? "text-white" : "text-[#1b2430]"}`}
            />
            {viewMode === "bubble" && (
              <span className="text-[12px] font-medium tracking-[-0.3px] whitespace-nowrap">
                Bubble
              </span>
            )}
          </button>
        </div>

        {/* Breaking */}
        <button
          onClick={handleBreakingClick}
          className={`flex-shrink-0 flex items-center gap-1.5 h-10 pl-4 pr-3 rounded-full border text-[13px] font-medium transition-all ${
            isBreakingNewsOpen
              ? "bg-[#1452f0] text-white border-[#1452f0]"
              : "bg-white text-[#1b2430] border-[rgba(0,0,0,0.12)]"
          }`}
        >
          Breaking
          <ChevronDownIcon
            className={`transition-transform duration-300 ${isBreakingNewsOpen ? "rotate-180" : ""}`}
            color={isBreakingNewsOpen ? "white" : "#1b2430"}
          />
        </button>

        {/* LIVE */}
        <button
          onClick={handleLiveClick}
          className={`flex-shrink-0 flex items-center gap-1.5 h-10 px-4 rounded-full border text-[13px] font-medium transition-all ${
            isLiveTradesOpen
              ? "bg-[#53bb33] text-white border-[#53bb33]"
              : "bg-white border-[rgba(0,0,0,0.12)]"
          }`}
        >
          <div
            className={`w-[6px] h-[6px] rounded-full animate-pulse ${
              isLiveTradesOpen ? "bg-white" : "bg-[#53bb33]"
            }`}
          />
          <span className={isLiveTradesOpen ? "text-white" : "text-[#53bb33]"}>
            LIVE
          </span>
        </button>

        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex-shrink-0 h-10 px-4 rounded-full text-[13px] font-medium tracking-[-0.3px] transition-all ${
              activeCategory === cat
                ? "bg-[#1452f0] text-white shadow-[0px_2px_8px_0px_rgba(20,82,240,0.2)]"
                : "bg-white text-[#808080] border border-[rgba(0,0,0,0.12)]"
            }`}
          >
            {cat}
          </button>
        ))}

        {timeFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => onTimeFilterChange(filter)}
            className={`flex-shrink-0 h-10 px-4 rounded-full text-[13px] font-medium transition-all border border-[rgba(0,0,0,0.12)] ${
              timeFilter === filter
                ? "bg-white text-[#1452f0]"
                : "bg-white text-[#bbbdc1]"
            }`}
          >
            {filter}
          </button>
        ))}

        {/* Theme toggle — globe only (mobile) */}
        {viewMode === "globe" && onThemeChange && (
          <>
            <button
              onClick={() => theme !== "light" && onThemeChange("light")}
              disabled={theme === "light"}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] transition-all ${
                theme === "light"
                  ? "bg-white"
                  : "bg-[#002175]/40 hover:bg-[#002175]/60"
              }`}
            >
              <img
                src={sunIcon}
                alt="Sun"
                className={`w-4 h-4 ${theme !== "light" ? "brightness-0 invert" : ""}`}
              />
            </button>
            <button
              onClick={() => theme !== "dark" && onThemeChange("dark")}
              disabled={theme === "dark"}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] transition-all ${
                theme === "dark"
                  ? "bg-white"
                  : "bg-[#002175]/40 hover:bg-[#002175]/60"
              }`}
            >
              <img
                src={theme === "dark" ? moonBlueIcon : moonIcon}
                alt="Moon"
                className="w-4 h-4"
              />
            </button>
          </>
        )}

        {/* Pause — globe only */}
        {viewMode === "globe" && onToggleSpin && (
          <button
            onClick={onToggleSpin}
            className="flex-shrink-0 w-10 h-10 rounded-full border border-[rgba(0,0,0,0.12)] bg-white flex items-center justify-center"
          >
            <img
              src={isPaused ? playIcon : pauseIcon}
              alt={isPaused ? "Play" : "Pause"}
              className="w-4 h-4"
            />
          </button>
        )}
      </div>

      <BreakingNews
        isOpen={isBreakingNewsOpen}
        onClose={() => setIsBreakingNewsOpen(false)}
      />

      <LiveTrades
        {...({
          isOpen: isLiveTradesOpen,
          onClose: () => setIsLiveTradesOpen(false),
        } as any)}
      />
    </>
  );
}

export default SubNavigation;
