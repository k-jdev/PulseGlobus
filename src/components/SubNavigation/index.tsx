import { useState, useEffect, useRef } from "react";
import {
  arrowDownIcon,
  sunIcon,
  moonIcon,
  moonBlueIcon,
  playIcon,
  pauseIcon,
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

  // Close popups when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsLiveTradesOpen(false);
      setIsBreakingNewsOpen(false);
    }
  }, [isMobileMenuOpen]);

  // Register close function with parent
  useEffect(() => {
    onClosePopups?.(() => {
      setIsLiveTradesOpen(false);
      setIsBreakingNewsOpen(false);
    });
  }, [onClosePopups]);

  // Check categories scroll state
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
      <div className="hidden md:flex absolute top-[72px] left-0 w-full z-[15] bg-white border-b border-[#ebebec] px-6 py-1.5 items-center gap-2.5">
        {/* View Mode Toggle */}
        <div className="flex-shrink-0 flex items-center bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => onViewModeChange("globe")}
            className={`flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              viewMode === "globe"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("bubble")}
            className={`flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              viewMode === "bubble"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="7.5" cy="7.5" r="5.5" />
              <circle cx="17" cy="17" r="5" />
              <circle cx="18" cy="7" r="3" />
              <circle cx="7" cy="18" r="2" />
            </svg>
            Bubble
          </button>
        </div>

        {/* Breaking News */}
        <button
          onClick={handleBreakingClick}
          className={`flex-shrink-0 flex items-center gap-2 h-9 px-4 rounded-full border border-[rgba(0,0,0,0.12)] text-[13px] font-semibold transition-all ${
            isBreakingNewsOpen
              ? "bg-[#1452F0] text-white border-[#1452F0]"
              : "bg-white text-black hover:bg-gray-50"
          }`}
        >
          Breaking
          <img
            src={arrowDownIcon}
            alt=""
            className={`w-3 h-3 transition-transform duration-300 ${
              isBreakingNewsOpen ? "rotate-180 brightness-0 invert" : ""
            }`}
          />
        </button>

        {/* Live Trades */}
        <button
          onClick={handleLiveClick}
          className={`flex-shrink-0 flex items-center gap-2 h-9 px-4 rounded-full border border-[rgba(0,0,0,0.12)] text-[13px] font-semibold transition-all ${
            isLiveTradesOpen
              ? "bg-[#53BB33] text-white border-[#53BB33]"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isLiveTradesOpen ? "bg-white" : "bg-[#53BB33]"
            }`}
          />
          <span className={isLiveTradesOpen ? "text-white" : "text-[#53BB33]"}>
            LIVE
          </span>
          <img
            src={arrowDownIcon}
            alt=""
            className={`w-3 h-3 transition-transform duration-300 ${
              isLiveTradesOpen ? "rotate-180 brightness-0 invert" : ""
            }`}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-[#e4e4e4] flex-shrink-0" />

        {/* Categories — scrollable */}
        <div className="flex-1 min-w-0 relative">
          <div
            ref={categoriesRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide pr-8"
          >
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`flex-shrink-0 h-9 px-5 rounded-full text-[13px] font-semibold tracking-[-0.26px] transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#1452F0] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Scroll-right indicator */}
          {canScrollRight && (
            <button
              onClick={scrollCategories}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-[#e4e4e4] flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-[#e4e4e4] flex-shrink-0" />

        {/* Time Filters */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => onTimeFilterChange(filter)}
              className={`h-9 w-[52px] rounded-full text-[13px] font-semibold transition-all ${
                timeFilter === filter
                  ? "bg-white text-[#1452F0] border-2 border-[#1452F0]"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Theme Toggle — globe mode only */}
        {viewMode === "globe" && onThemeChange && (
          <>
            <div className="w-px h-7 bg-[#e4e4e4] flex-shrink-0" />
            <div className="flex-shrink-0 flex items-center gap-1.5">
              <button
                onClick={() => onThemeChange("light")}
                className={`w-9 h-9 rounded-full flex items-center justify-center border border-[rgba(0,0,0,0.08)] transition-all ${
                  theme === "light"
                    ? "bg-[#1452F0]"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <img
                  src={sunIcon}
                  alt="Light"
                  className={`w-4 h-4 ${
                    theme === "light" ? "brightness-0 invert" : ""
                  }`}
                />
              </button>
              <button
                onClick={() => onThemeChange("dark")}
                className={`w-9 h-9 rounded-full flex items-center justify-center border border-[rgba(0,0,0,0.08)] transition-all ${
                  theme === "dark"
                    ? "bg-[#1452F0]"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <img
                  src={theme === "dark" ? moonBlueIcon : moonIcon}
                  alt="Dark"
                  className={`w-4 h-4 ${
                    theme === "dark" ? "brightness-0 invert" : ""
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {/* Play / Pause — globe mode only */}
        {viewMode === "globe" && onToggleSpin && (
          <button
            onClick={onToggleSpin}
            className="flex-shrink-0 w-9 h-9 rounded-full border border-[rgba(0,0,0,0.08)] bg-white hover:bg-gray-50 flex items-center justify-center transition-all"
          >
            <img
              src={isPaused ? playIcon : pauseIcon}
              alt={isPaused ? "Play" : "Pause"}
              className="w-4 h-4"
            />
          </button>
        )}
      </div>

      {/* ═══════ Mobile Sub-Navigation ═══════ */}
      <div className="flex md:hidden absolute top-[72px] left-0 w-full z-[15] bg-white border-b border-[#ebebec] px-3 py-1.5 items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* View toggle */}
        <div className="flex-shrink-0 flex items-center bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => onViewModeChange("globe")}
            className={`h-7 px-2.5 rounded-full text-[12px] font-semibold transition-all ${
              viewMode === "globe"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("bubble")}
            className={`h-7 px-2.5 rounded-full text-[12px] font-semibold transition-all ${
              viewMode === "bubble"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-gray-500"
            }`}
          >
            Bubble
          </button>
        </div>

        {/* Breaking */}
        <button
          onClick={handleBreakingClick}
          className={`flex-shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full border border-[rgba(0,0,0,0.12)] text-[12px] font-semibold ${
            isBreakingNewsOpen
              ? "bg-[#1452F0] text-white border-[#1452F0]"
              : "bg-white text-black"
          }`}
        >
          Breaking
          <img
            src={arrowDownIcon}
            alt=""
            className={`w-2.5 h-2.5 transition-transform duration-300 ${
              isBreakingNewsOpen ? "rotate-180 brightness-0 invert" : ""
            }`}
          />
        </button>

        {/* Live */}
        <button
          onClick={handleLiveClick}
          className={`flex-shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full border border-[rgba(0,0,0,0.12)] text-[12px] font-semibold ${
            isLiveTradesOpen
              ? "bg-[#53BB33] text-white border-[#53BB33]"
              : "bg-white"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isLiveTradesOpen ? "bg-white" : "bg-[#53BB33]"
            }`}
          />
          <span className={isLiveTradesOpen ? "text-white" : "text-[#53BB33]"}>
            LIVE
          </span>
        </button>

        {/* Category chips */}
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex-shrink-0 h-7 px-3 rounded-full text-[12px] font-semibold transition-all ${
              activeCategory === cat
                ? "bg-[#1452F0] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}

        {/* Time filters */}
        {timeFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => onTimeFilterChange(filter)}
            className={`flex-shrink-0 h-7 px-3 rounded-full text-[12px] font-semibold transition-all ${
              timeFilter === filter
                ? "bg-white text-[#1452F0] border-2 border-[#1452F0]"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {filter}
          </button>
        ))}

        {/* Pause — globe only */}
        {viewMode === "globe" && onToggleSpin && (
          <button
            onClick={onToggleSpin}
            className="flex-shrink-0 w-7 h-7 rounded-full border border-[rgba(0,0,0,0.08)] bg-white flex items-center justify-center"
          >
            <img
              src={isPaused ? playIcon : pauseIcon}
              alt=""
              className="w-3.5 h-3.5"
            />
          </button>
        )}
      </div>

      {/* ═══════ Popups ═══════ */}
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
