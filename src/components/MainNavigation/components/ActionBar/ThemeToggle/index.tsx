import { sunIcon, moonIcon } from "../../../../../assets/svgs/mainNavigation";
import { Theme } from "../../../../GlobusMapbox/constants/mapConfig";

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <div className="flex gap-2 items-center pointer-events-auto">
      <button
        onClick={() => onThemeChange("light")}
        className={`w-[48px] h-[48px] flex items-center justify-center rounded-full border-[0.556px] border-[rgba(0,0,0,0.12)] transition-all ${
          theme === "light" ? "bg-white" : "bg-[rgba(255,255,255,0.2)]"
        }`}
        title="Light theme"
      >
        <img src={sunIcon} alt="Sun" className="w-6 h-6" />
      </button>
      <button
        onClick={() => onThemeChange("dark")}
        className={`w-[48px] h-[48px] flex items-center justify-center rounded-full border-[0.556px] border-[rgba(0,0,0,0.12)] transition-all ${
          theme === "dark" ? "bg-white" : "bg-[rgba(255,255,255,0.2)]"
        }`}
        title="Dark theme"
      >
        <img src={moonIcon} alt="Moon" className="w-6 h-6" />
      </button>
    </div>
  );
}

export default ThemeToggle;
