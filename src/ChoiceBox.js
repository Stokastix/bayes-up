import React from "react";
import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";
import Latex from "react-latex"

const CustomSlider = withStyles({
  root: {
    height: 24,
    padding: "6px 0px",
    flex: "0 0 auto",
    width: "80%"
  },
  thumb: {
    height: 32,
    width: 16,
    backgroundColor: "#fff",
    border: "2px solid #222",
    marginTop: -4,
    marginLeft: -8,
    borderRadius: 4,
    "&:focus,&:hover,&$active": {
      boxShadow: "inherit"
    }
  },
  active: {},
  track: {
    height: 24,
    borderRadius: 2,
    backgroundColor: "#111"
  },
  rail: {
    height: 24,
    borderRadius: 2,
    backgroundColor: "#333"
  }
})(Slider);

export default ({ choice, guess, setGuess, background, submitted }) => {
  const handleSliderChange = (event, newValue) => {
    if (submitted) return;
    setGuess(newValue);
  };

  return (
    <div className="choiceContainer" style={{ background }}>
      <div className="choice">
        <button
          className="fullwidth-button"
          disabled={guess < 1 || submitted}
          onClick={() => setGuess(guess - 5)}
        >
          -
        </button>
        <Latex>{choice}</Latex>
        <button
          className="fullwidth-button"
          disabled={guess > 99 || submitted}
          onClick={() => setGuess(guess + 5)}
        >
          +
        </button>
      </div>
      <div className="sliderContainer">
        <CustomSlider
          value={typeof guess === "number" ? guess : 0}
          onChange={handleSliderChange}
          aria-labelledby="input-slider"
          step={5}
        />
        <span className="sliderValue">{guess}%</span>
      </div>
    </div>
  );
};
