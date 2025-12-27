import { useRef } from "react";
import { useMapbox } from "./hooks";
import { MapContainer } from "./components";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { theme, changeTheme } = useMapbox(mapContainerRef);

  return (
    <MapContainer
      mapContainerRef={mapContainerRef}
      theme={theme}
      onThemeChange={changeTheme}
    />
  );
};

export default MapboxExample;
