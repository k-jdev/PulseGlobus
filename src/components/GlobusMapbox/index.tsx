import { useRef } from "react";
import { useMapbox } from "./hooks";
import { MapContainer } from "./components";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

interface GlobusMapboxProps {
  onThemeChange?: (theme: any, changeTheme: any) => void;
  onSpinStateChange?: (isPaused: boolean, toggleSpin: () => void) => void;
}

const GlobusMapbox = ({
  onThemeChange,
  onSpinStateChange,
}: GlobusMapboxProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { theme, changeTheme, isPaused, toggleSpin } =
    useMapbox(mapContainerRef);

  if (onThemeChange) {
    onThemeChange(theme, changeTheme);
  }

  if (onSpinStateChange) {
    onSpinStateChange(isPaused, toggleSpin);
  }

  return (
    <MapContainer
      mapContainerRef={mapContainerRef}
      theme={theme}
      onThemeChange={changeTheme}
    />
  );
};

export default GlobusMapbox;
