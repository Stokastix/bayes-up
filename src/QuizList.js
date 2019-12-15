import React, { useState } from "react";
import { getColor, httpGet } from "./utils";

export default ({ setView, setQuiz }) => {
  const [categories, setCategories] = useState([]);
  const [background] = useState(getColor);

  if (categories.length === 0) {
    setTimeout(() => {
      const response = httpGet("https://opentdb.com/api_category.php");
      const { trivia_categories } = JSON.parse(response);
      setCategories(trivia_categories);
    }, 1);
  }

  return (
    <div id="quizList" className="rootColumn" style={{ background }}>
      <h1>Choose a Quiz</h1>
      <h2>
        Each question can give up to 10 points. The number of points is
        proportional to a quadratic rule. Choose a quiz below to get started.
      </h2>
      <h2>
        The quiz below are extracted from the open trivia database (
        <a href="https://opentdb.com/">https://opentdb.com/</a>)
      </h2>
      {categories.map(({ id, name }) => (
        <button
          key={name}
          onClick={() => {
            setView("quiz");
            setTimeout(() => {
              const quiz = httpGet(
                `https://opentdb.com/api.php?amount=10&category=${id}&type=multiple&encode=base64`
              );
              const questions = JSON.parse(quiz).results.map(x => [
                atob(x.question),
                atob(x.correct_answer),
                ...x.incorrect_answers.map(atob)
              ]);
              setQuiz({ questions });
            }, 1);
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
};
