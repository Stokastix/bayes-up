import React, { useState } from "react";
import ChoiceBox from "./ChoiceBox";
import { shuffle, computeScore } from "../utils";

export default ({ content, next, submit }) => {
  const [submitted, setSubmitted] = useState(false);
  const [choiceList, setChoiceList] = useState(null);
  const [guess, _setGuess] = useState([]);

  const [question, ..._choices] = content;
  if (!choiceList) {
    const choices = _choices.filter(x => !!x);
    setChoiceList(shuffle(choices.map((c, i) => [c, i])));
    _setGuess(choices.map(() => 0));
    return null;
  }

  const handleSubmit = () => {
    setSubmitted(true);
    submit(guess);
  };

  const setGuess = i => x => {
    guess[i] = x;
    _setGuess([...guess]);
  };

  const totalGuess = guess.reduce((a, b) => a + b, 0);
  const score = computeScore(guess[0] / 100);

  return (
    <>
      <h1>{question}</h1>
      {choiceList.map(([c, i]) => (
        <ChoiceBox
          key={question + c}
          choice={c}
          submitted={submitted}
          guess={guess[i]}
          setGuess={setGuess(i)}
          isCorrect={i === 0}
        />
      ))}
      {submitted ? (
        <h2>You scored {score.toFixed(1)} points</h2>
      ) : (
        <h2>Total guess: {totalGuess.toFixed(0)}%</h2>
      )}
      {submitted ? (
        <button className="fullwidth-button" onClick={next}>
          Next
        </button>
      ) : (
        <button className="fullwidth-button" onClick={handleSubmit}>
          Submit
        </button>
      )}
    </>
  );
};
