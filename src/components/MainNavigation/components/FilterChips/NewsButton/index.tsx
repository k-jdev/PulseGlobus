import { Button } from "../../../../ui";
import { arrowDownIcon } from "../../../../../assets/svgs/mainNavigation";

interface NewsButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

function NewsButton({ isOpen, onClick }: NewsButtonProps) {
  return (
    <Button
      variant="navigation"
      className="flex gap-2 items-center"
      onClick={onClick}
    >
      <p>Breaking</p>
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

export default NewsButton;
