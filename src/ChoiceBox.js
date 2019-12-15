import React from "react";
import Slider from "@material-ui/core/Slider";

export default ({ choice, guess, setGuess, background, submitted }) => {
  const handleSliderChange = (event, newValue) => {
    if (submitted) return;
    setGuess(newValue);
  };

  return (
    <div className="choiceContainer" style={{ background }}>
      <div className="choice">
        <button
          disabled={guess < 1 || submitted}
          onClick={() => setGuess(guess - 1)}
        >
          -
        </button>
        <span>{choice}</span>
        <button
          disabled={guess > 99 || submitted}
          onClick={() => setGuess(guess + 1)}
        >
          +
        </button>
      </div>
      <Slider
        value={typeof guess === "number" ? guess : 0}
        onChange={handleSliderChange}
        aria-labelledby="input-slider"
        style={{ width: "70%" }}
      />
      <span>{guess}%</span>
    </div>
  );
};
