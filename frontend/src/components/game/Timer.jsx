import { useGame } from "../../context/GameContext";

function formatTime(seconds) {
  if (seconds === null) return "∞";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Timer() {
  const {
    whiteTime,
    blackTime,
    activeTimer,
  } = useGame();

  return (
    <div className="timer-panel">

      <div
        className={`timer timer-white ${
          activeTimer === "w" ? "active" : ""
        }`}
      >
        <div className="timer-label">White</div>
        <div className="timer-value">
          {formatTime(whiteTime)}
        </div>
      </div>

      <div
        className={`timer timer-black ${
          activeTimer === "b" ? "active" : ""
        }`}
      >
        <div className="timer-label">Black</div>
        <div className="timer-value">
          {formatTime(blackTime)}
        </div>
      </div>

    </div>
  );
}