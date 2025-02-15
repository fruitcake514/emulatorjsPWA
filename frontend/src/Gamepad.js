import React from "react";

const buttons = [
  { id: "A", label: "A" },
  { id: "B", label: "B" },
  { id: "X", label: "X" },
  { id: "Y", label: "Y" },
  { id: "UP", label: "↑" },
  { id: "DOWN", label: "↓" },
  { id: "LEFT", label: "←" },
  { id: "RIGHT", label: "→" },
  { id: "START", label: "Start" },
  { id: "SELECT", label: "Select" },
];

const Gamepad = ({ sendInput }) => {
  return (
    <div className="gamepad">
      {buttons.map((button) => (
        <button
          key={button.id}
          onMouseDown={() => sendInput(button.id, true)}
          onMouseUp={() => sendInput(button.id, false)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default Gamepad;
