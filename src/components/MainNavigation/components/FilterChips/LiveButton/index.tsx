import { Button } from "../../../../ui";
import { arrowDownIcon } from "../../../../../assets/svgs/mainNavigation";

interface LiveButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

function LiveButton({ isOpen, onClick }: LiveButtonProps) {
  return (
    <Button
      variant="navigation"
      className="flex gap-2 items-center"
      onClick={onClick}
    >
      <div className="w-2 h-2 bg-[#53BB33] rounded-full animate-pulse" />
      <p className="text-[#53BB33]">Live</p>
      <img
        src={arrowDownIcon}
        alt="Arrow Down"
        className={`transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </Button>
  );
}

export default LiveButton;
