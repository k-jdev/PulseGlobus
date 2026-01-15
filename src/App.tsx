import { useState } from "react";
import {
  GlobusMapboxComponent,
  NavbarComponent,
  MainNavigationComponent,
} from "./components";
import { Theme } from "./components/GlobusMapbox/constants/mapConfig";

export type TimeFilter = "1h" | "6h" | "24h";

// Check if mobile on initial load
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

  // Close all popups when mobile menu opens
  const handleMobileMenuChange = (isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
    if (isOpen && closePopups) {
      closePopups();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <NavbarComponent
        theme={theme}
        onThemeChange={changeTheme}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        onMobileMenuChange={handleMobileMenuChange}
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
  );
}

export default App;
