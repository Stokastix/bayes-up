import React, { useState } from "react";
import * as firebase from "firebase/app";
import { useHistory, withRouter } from "react-router-dom";

import { getColor, computeScore } from "../utils";

import Question from "./Question";
import Youtube from "./Youtube";
import Markdown from "./Markdown";

const QuizHeader = ({ step, nSteps, quit }) => {
  return (
    <div className="quiz-header">
      <div className="quiz-progress">
        <div
          style={{
            width: `${((100 * step) / nSteps).toFixed(0)}%`
          }}
        />
        <span>
          Step {step + 1} / {nSteps}
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

const QuizEnd = ({ score, background }) => {
  const history = useHistory();
  return (
    <div className="rootColumn" style={{ background }}>
      <h1>Quiz Completed!</h1>
      <h2>You score a total of {score.toFixed(1)}.</h2>
      {score < 0 && (
        <h2>
          You can do better next time! It's common to do errors for everyone :)
          Try being less confident
        </h2>
      )}
      {score > 0 && <h1>Congratulations !</h1>}
      <button
        className="fullwidth-button"
        onClick={() => history.push("/home")}
      >
        Home
      </button>
    </div>
  );
};

const Quiz = ({ quiz, history, setQuiz }) => {
  const [background, setBackground] = useState(getColor);
  const [step, setStep] = useState(0);
  const [startTime, setStartTime] = useState(new Date());

  const [data, setData] = useState({
    steps: [],
    times: [],
    score: 0
  });

  const quitQuiz = () => {
    history.push("/home");
  };

  if (!quiz) {
    return (
      <div className="rootColumn" style={{ background }}>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (step >= quiz.questions.length) {
    return <QuizEnd score={data.score} />;
  }

  const { questions, name, quizId, questionIds } = quiz;
  const content = questions[step];

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
    const newTime = Number(new Date() - startTime);
    var newScore = 0;
    var newContent = null;

    const [contentType, ...c] = content;
    if (contentType === "YOUTUBE") {
      newContent = ["YOUTUBE", ...c];
    } else if (contentType === "MARKDOWN") {
      newContent = ["MARKDOWN", ...c];
    } else {
      // contentType === "QUESTION"
      newScore = computeScore(contentSubmitted[0] / 100);
      newContent = contentSubmitted;
    }

    data.score = data.score + newScore;
    data.steps = [...data.steps, newContent];
    data.times = [...data.times, newTime];
    setData({ ...data });
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
      userid,
      steps: data.steps.reduce((a, v, i) => ({ ...a, [`${i}`]: v }), {}),
      times: data.times,
      score: data.score
    });
  };

  const saveUserStats = () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;

    const _update = {};
    Object.values(data.steps).forEach(g => {
      if (g[0] === "YOUTUBE" || g[0] === "MARKDOWN") return;
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
      { totalScore: firebase.firestore.FieldValue.increment(data.score) }
    );

    const db = firebase.firestore();
    db.collection("stats")
      .doc(userid)
      .set(update, { merge: true });
  };

  const saveQuizStats = () => {
    const update = { participants: firebase.firestore.FieldValue.increment(1) };
    data.steps.forEach((guesses, k) => {
      if (guesses[0] === "YOUTUBE" || guesses[0] === "MARKDOWN") return;
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
        nSteps={questions.length}
        quit={() => saveEvent() || quitQuiz()}
        score={data.score}
      />
      <QuizContent content={content} next={next} submit={submit} />
    </div>
  );
};

export default withRouter(Quiz);
