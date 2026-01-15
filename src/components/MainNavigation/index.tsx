import { useState } from "react";
import { arrowLeftIcon } from "../../assets/svgs/mainNavigation";
import { Button } from "../ui";
import { Theme } from "../GlobusMapbox/constants/mapConfig";
import {
  NewsButtonComponent,
  LiveButtonComponent,
} from "./components/FilterChips";
import {
  TimeFiltersComponent,
  PlayButtonComponent,
} from "./components/ActionBar";
import ThemeToggleComponent from "./components/ActionBar/ThemeToggle";
import LiveTrades from "../LiveTrades";
import BreakingNews from "../BreakingNews";
import { TimeFilter } from "../../App";

interface MainNavigationProps {
  theme?: Theme;
  onThemeChange?: ((theme: Theme) => void) | null;
  isPaused?: boolean;
  onToggleSpin?: (() => void) | null;
  timeFilter?: TimeFilter;
  onTimeFilterChange?: (filter: TimeFilter) => void;
}

function MainNavigation({
  theme = "light",
  onThemeChange,
  isPaused = false,
  onToggleSpin,
  timeFilter = "24h",
  onTimeFilterChange,
}: MainNavigationProps) {
  const [isLiveTradesOpen, setIsLiveTradesOpen] = useState(false);
  const [isBreakingNewsOpen, setIsBreakingNewsOpen] = useState(false);

  const handleLiveClick = () => {
    setIsLiveTradesOpen(!isLiveTradesOpen);
    if (!isLiveTradesOpen) setIsBreakingNewsOpen(false);
  };

  const handleBreakingClick = () => {
    setIsBreakingNewsOpen(!isBreakingNewsOpen);
    if (!isBreakingNewsOpen) setIsLiveTradesOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex absolute top-[72px] left-0 bg-transparent px-8 py-6 w-full z-10 pointer-events-none items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="navigation" className="pointer-events-auto">
            <img src={arrowLeftIcon} alt="Arrow Left" />
          </Button>
          <div className="pointer-events-auto">
            <NewsButtonComponent
              isOpen={isBreakingNewsOpen}
              onClick={handleBreakingClick}
            />
          </div>
          <div className="pointer-events-auto">
            <LiveButtonComponent
              isOpen={isLiveTradesOpen}
              onClick={handleLiveClick}
            />
          </div>
        </div>
        <div className="flex gap-6">
          {onThemeChange && (
            <ThemeToggleComponent theme={theme} onThemeChange={onThemeChange} />
          )}
          <TimeFiltersComponent
            activeFilter={timeFilter}
            onFilterChange={onTimeFilterChange}
          />
          {onToggleSpin && (
            <div className="pointer-events-auto">
              <PlayButtonComponent
                isPaused={isPaused}
                onToggleSpin={onToggleSpin}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden absolute top-[72px] left-0 bg-transparent px-4 py-4 w-full z-10 pointer-events-none items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="pointer-events-auto">
            <NewsButtonComponent
              isOpen={isBreakingNewsOpen}
              onClick={handleBreakingClick}
              isMobile={true}
            />
          </div>
          <div className="pointer-events-auto">
            <LiveButtonComponent
              isOpen={isLiveTradesOpen}
              onClick={handleLiveClick}
              isMobile={true}
            />
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {onToggleSpin && (
            <div className="pointer-events-auto">
              <PlayButtonComponent
                isPaused={isPaused}
                onToggleSpin={onToggleSpin}
                isMobile={true}
              />
            </div>
          )}
        </div>
      </div>

      <BreakingNews
        isOpen={isBreakingNewsOpen}
        onClose={() => setIsBreakingNewsOpen(false)}
      />

      <LiveTrades
        isOpen={isLiveTradesOpen}
        onClose={() => setIsLiveTradesOpen(false)}
      />
    </>
  );
}

export default MainNavigation;
