import React, { useState } from "react";
import { getColor } from "./utils";
import { withRouter } from "react-router-dom";

const Home = ({ history }) => {
  const [background] = useState(getColor);
  return (
    <div id="home" className="rootColumn" style={{ background }}>
      <h1>Bayesian Quiz</h1>
      <h1>[This is a Work in Progress]</h1>
      <h1>[Expect to see features break, disappear, or change quickly]</h1>
      <h2>
        This app lets you answer Bayesian Multiple Choice Quiz. They are the
        same as MCQ except that instead of selecting an answer, you select
        probabilities you assign to each possible choice. Have fun
      </h2>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/quizList")}
      >
        Take a Quiz
      </button>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/stats")}
      >
        See my Stats
      </button>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/editor")}
      >
        Create a Quiz
      </button>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/settings")}
      >
        My Account
      </button>
    </div>
  );
};

export default withRouter(Home);
