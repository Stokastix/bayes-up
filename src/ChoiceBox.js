import React from "react";
import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";

const CustomSlider = withStyles({
  root: {
    height: 24,
    padding: "6px 0px",
    flex: "0 0 auto",
    width: "95%"
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

export default ({
  choice,
  guess,
  setGuess,
  submitted,
  isCorrect,
  baseScore
}) => {
  const background = submitted && isCorrect ? "green" : "#bbbbbb";

  const handleSliderChange = (event, newValue) => {
    if (submitted) return;
    setGuess(newValue);
  };

  const error = isCorrect ? (100 - guess) ** 2 / 1000 : guess ** 2 / 1000;
  const scoreIfRight = 10 - (100 - guess) ** 2 / 1000;
  const scoreIfWrong = guess ** 2 / 1000;
  const score = isCorrect ? scoreIfRight : scoreIfWrong;

  const colorRight = !submitted || isCorrect ? "black" : "transparent";
  const colorWrong = !submitted || !isCorrect ? "black" : "transparent";

  return (
    <div className="choiceContainer" style={{ background }}>
      <div className="choice">
        <div className="choiceText">
          <span>{choice}</span>
        </div>
      </div>
      <div className="sliderValue">
        <span style={{ color: colorRight }}>+{scoreIfRight.toFixed(2)}</span>
        <span>{guess.toFixed(0)}%</span>
        <span style={{ color: colorWrong }}>-{scoreIfWrong.toFixed(2)}</span>
      </div>
      <div className="sliderContainer">
        <CustomSlider
          value={typeof guess === "number" ? guess : 0}
          onChange={handleSliderChange}
          aria-labelledby="input-slider"
          step={5}
        />
      </div>
    </div>
  );
};
