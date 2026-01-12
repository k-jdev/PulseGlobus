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

interface MainNavigationProps {
  theme?: Theme;
  onThemeChange?: ((theme: Theme) => void) | null;
  isPaused?: boolean;
  onToggleSpin?: (() => void) | null;
}

function MainNavigation({
  theme = "light",
  onThemeChange,
  isPaused = false,
  onToggleSpin,
}: MainNavigationProps) {
  return (
    <div className="absolute top-[72px] left-0 bg-transparent px-8 py-6 w-full z-10 pointer-events-none flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button variant="navigation" className="pointer-events-auto">
          <img src={arrowLeftIcon} alt="Arrow Left" />
        </Button>
        <div className="pointer-events-auto">
          <NewsButtonComponent />
        </div>
        <div className="pointer-events-auto">
          <LiveButtonComponent />
        </div>
      </div>
      <div className="flex gap-6">
        {" "}
        {onThemeChange && (
          <ThemeToggleComponent theme={theme} onThemeChange={onThemeChange} />
        )}
        <TimeFiltersComponent />
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
  );
}

export default MainNavigation;
