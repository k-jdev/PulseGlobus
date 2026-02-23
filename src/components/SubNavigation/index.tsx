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

/* ── Inline SVG Icons ── */

const GlobeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a7.99 7.99 0 0 0-3.87 1.006c.307.394.74.87 1.32 1.35C10.584 7.304 11.906 8 12 8c.372 0 1 .186 1 1v1c0 .352.12.594.343.8.258.237.643.4 1.157.4.352 0 .594.12.8.343.237.258.4.643.4 1.157V14a1 1 0 0 1-1 1h-1c-.514 0-.899.163-1.157.4-.224.206-.343.448-.343.8v1.7c0 .538-.132.87-.295 1.078a1.08 1.08 0 0 1-.336.282A7.972 7.972 0 0 0 12 20a8.013 8.013 0 0 0 5.778-2.467C17.398 16.378 16.018 15 14 15c-.514 0-.899-.163-1.157-.4C12.62 14.394 12.5 14.152 12.5 13.8V12c0-.514.163-.899.4-1.157.206-.224.448-.343.8-.343h2.1c.352 0 .594-.12.8-.343.237-.258.4-.643.4-1.157 0-.283-.119-.562-.371-.815C16.38 7.933 15.81 7.664 15 7.5A1 1 0 0 1 14.2 7H14c-1.2 0-2-.6-2.4-1.2L11.2 5a1 1 0 0 1 0-1H12z"
    />
  </svg>
);

const BubbleIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="9" r="6" />
    <circle cx="18" cy="16" r="4" />
    <circle cx="17" cy="6" r="2.5" />
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
