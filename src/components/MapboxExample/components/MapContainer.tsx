import { CSSProperties } from "react";
import { Theme } from "../constants/mapConfig";

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const containerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100vh",
  backgroundColor: "#000000",
};

const mapStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "0px",
};

const buttonStyle: CSSProperties = {
  position: "absolute",
  top: "20px",
  right: "20px",
  zIndex: 10,
  padding: "10px 20px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
};

export const MapContainer = ({
  mapContainerRef,
  theme,
  onThemeChange,
}: MapContainerProps) => {
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    onThemeChange(newTheme);
  };

  return (
    <div style={containerStyle}>
      <div ref={mapContainerRef} style={mapStyle} />
      <button
        onClick={handleThemeToggle}
        style={buttonStyle}
        title={`Switch on ${theme === "light" ? "dark" : "light"} theme`}
      >
        {theme === "light" ? "Dark" : "Light"}
      </button>
    </div>
  );
};
