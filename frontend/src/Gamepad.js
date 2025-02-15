import React from "react";

const Gamepad = ({ sendInput }) => {
  const buttons = ["UP", "DOWN", "LEFT", "RIGHT", "A", "B", "START", "SELECT"];

  return (
    <div className="gamepad">
      {buttons.map((btn) => (
        <button
          key={btn}
          onTouchStart={() => sendInput(btn, "press")}
          onTouchEnd={() => sendInput(btn, "release")}
        >
          {btn}
        </button>
      ))}
    </div>
  );
};

export default Gamepad;
