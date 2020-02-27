import React, { useState } from "react";
import * as firebase from "firebase/app";
import { withRouter } from "react-router-dom";

import { getColor } from "../utils";

import Question from "./Question";
import Youtube from "./Youtube";
import Markdown from "./Markdown";

const QuizHeader = ({ step, total, quit }) => {
  return (
    <div className="quiz-header">
      <div className="quiz-progress">
        <div
          style={{
            width: `${((100 * step) / total).toFixed(0)}%`
          }}
        />
        <span>
          Step {step + 1} / {total}
        </span>
      </div>
      <div className="quitQuizButton" onClick={quit}>
        <span>Quit</span>
      </div>
    </div>
  );
};

const QuizContent = ({ content, ...props }) => {
  const [contentType, ...c] = content;
  if (contentType === "QUESTION") {
    return <Question content={c} {...props} />;
  }
  if (contentType === "YOUTUBE") {
    return <Youtube content={c} {...props} />;
  }
  if (contentType === "MARKDOWN") {
    return <Markdown content={c} {...props} />;
  }
  return <Question content={content} {...props} />;
};

const Quiz = ({ quiz, history, setQuiz }) => {
  const [background, setBackground] = useState(getColor);
  const [step, setStep] = useState(0);
  const [guesses, setGuesses] = useState({});
  const [times, setTimes] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const quitQuiz = () => {
    history.push("/home");
    setQuiz(null);
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
    if (step === questions.length - 1) {
      saveEvent();
      saveUserStats();
      saveQuizStats();
    }
  };

  const submit = contentSubmitted => {
    // setTotalScore(totalScore + score);
    // const answerTime = Number(new Date() - startTime);
    // setTimes([...times, answerTime]);
    //  guesses[step] = choices.map(_ => 0);
    //  setGuesses({ ...guesses });
  };

  const saveEvent = () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;

    const db = firebase.firestore();
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

    const db = firebase.firestore();
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

    const db = firebase.firestore();
    db.collection("results")
      .doc(quizId)
      .set(update, { merge: true });
  };

  return (
    <div className="rootColumn" style={{ background }}>
      <QuizHeader
        step={step}
        total={questions.length}
        quit={() => saveEvent() || quitQuiz()}
      />
      <QuizContent content={questions[step]} next={next} submit={submit} />
    </div>
  );
};

export default withRouter(Quiz);
