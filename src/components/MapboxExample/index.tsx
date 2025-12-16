import { useRef } from "react";
import { useMapbox } from "./hooks";
import { MapContainer } from "./components";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  useMapbox(mapContainerRef);

  return <MapContainer mapContainerRef={mapContainerRef} />;
};

export default MapboxExample;
