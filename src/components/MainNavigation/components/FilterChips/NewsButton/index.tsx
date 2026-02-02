import { Button } from "@/components/ui";
import { arrowDownIcon } from "@/assets/svgs/mainNavigation";

interface NewsButtonProps {
  isOpen: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

function NewsButton({ isOpen, onClick, isMobile = false }: NewsButtonProps) {
  return (
    <Button
      variant="navigation"
      className={`flex gap-2 items-center ${
        isMobile ? "px-4 py-2 text-sm" : ""
      }`}
      onClick={onClick}
    >
      <p>Breaking</p>
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

export default NewsButton;
