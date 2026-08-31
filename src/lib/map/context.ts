import { createContext, useContext } from "react";

import type { Theme } from "@/types";

/**
 * Imperative handles exposed by the mapbox instance. They cannot live in Redux
 * (functions are not serialisable), so the map registers them here and the
 * navigation consumes them.
 */
export interface MapControls {
  changeTheme: (theme: Theme) => void;
  toggleSpin: () => void;
}

export interface MapControlContextValue {
  controls: MapControls | null;
  registerControls: (controls: MapControls | null) => void;
}

export const MapControlContext = createContext<MapControlContextValue | null>(
  null,
);

export function useMapControls(): MapControlContextValue {
  const context = useContext(MapControlContext);
  if (!context) {
    throw new Error("useMapControls must be used inside a MapControlProvider");
  }
  return context;
}
