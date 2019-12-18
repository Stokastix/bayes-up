import React, { useState } from "react";
import { getColor } from "./utils";
import { db } from "./";
import * as firebase from "firebase/app";
import Choice from "./ChoiceBox";
import { withRouter } from "react-router-dom";

const Quiz = ({ quiz, history, setQuiz }) => {
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

  const quitQuiz = () => {
    history.push("/home");
    setQuiz(null);
    setChoiceList(null);
    setStep(0);
    setGuesses(null);
    setTotalScore(0);
  };

  if (step >= quiz.questions.length) {
    return (
      <div id="quizend" className="rootColumn" style={{ background }}>
        <h1>Congratulations !</h1>
        <h2>
          You score a total of {totalScore.toFixed(1)} out of{" "}
          {10 * quiz.questions.length} points.
        </h2>
        <button className="fullwidth-button" onClick={quitQuiz}>
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

  const setGuess = i => x => {
    guesses[i] = x;
    setGuesses([...guesses]);
  };

  const totalGuess = guesses.reduce((a, b) => a + b, 0);
  const [first, ...others] = guesses;
  const loss = (100 - first) ** 2 + others.reduce((a, b) => a + b ** 2, 0);
  const score = Math.round((10000 - loss) / 100) / 10;

  const handleSubmit = () => {
    setSubmitted(true);
    setTotalScore(totalScore + score);

    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;

    db.collection("events").add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      guesses,
      userid
    });

    const [correctGuess, ...incorrectGuesses] = guesses;
    const _update = incorrectGuesses.reduce(
      (acc, val) => {
        const key = `incorrect_${Math.round(val)}%`;
        acc[key] = acc[key] ? acc[key] + 1 : 1;
        return acc;
      },
      {
        [`correct_${Math.round(correctGuess)}%`]: 1
      }
    );
    const update = Object.entries(_update).reduce(
      (acc, [k, v]) => {
        acc[k] = firebase.firestore.FieldValue.increment(v);
        return acc;
      },
      { totalScore: firebase.firestore.FieldValue.increment(score) }
    );
    db.collection("stats")
      .doc(userid)
      .set(update, { merge: true });
  };

  const next = () => {
    setStep(step + 1);
    setGuesses(null);
    setBackground(getColor);
    setChoiceList(null);
    setSubmitted(false);
  };

  return (
    <div id="quiz" className="rootColumn" style={{ background }}>
      <div className="quiz-header">
        <h1>Current Score: {totalScore.toFixed(1)}</h1>
        <button onClick={quitQuiz}>Quit</button>
      </div>
      <h1>{question}</h1>
      {choiceList.map(([c, i]) => (
        <Choice
          key={question + c}
          choice={c}
          background={submitted && i === 0 ? "green" : "#bbbbbb"}
          submitted={submitted}
          guess={guesses[i]}
          setGuess={setGuess(i)}
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
    </div>
  );
};

export default withRouter(Quiz);
