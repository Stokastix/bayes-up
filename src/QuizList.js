import React, { useState } from "react";
import { getColor, httpGet } from "./utils";
import { withRouter } from "react-router-dom";

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

const QuizList = ({ history, setQuiz }) => {
  const [categories, setCategories] = useState([]);
  const [background] = useState(getColor);

  if (categories.length === 0) {
    setTimeout(() => {
      const response = httpGet("https://opentdb.com/api_category.php");
      const { trivia_categories } = JSON.parse(response);
      setCategories(trivia_categories);
    }, 1);
  }

  const selectOpenTDB = (id, name) => {
    history.push("/quiz");
    setTimeout(() => {
      const quiz = httpGet(
        `https://opentdb.com/api.php?amount=10&category=${id}&type=multiple&encode=base64`
      );
      console.log(JSON.parse(quiz).results);
      const results = JSON.parse(quiz).results;
      const questions = results.map(x => [
        atob(x.question),
        atob(x.correct_answer),
        ...x.incorrect_answers.map(atob)
      ]);
      const questionIds = results.map(x => customHash(x.question));
      console.log(questionIds);
      setQuiz({ quizId: `opentbd_${id}`, name, questions, questionIds });
    }, 1);
  };

  return (
    <div id="quizList" className="rootColumn" style={{ background }}>
      <h1>Choose a Quiz</h1>
      <h2>
        Each question can give up to 10 points. The number of points is
        proportional to a quadratic rule. Choose a quiz below to get started.
      </h2>
      <h2>
        The quizzes below are extracted from the open trivia database (
        <a href="https://opentdb.com/">https://opentdb.com/</a>)
      </h2>
      {categories.map(({ id, name }) => (
        <button
          className="fullwidth-button"
          key={name}
          onClick={() => selectOpenTDB(id, name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default withRouter(QuizList);
