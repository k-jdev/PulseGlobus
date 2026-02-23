import { CSSProperties } from "react";
import { Theme } from "../constants/mapConfig";

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const DESKTOP_NAV_HEIGHT = 140; // Navbar (72px) + SubNavigation (~68px)
const MOBILE_NAV_HEIGHT = 128; // Navbar (72px) + Mobile SubNavigation (~56px)

const lightContainerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  background: "radial-gradient(circle at center, #0048FF 0%, #001D68 100%)",
  overflow: "hidden",
};

const darkContainerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  background: "radial-gradient(circle at center, #1a1a2e 0%, #0d0d14 100%)",
  overflow: "hidden",
};

const responsiveContainerStyle = `
  .globe-map-container {
    margin-top: ${MOBILE_NAV_HEIGHT}px;
    height: calc(100vh - ${MOBILE_NAV_HEIGHT}px);
  }
  @media (min-width: 768px) {
    .globe-map-container {
      margin-top: ${DESKTOP_NAV_HEIGHT}px;
      height: calc(100vh - ${DESKTOP_NAV_HEIGHT}px);
    }
  }
`;

const mapStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "0px",
  position: "relative",
  zIndex: 2,
};

const lightDotsOverlayStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  backgroundImage:
    "radial-gradient(circle, rgba(255, 255, 255, 0.10) 1.5px, transparent 1.5px)",
  backgroundSize: "20px 20px",
  zIndex: 1,
};

const darkDotsOverlayStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  backgroundImage:
    "radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
  backgroundSize: "20px 20px",
  zIndex: 1,
};

const lightPopupOverrideStyle = `
  .mapboxgl-popup {
    z-index: 999 !important;
  }
  
  .mapboxgl-map {
    background: transparent !important;
  }
`;

const darkPopupOverrideStyle = `
  .mapboxgl-popup {
    z-index: 999 !important;
  }
  
  .mapboxgl-map {
    background: transparent !important;
  }
`;

export const MapContainer = ({ mapContainerRef, theme }: MapContainerProps) => {
  const containerStyle =
    theme === "light" ? lightContainerStyle : darkContainerStyle;
  const dotsStyle =
    theme === "light" ? lightDotsOverlayStyle : darkDotsOverlayStyle;
  const popupStyle =
    theme === "light" ? lightPopupOverrideStyle : darkPopupOverrideStyle;

  return (
    <div className="globe-map-container" style={containerStyle}>
      <style>
        {responsiveContainerStyle}
        {popupStyle}
      </style>
      <div style={dotsStyle} />
      <div ref={mapContainerRef} style={mapStyle} />
    </div>
  );
};
