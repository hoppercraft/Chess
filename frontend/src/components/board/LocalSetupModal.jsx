import { useState } from "react";

export default function LocalSetupModal({ onSelect }) {

  const [autoFlip, setAutoFlip] = useState(true);

  const [timeControl, setTimeControl] = useState(600); // just the number of seconds, matches TIME_OPTIONS.value;
  const TIME_OPTIONS = [
  { label: "Unlimited", value: null },
  { label: "3 Minutes", value: 180 },
  { label: "5 Minutes", value: 300 },
  { label: "10 Minutes", value: 600 },
  { label: "15 Minutes", value: 900 },
  { label: "30 Minutes", value: 1800 },
];
  return (
  <div className="local-setup-overlay">
    <div className="local-setup-modal">

      <div className="local-setup-header">
        <h2>Local Game Setup</h2>
        <p className="local-setup-subtitle">
          Configure your match before starting.
        </p>
      </div>

      <div className="setup-section">
        <h3>Time Control</h3>

        <div className="time-options">
          {TIME_OPTIONS.map(option => (
            <button
              key={option.label}
              className={`time-option ${
                timeControl === option.value ? "selected" : ""
              }`}
              onClick={() => setTimeControl(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setup-section">
        <h3>Board Perspective</h3>

        <div className="flip-options">
          <button
            className={`flip-option ${autoFlip ? "selected" : ""}`}
            onClick={() => setAutoFlip(true)}
          >
            Auto Flip
          </button>

          <button
            className={`flip-option ${!autoFlip ? "selected" : ""}`}
            onClick={() => setAutoFlip(false)}
          >
            Static
          </button>
        </div>
      </div>

      <button
        className="start-game-btn"
        onClick={() =>
          onSelect({
            autoFlip,
          timeControl: {
    initial: timeControl,
    increment: 0,
  },
          })
        }
      >
        Start Game
      </button>

    </div>
  </div>
)
}