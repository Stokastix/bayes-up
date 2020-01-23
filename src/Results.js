import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import parse from "csv-parse";
import * as firebase from "firebase/app";

import { getColor } from "./utils";

const Results = ({ results, quiz }) => (
  <>
    <h2>Number of participants: {results.participants}</h2>
    {Object.entries(quiz.questions).map(([k, [question, ...choices]]) => (
      <table key={k}>
        <thead>
          <tr>
            <th>Question {Number(k) + 1}</th>
            <th></th>
          </tr>
          <tr>
            <th>{question}</th>
            <th>Average guess</th>
          </tr>
        </thead>
        <tbody>
          {choices.map((choice, i) => (
            <tr key={i}>
              <th>{choice}</th>
              <th>
                {(results[`${k}_${i}`] / results.participants).toFixed(0)}%
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    ))}
  </>
);

export default () => {
  const [background] = useState(getColor);
  const history = useHistory();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);

  if (!quiz && !results && !error) {
    // Fetching Quiz and filling in the editor
    const storage = firebase.storage().ref();
    const ref = storage.child("quizzes/" + quizId + ".csv");
    ref
      .getDownloadURL()
      .then(url => {
        fetch(url)
          .then(response => response.text())
          .then(data =>
            parse(
              data,
              {
                trim: true,
                skip_empty_lines: true,
                relax_column_count: true
              },
              (_, questions) => setQuiz({ quizId, questions })
            )
          )
          .catch(() => setError("error"));
      })
      .catch(err => {});

    const db = firebase.firestore();
    db.collection("results")
      .doc(quizId)
      .get()
      .then(doc => (doc.exists ? setResults(doc.data()) : setError("empty")))
      .catch(err => setError("error"));
  }

  return (
    <div className="rootColumn" style={{ background }}>
      <h1>Quiz Results</h1>
      {error === "error" && <span>Error while retrieving results.</span>}
      {error === "empty" && (
        <span>No one has done this quiz yet. Please come again later.</span>
      )}
      {!quiz && !error && <span>Fetching quiz . . .</span>}
      {!results && !error && <span>Fetching results . . .</span>}
      {results && quiz && <Results results={results} quiz={quiz} />}
      <button
        className="fullwidth-button"
        onClick={() => history.push("/home")}
      >
        Home
      </button>
    </div>
  );
};
