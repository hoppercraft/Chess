import { useState } from "react";
import { FaClock, FaInfinity, FaDice, FaBrain, FaChessKnight, FaCrown, FaPlay, FaRobot } from "react-icons/fa6";

const TIME_OPTIONS = [
  { label: "Unlimited", sublabel: "No clock", value: null, icon: FaInfinity },
  { label: "3 min", sublabel: "Bullet", value: 180, icon: FaClock },
  { label: "5 min", sublabel: "Blitz", value: 300, icon: FaClock },
  { label: "10 min", sublabel: "Rapid", value: 600, icon: FaClock },
  { label: "15 min", sublabel: "Rapid", value: 900, icon: FaClock },
  { label: "30 min", sublabel: "Classical", value: 1800, icon: FaClock },
];

// Seconds added to a player's clock after each move they make.
const INCREMENT_OPTIONS = [0, 1, 2, 3, 5, 10, 15, 30];

const LEVELS = [
  { val: 0, label: "Random", desc: "Plays legal moves at random", icon: FaDice },
  { val: 1, label: "Minimax", desc: "Minimax search, depth 1", icon: FaBrain },
  { val: 2, label: "Pruning", desc: "Alpha-beta search, depth 2", icon: FaChessKnight },
  { val: 3, label: "Master", desc: "Optimized search, depth 3", icon: FaCrown },
];

export default function EngineSetupModal({ onSelect }) {
  const [level, setLevel] = useState(1);
  const [timeControl, setTimeControl] = useState(600); // seconds, matches TIME_OPTIONS.value
  const [increment, setIncrement] = useState(0); // seconds added per move, matches INCREMENT_OPTIONS

  const isUnlimited = timeControl === null;

  return (
    <div className="local-setup-overlay">
      <div className="local-setup-modal">

        <div className="local-setup-header">
          <span className="local-setup-icon"><FaRobot /></span>
          <h2>Play vs Computer</h2>
          <p className="local-setup-subtitle">
            Configure your match before starting.
          </p>
        </div>

        <div className="setup-section">
          <h3>Difficulty</h3>

          <div className="difficulty-options">
            {LEVELS.map(lvl => {
              const Icon = lvl.icon;
              return (
                <button
                  key={lvl.val}
                  className={`difficulty-option ${level === lvl.val ? "selected" : ""}`}
                  onClick={() => setLevel(lvl.val)}
                  type="button"
                >
                  <Icon className="difficulty-option-icon" />
                  <span className="difficulty-option-text">
                    <span className="difficulty-option-label">{lvl.label}</span>
                    <span className="difficulty-option-desc">{lvl.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="setup-section">
          <h3>Time Control</h3>

          <div className="time-options">
            {TIME_OPTIONS.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.label}
                  className={`time-option ${
                    timeControl === option.value ? "selected" : ""
                  }`}
                  onClick={() => {
                    setTimeControl(option.value);
                    if (option.value === null) setIncrement(0);
                  }}
                  type="button"
                >
                  <Icon className="time-option-icon" />
                  <span className="time-option-label">{option.label}</span>
                  <span className="time-option-sublabel">{option.sublabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`setup-section ${isUnlimited ? "setup-section--disabled" : ""}`}>
          <h3>Increment</h3>

          <div className="increment-options">
            {INCREMENT_OPTIONS.map(value => (
              <button
                key={value}
                className={`increment-option ${increment === value ? "selected" : ""}`}
                onClick={() => setIncrement(value)}
                disabled={isUnlimited}
                type="button"
              >
                +{value}s
              </button>
            ))}
          </div>
          {isUnlimited && (
            <p className="increment-hint">Not available with an unlimited clock.</p>
          )}
        </div>

        <button
          className="start-game-btn"
          onClick={() =>
            onSelect({
              level,
              timeControl: {
                initial: timeControl,
                increment: isUnlimited ? 0 : increment,
              },
            })
          }
          type="button"
        >
          <FaPlay />
          Start Game
        </button>

      </div>
    </div>
  );
}
