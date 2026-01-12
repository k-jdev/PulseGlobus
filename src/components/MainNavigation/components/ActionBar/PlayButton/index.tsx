import { playIcon, pauseIcon } from "../../../../../assets/svgs/mainNavigation";
import { Button } from "../../../../ui";

interface PlayButtonProps {
  isPaused: boolean;
  onToggleSpin: () => void;
}

function PlayButton({ isPaused, onToggleSpin }: PlayButtonProps) {
  return (
    <Button variant="navigation" onClick={onToggleSpin}>
      <img
        src={isPaused ? playIcon : pauseIcon}
        alt={isPaused ? "Play" : "Pause"}
      />
    </Button>
  );
}

export default PlayButton;
