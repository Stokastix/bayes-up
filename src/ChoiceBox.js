import React from "react";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";

export default ({ choice, guess, setGuess, background, submitted }) => {
  const handleSliderChange = (event, newValue) => {
    if (submitted) return;
    setGuess(newValue);
  };

  const handleInputChange = event => {
    if (submitted) return;
    setGuess(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleBlur = () => {
    if (submitted) return;
    if (guess < 0) setGuess(0);
    if (guess > 100) setGuess(100);
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
      </div>{" "}
      <Slider
        value={typeof guess === "number" ? guess : 0}
        onChange={handleSliderChange}
        aria-labelledby="input-slider"
      />
      <span>{guess}%</span>
    </div>
  );
};
