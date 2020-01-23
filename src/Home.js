import React, { useState } from "react";
import { getColor } from "./utils";
import { withRouter } from "react-router-dom";

const Home = ({ history }) => {
  const [background] = useState(getColor);
  return (
    <div id="home" className="rootColumn" style={{ background }}>
      <h1>Bayes-Up!</h1>
      <h2>- - - - - -</h2>
      <h2>
        Bayes-Up is still in Beta version.
        <br />
        Feedback on bugs or features is welcome.
        <br />
        We are on Github:{" "}
        <a href="https://github.com/Stokastix/bayes-up">Bayes-Up</a>
      </h2>
      <h2>- - - - - -</h2>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/quizList")}
      >
        See Quizzes
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
