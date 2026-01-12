import { useState } from "react";
import { Button } from "../../../../ui";
import { arrowDownIcon } from "../../../../../assets/svgs/mainNavigation";

function NewsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Button
      variant="navigation"
      className="flex gap-2 items-center"
      onClick={() => setIsOpen(!isOpen)}
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
