import React, { useState } from "react";
import { getColor } from "./utils";
import { db, login } from "./";
import * as firebase from "firebase/app";

const ProgressBar = ({ progress }) => {
  const p = Math.round(progress * 100);
  return (
    <div className="progresscontainer">
      <span>{`${p}%`}</span>
      <div className="progressbar" style={{ width: `${p}%` }} />
    </div>
  );
};

const Choice = ({ choice, guess, setGuess, background, submitted }) => {
  return (
    <div className="choiceContainer" style={{ background }}>
      <div className="choice">
        <button
          disabled={guess < 0.05 || submitted}
          onClick={() => setGuess(guess - 0.1)}
        >
          -
        </button>
        <span>{choice}</span>
        <button
          disabled={guess > 0.95 || submitted}
          onClick={() => setGuess(guess + 0.1)}
        >
          +
        </button>
      </div>
      <ProgressBar progress={guess} />
    </div>
  );
};

export default ({ quiz, setView, setQuiz }) => {
  const [background, setBackground] = useState(getColor);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [guesses, setGuesses] = useState(null);
  const [choiceList, setChoiceList] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  if (!quiz) {
    return (
      <div id="quizend" className="rootColumn" style={{ background }}>
        <p>Loading quiz</p>
      </div>
    );
  }

  if (step >= quiz.questions.length) {
    return (
      <div id="quizend" className="rootColumn" style={{ background }}>
        <h1>Congratulations !</h1>
        <h2>
          You score a total of {totalScore.toFixed(1)} out of{" "}
          {10 * quiz.questions.length} points.
        </h2>
        <button
          onClick={() => {
            setView("home");
            setQuiz(null);
          }}
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const [question, ...choices] = quiz.questions[step];
  if (guesses === null) {
    setGuesses(choices.map(_ => 0));
    setChoiceList(
      choices.map((c, i) => [c, i]).sort(() => 0.5 - Math.random())
    );
    return null;
  }

  const totalGuess = Math.round(100 * guesses.reduce((a, b) => a + b, 0));
  const [first, ...next] = guesses;
  const score =
    10 * (1 - (1 - first) ** 2 - next.reduce((a, b) => a + b ** 2, 0));
  return (
    <div id="quiz" className="rootColumn" style={{ background }}>
      <h1>{question}</h1>
      {choiceList.map(([c, i]) => (
        <Choice
          key={question + c}
          choice={c}
          background={submitted && i === 0 ? "green" : "#bbbbbb"}
          submitted={submitted}
          guess={guesses[i]}
          setGuess={x => {
            guesses[i] = x;
            setGuesses([...guesses]);
          }}
        />
      ))}
      {!submitted && (
        <button
          disabled={totalGuess !== 100}
          onClick={() => {
            setSubmitted(true);
            console.log(login);
            console.log(db);
            db.collection("events").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              guesses,
              userid: login
            });

            const [correctGuess, ...incorrectGuesses] = guesses;
            const _update = incorrectGuesses.reduce(
              (acc, val) => {
                const key = `Incorrect_${Math.round(100 * val)}%`;
                acc[key] = acc[key] ? acc[key] + 1 : 1;
                return acc;
              },
              {
                [`Correct_${Math.round(100 * correctGuess)}%`]: 1
              }
            );
            const update = Object.entries(_update).reduce((acc, [k, v]) => {
              acc[k] = firebase.firestore.FieldValue.increment(v);
              return acc;
            }, {});
            db.collection("stats")
              .doc(login)
              .update(update);
          }}
        >
          Submit
        </button>
      )}
      {submitted && (
        <>
          <h2>You scored {score.toFixed(1)} points</h2>
          <button
            onClick={() => {
              setStep(step + 1);
              setGuesses(null);
              setBackground(getColor);
              setChoiceList(null);
              setSubmitted(false);
              setTotalScore(totalScore + score);
            }}
          >
            Next
          </button>
        </>
      )}
    </div>
  );
};
