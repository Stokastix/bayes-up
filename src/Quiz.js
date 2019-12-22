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
  const [guesses, setGuesses] = useState({});
  const [times, setTimes] = useState([]);
  const [choiceList, setChoiceList] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  const quitQuiz = () => {
    history.push("/home");
    setQuiz(null);
    setChoiceList(null);
    setStep(0);
    setGuesses(null);
    setTotalScore(0);
  };

  if (!quiz || step >= quiz.questions.length) {
    return (
      <div className="rootColumn" style={{ background }}>
        {!quiz && <p>Loading quiz...</p>}
        {!!quiz && (
          <>
            <h1>Congratulations !</h1>
            <h2>
              You score a total of {totalScore.toFixed(1)} out of{" "}
              {10 * quiz.questions.length} points.
            </h2>
          </>
        )}
        <button className="fullwidth-button" onClick={quitQuiz}>
          Home
        </button>
      </div>
    );
  }

  const { questions, name } = quiz;

  const next = () => {
    setStep(step + 1);
    setBackground(getColor);
    setChoiceList(null);
    setSubmitted(false);
    if (step === questions.length - 1) {
      saveEvent();
      saveStats();
    }
  };

  const [question, ..._choices] = questions[step];
  const choices = _choices.filter(x => !!x);
  if (!guesses[step]) {
    guesses[step] = choices.map(_ => 0);
    setGuesses({ ...guesses });
    setChoiceList(
      choices.map((c, i) => [c, i]).sort(() => 0.5 - Math.random())
    );
    return null;
  }

  const setGuess = i => x => {
    guesses[step][i] = x;
    setGuesses({ ...guesses });
  };

  const totalGuess = guesses[step].reduce((a, b) => a + b, 0);
  const [first, ...others] = guesses[step];
  const loss = (100 - first) ** 2 + others.reduce((a, b) => a + b ** 2, 0);
  const score = Math.round((10000 - loss) / 100) / 10;

  const saveEvent = () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;
    db.collection("events").add({
      quizId: "missing id",
      quizName: name || "missing name",
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      guesses,
      times,
      userid
    });
  };

  const saveStats = () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;

    const _update = {};
    Object.values(guesses).forEach(g => {
      const [correctGuess, ...incorrectGuesses] = g;
      const correctKey = `correct_${Math.round(correctGuess)}%`;
      _update[correctKey] = (_update[correctKey] || 0) + 1;
      incorrectGuesses.forEach(val => {
        const key = `incorrect_${Math.round(val)}%`;
        _update[key] = (_update[key] || 0) + 1;
      });
    });
    const update = Object.entries(_update).reduce(
      (acc, [k, v]) => {
        acc[k] = firebase.firestore.FieldValue.increment(v);
        return acc;
      },
      { totalScore: firebase.firestore.FieldValue.increment(totalScore) }
    );
    db.collection("stats")
      .doc(userid)
      .set(update, { merge: true });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTotalScore(totalScore + score);
    // TODO count time
    const answerTime = 42;
    setTimes([...times, answerTime]);
  };

  return (
    <div className="rootColumn" style={{ background }}>
      <div className="quiz-header">
        <h1>Current Score: {totalScore.toFixed(1)}</h1>
        <button onClick={() => saveEvent() || quitQuiz()}>Quit</button>
      </div>
      <div className="quiz-progress">
        <div
          style={{
            width: `${((100 * (step + 1)) / questions.length).toFixed(0)}%`
          }}
        />
        <span>
          Question {step + 1} / {questions.length}
        </span>
      </div>
      <h1>{question}</h1>
      {choiceList.map(([c, i]) => (
        <Choice
          key={question + c}
          choice={c}
          background={submitted && i === 0 ? "green" : "#bbbbbb"}
          submitted={submitted}
          guess={guesses[step][i]}
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
