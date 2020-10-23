import React, { useState } from "react";

import { getColor } from "./utils";
import { useHistory, useParams } from "react-router-dom";

export default () => {
  const { quizId } = useParams();
  const history = useHistory();
  const [background] = useState(getColor);

  const URL = `${window.location.host}/q/${quizId}`;

  const copyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = URL;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };
  return (
    <div id="editor" className="rootColumn" style={{ background }}>
      <h1>Share your Quiz!</h1>
      <h2>Your quiz is available at the URL:</h2>
      <a className="share-link" href={`/q/${quizId}`}>
        {URL}
      </a>
      <button className="fullwidth-button" onClick={copyToClipboard}>
        Copy URL
      </button>
      <button
        className="fullwidth-button"
        onClick={() => history.push(`/e/${quizId}`)}
      >
        Edit Quiz
      </button>
      <button
        className="fullwidth-button"
        onClick={() => history.push(`/r/${quizId}`)}
      >
        See Results
      </button>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/home")}
      >
        Home
      </button>
    </div>
  );
};
