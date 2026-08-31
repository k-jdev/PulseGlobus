import { useMemo, useRef, useState, type ReactNode } from "react";

import {
  MapControlContext,
  type MapControls,
  type MapControlContextValue,
} from "./context";

export function MapControlProvider({ children }: { children: ReactNode }) {
  const [controls, setControls] = useState<MapControls | null>(null);
  const controlsRef = useRef<MapControls | null>(null);

  const value = useMemo<MapControlContextValue>(
    () => ({
      controls,
      registerControls: (next) => {
        if (controlsRef.current === next) return;
        controlsRef.current = next;
        setControls(next);
      },
    }),
    [controls],
  );

  return (
    <MapControlContext.Provider value={value}>
      {children}
    </MapControlContext.Provider>
  );
}
