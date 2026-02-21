import { useState } from "react";
import {
  GlobusMapboxComponent,
  NavbarComponent,
  BubbleViewComponent,
  // TokenGate,
} from "./components";
import SubNavigation from "./components/SubNavigation";
import type { Category } from "./components/SubNavigation";
import { Theme } from "./components/GlobusMapbox/constants/mapConfig";

export type TimeFilter = "1h" | "6h" | "24h";
export type ViewMode = "globe" | "bubble";

// const PULSE_TOKEN_ADDRESS =
//   "0xF9877901a3D8c8D26078703004E748E66A4009b5" as `0x${string}`;
// const REQUIRED_TOKENS = 1000;

const isMobileDevice = () => window.innerWidth < 768;

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [changeTheme, setChangeTheme] = useState<
    ((theme: Theme) => void) | null
  >(null);
  const [isPaused, setIsPaused] = useState(isMobileDevice());
  const [toggleSpin, setToggleSpin] = useState<(() => void) | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");
  const [viewMode, setViewMode] = useState<ViewMode>("globe");
  const [activeCategory, setActiveCategory] = useState<Category>("All Markets");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [closePopups, setClosePopups] = useState<(() => void) | null>(null);

  const handleMobileMenuChange = (isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
    if (isOpen && closePopups) {
      closePopups();
    }
  };

  const handleSearchFocus = () => {
    if (closePopups) {
      closePopups();
    }
  };

  return (
    // <TokenGate
    //   tokenAddress={PULSE_TOKEN_ADDRESS}
    //   requiredAmount={REQUIRED_TOKENS}
    //   tokenSymbol="$PULSE"
    // >
    <div className="relative w-full h-screen overflow-hidden">
      <NavbarComponent
        theme={viewMode === "bubble" ? "light" : theme}
        onMobileMenuChange={handleMobileMenuChange}
        onSearchFocus={handleSearchFocus}
      />
      <SubNavigation
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeChange={changeTheme}
        isPaused={isPaused}
        onToggleSpin={toggleSpin}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isMobileMenuOpen={isMobileMenuOpen}
        onClosePopups={(closeFn) => {
          if (!closePopups) {
            setClosePopups(() => closeFn);
          }
        }}
      />
      {viewMode === "globe" ? (
        <GlobusMapboxComponent
          timeFilter={timeFilter}
          isMobileMenuOpen={isMobileMenuOpen}
          onThemeChange={(currentTheme, changeThemeFn) => {
            setTheme(currentTheme);
            setChangeTheme(() => changeThemeFn);
          }}
          onSpinStateChange={(pausedState, toggleSpinFn) => {
            setIsPaused(pausedState);
            setToggleSpin(() => toggleSpinFn);
          }}
        />
      ) : (
        <BubbleViewComponent
          timeFilter={timeFilter}
          activeCategory={activeCategory}
        />
      )}
    </div>
    // </TokenGate>
  );
}

export default App;
