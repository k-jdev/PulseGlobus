import { useState } from "react";
import { Button } from "../../../../ui";
import { arrowDownIcon } from "../../../../../assets/svgs/mainNavigation";

function LiveButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Button
      variant="navigation"
      className="flex gap-2 items-center"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="w-2 h-2 bg-[#53BB33] rounded-full"> </div>
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
