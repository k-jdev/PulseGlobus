import { sunIcon, moonIcon, moonBlueIcon } from "@/assets/svgs/mainNavigation";
import { Theme } from "@/components/GlobusMapbox/constants/mapConfig";

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const handleThemeChange = (newTheme: Theme) => {
    if (theme === newTheme) return;
    onThemeChange(newTheme);
  };

  return (
    <div className="flex gap-2 items-center pointer-events-auto">
      <button
        onClick={() => handleThemeChange("light")}
        className={`w-[48px] h-[48px] flex items-center justify-center rounded-full border-[0.556px] border-[rgba(0,0,0,0.12)] transition-all ${
          theme === "light" ? "bg-white" : "bg-[rgba(255,255,255,0.2)]"
        }`}
        title="Light theme"
      >
        <img
          src={sunIcon}
          alt="Sun"
          className={`w-6 h-6 ${
            theme === "light" ? "" : "brightness-0 invert"
          }`}
        />
      </button>
      <button
        onClick={() => handleThemeChange("dark")}
        className={`w-[48px] h-[48px] flex items-center justify-center rounded-full border-[0.556px] border-[rgba(0,0,0,0.12)] transition-all ${
          theme === "dark" ? "bg-white" : "bg-[#002175]/40"
        }`}
        title="Dark theme"
      >
        <img
          src={theme === "dark" ? moonBlueIcon : moonIcon}
          alt="Moon"
          className="w-6 h-6"
        />
      </button>
    </div>
  );
}

export default ThemeToggle;
