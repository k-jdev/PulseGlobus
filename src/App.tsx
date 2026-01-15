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

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <NavbarComponent
        theme={theme}
        onThemeChange={changeTheme}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
      />
      <GlobusMapboxComponent
        timeFilter={timeFilter}
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
      />
    </div>
  );
}

export default App;
