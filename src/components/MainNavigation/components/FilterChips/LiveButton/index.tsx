import { Button } from "@/components/ui";
import { arrowDownIcon } from "@/assets/svgs/mainNavigation";

interface LiveButtonProps {
  isOpen: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

function LiveButton({ isOpen, onClick, isMobile = false }: LiveButtonProps) {
  return (
    <Button
      variant="navigation"
      className={`flex gap-2 items-center ${
        isMobile ? "px-4 py-2 text-sm" : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`bg-[#53BB33] rounded-full animate-pulse ${
          isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
        }`}
      />
      <p className="text-[#53BB33]">Live</p>
      <img
        src={arrowDownIcon}
        alt="Arrow Down"
        className={`transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        } ${isMobile ? "w-3 h-3" : ""}`}
      />
    </Button>
  );
}

export default LiveButton;
