import React, { useState } from "react";
import { getColor } from "./utils";
import { db } from "./";
import * as firebase from "firebase/app";
import Choice from "./ChoiceBox";

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

  const setGuess = i => x => {
    guesses[i] = x;
    setGuesses([...guesses]);
  };

  const totalGuess = guesses.reduce((a, b) => a + b, 0);
  const [first, ...next] = guesses;
  const loss = (100 - first) ** 2 + next.reduce((a, b) => a + b ** 2, 0);
  const score = Math.round((10000 - loss) / 100) / 10;

  const handleSubmit = () => {
    setSubmitted(true);

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
    const update = Object.entries(_update).reduce((acc, [k, v]) => {
      acc[k] = firebase.firestore.FieldValue.increment(v);
      return acc;
    }, {});
    db.collection("stats")
      .doc(userid)
      .set(update, { merge: true });
  };

  const backButton = (
    <button onClick={() => setView("quizList")}>Back to list</button>
  );

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
          setGuess={setGuess(i)}
        />
      ))}
      {!submitted && (
        <>
          <h2>Total guess: {totalGuess}%</h2>
          <button onClick={handleSubmit}>Submit</button>
          {backButton}
        </>
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
          {backButton}
        </>
      )}
    </div>
  );
};
