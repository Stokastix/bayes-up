import React, { useState } from "react";
import * as firebase from "firebase/app";
import ChoiceBox from "./ChoiceBox";

import { getColor, shuffle } from "./utils";
import { db } from "./";
import { withRouter } from "react-router-dom";

const Quiz = ({ quiz, history, setQuiz }) => {
  const [background, setBackground] = useState(getColor);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [guesses, setGuesses] = useState({});
  const [times, setTimes] = useState([]);
  const [choiceList, setChoiceList] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [startTime, setStartTime] = useState(null);

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

  if (!startTime) {
    setStartTime(new Date());
  }

  const { questions, name, quizId, questionIds } = quiz;

  const next = () => {
    setStartTime(new Date());
    setStep(step + 1);
    setBackground(getColor);
    setChoiceList(null);
    setSubmitted(false);
    if (step === questions.length - 1) {
      saveEvent();
      saveUserStats();
      saveQuizStats();
    }
  };

  const [question, ..._choices] = questions[step];
  const choices = _choices.filter(x => !!x);
  if (!guesses[step]) {
    guesses[step] = choices.map(_ => 0);
    setGuesses({ ...guesses });
    setChoiceList(shuffle(choices.map((c, i) => [c, i])));
    return null;
  }

  const setGuess = i => x => {
    guesses[step][i] = x;
    setGuesses({ ...guesses });
  };

  const totalGuess = guesses[step].reduce((a, b) => a + b, 0);
  const [first, ...others] = guesses[step];
  const loss = (100 - first) ** 2 + others.reduce((a, b) => a + b ** 2, 0);
  const score = (10000 - loss) / 1000;

  const saveEvent = () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;
    db.collection("events").add({
      quizId: quizId || "missing id",
      quizName: name || "missing name",
      questionIds: questionIds || [],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      guesses,
      times,
      score: totalScore,
      userid
    });
  };

  const saveUserStats = () => {
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

  const saveQuizStats = () => {
    const update = { participants: firebase.firestore.FieldValue.increment(1) };
    Object.entries(guesses).forEach(([k, guesses]) => {
      guesses.forEach((g, i) => {
        update[`${k}_${i}`] = firebase.firestore.FieldValue.increment(g);
      });
    });

    db.collection("results")
      .doc(quizId)
      .set(update, { merge: true });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTotalScore(totalScore + score);
    // TODO count time
    const answerTime = Number(new Date() - startTime);
    setTimes([...times, answerTime]);
  };

  return (
    <div className="rootColumn" style={{ background }}>
      <div className="quiz-header">
        <div className="quiz-progress">
          <div
            style={{
              width: `${((100 * step) / questions.length).toFixed(0)}%`
            }}
          />
          <span>
            Question {step + 1} / {questions.length}
          </span>
        </div>
        <div
          className="quitQuizButton"
          onClick={() => saveEvent() || quitQuiz()}
        >
          <span>Quit</span>
        </div>
      </div>
      <h1>{question}</h1>
      {choiceList.map(([c, i]) => (
        <ChoiceBox
          key={question + c}
          choice={c}
          submitted={submitted}
          guess={guesses[step][i]}
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
    </div>
  );
};

export default withRouter(Quiz);
