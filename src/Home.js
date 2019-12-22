import React, { useState } from "react";
import { getColor } from "./utils";
import { withRouter } from "react-router-dom";

const Home = ({ history }) => {
  const [background] = useState(getColor);
  return (
    <div id="home" className="rootColumn" style={{ background }}>
      <h1>Bayes-Up!</h1>
      <h1>--- ! ! ! ---</h1>
      <h1>
        Development is in Progress. Some feature could have bugs and not work
        for you. We are sorry for any incovenience you may encounter.
      </h1>
      <h1>--- ! ! ! ---</h1>
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
