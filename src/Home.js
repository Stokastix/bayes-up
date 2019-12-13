import React, { useState } from "react";
import { getColor } from "./utils";

export default ({ setView }) => {
  const [background] = useState(getColor);
  return (
    <div id="home" className="rootColumn" style={{ background }}>
      <h1>Bayesian Quiz</h1>
      <h1>[This is a Prototype]</h1>
      <h2>
        This app lets you create and answer Bayesian Multiple Choice Quiz. They
        are the same as MCQ except that instead of selecting an answer, you
        select probabilities you assign to each possible choice. Have fun
      </h2>
      <button onClick={() => setView("editor")}>Create a Quiz</button>
      <button onClick={() => setView("quizList")}>Take a Quiz</button>
    </div>
  );
};
