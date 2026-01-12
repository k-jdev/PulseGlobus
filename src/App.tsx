import { useState } from "react";
import {
  GlobusMapboxComponent,
  NavbarComponent,
  MainNavigationComponent,
} from "./components";
import { Theme } from "./components/GlobusMapbox/constants/mapConfig";

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [changeTheme, setChangeTheme] = useState<
    ((theme: Theme) => void) | null
  >(null);
  const [isPaused, setIsPaused] = useState(false);
  const [toggleSpin, setToggleSpin] = useState<(() => void) | null>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <NavbarComponent />
      <GlobusMapboxComponent
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
      />
    </div>
  );
}

export default App;
