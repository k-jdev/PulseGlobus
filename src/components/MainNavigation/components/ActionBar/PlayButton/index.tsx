import { playIcon, pauseIcon } from "../../../../../assets/svgs/mainNavigation";
import { Button } from "../../../../ui";

interface PlayButtonProps {
  isPaused: boolean;
  onToggleSpin: () => void;
  isMobile?: boolean;
}

function PlayButton({
  isPaused,
  onToggleSpin,
  isMobile = false,
}: PlayButtonProps) {
  return (
    <Button
      variant="navigation"
      onClick={onToggleSpin}
      className={isMobile ? "p-3" : ""}
    >
      <img
        src={isPaused ? playIcon : pauseIcon}
        alt={isPaused ? "Play" : "Pause"}
        className={isMobile ? "w-5 h-5" : ""}
      />
    </Button>
  );
}

export default PlayButton;
