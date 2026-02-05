import { useState } from "react";
import {
  GlobusMapboxComponent,
  NavbarComponent,
  MainNavigationComponent,
  // TokenGate,
} from "./components";
import { Theme } from "./components/GlobusMapbox/constants/mapConfig";

export type TimeFilter = "1h" | "6h" | "24h";

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
        theme={theme}
        onThemeChange={changeTheme}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        onMobileMenuChange={handleMobileMenuChange}
        onSearchFocus={handleSearchFocus}
      />
      <GlobusMapboxComponent
        timeFilter={timeFilter}
        isMobileMenuOpen={isMobileMenuOpen}
        onThemeChange={(currentTheme, changeThemeFn) => {
          setTheme(currentTheme);
          if (!changeTheme) {
            setChangeTheme(() => changeThemeFn);
          }
        }}
        onSpinStateChange={(pausedState, toggleSpinFn) => {
          setIsPaused(pausedState);
          if (!toggleSpin) {
            setToggleSpin(() => toggleSpinFn);
          }
        }}
      />
      <MainNavigationComponent
        theme={theme}
        onThemeChange={changeTheme}
        isPaused={isPaused}
        onToggleSpin={toggleSpin}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        isMobileMenuOpen={isMobileMenuOpen}
        onClosePopups={(closeFn) => {
          if (!closePopups) {
            setClosePopups(() => closeFn);
          }
        }}
      />
    </div>
    // </TokenGate>
  );
}

export default App;
