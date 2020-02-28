import React, { useState } from "react";
import * as firebase from "firebase/app";
import { useHistory } from "react-router-dom";

import { getColor, httpGet } from "./utils";

const customHash = input => {
  var hash = 0;
  if (input.length === 0) return hash;
  for (var i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

const PublicQuizList = () => {
  const history = useHistory();
  const [quizzes, setQuizzes] = useState(null);
  const [error, setError] = useState(false);

  if (!quizzes) {
    const db = firebase.firestore();
    db.collection("publicQuizzes")
      .doc("list")
      .get()
      .then(doc =>
        doc.exists ? setQuizzes(Object.entries(doc.data())) : setError(true)
      )
      .catch(() => setError(true));
  }

  return (
    <>
      <h2>Public Quizzes (you can request for your quiz to become public)</h2>
      {error && <span>ERROR Loading quiz list.</span>}
      {!error && !quizzes && <span>Loading quizzes . . .</span>}
      {!error &&
        quizzes &&
        quizzes.map(([id, name]) => (
          <button
            className="fullwidth-button"
            key={name}
            onClick={() => history.push(`/q/${id}`)}
          >
            {name}
          </button>
        ))}
    </>
  );
};

const OpenTDbList = ({ setQuiz }) => {
  const history = useHistory();
  const [categories, setCategories] = useState(null);

  if (!categories) {
    setTimeout(() => {
      const response = httpGet("https://opentdb.com/api_category.php");
      const { trivia_categories } = JSON.parse(response);
      setCategories(trivia_categories);
    }, 1);
  }

  const selectOpenTDB = (id, name) => {
    setQuiz(null);
    history.push("/quiz");
    setTimeout(() => {
      const quiz = httpGet(
        `https://opentdb.com/api.php?amount=10&category=${id}&type=multiple&encode=base64`
      );
      const results = JSON.parse(quiz).results;
      const questions = results.map(x => [
        atob(x.question),
        atob(x.correct_answer),
        ...x.incorrect_answers.map(atob)
      ]);
      const questionIds = results.map(x => customHash(x.question));
      setQuiz({ quizId: `opentbd_${id}`, name, questions, questionIds });
    }, 1);
  };

  return (
    <>
      <h2>
        Quizzes from the open trivia database (
        <a href="https://opentdb.com/">https://opentdb.com/</a>)
      </h2>
      {categories ? (
        categories.map(({ id, name }) => (
          <button
            className="fullwidth-button"
            key={name}
            onClick={() => selectOpenTDB(id, name)}
          >
            {name}
          </button>
        ))
      ) : (
        <span>Loading quizzes . . .</span>
      )}
    </>
  );
};

const QuizList = ({ setQuiz }) => {
  const [background] = useState(getColor);
  const history = useHistory();

  return (
    <div id="quizList" className="rootColumn" style={{ background }}>
      <h1>Choose a Quiz</h1>
      <h2>- - - - -</h2>
      <PublicQuizList />
      <h2>- - - - -</h2>
      <OpenTDbList setQuiz={setQuiz} />
      <h2>- - - - -</h2>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/home")}
      >
        Home
      </button>
    </div>
  );
};

export default QuizList;
