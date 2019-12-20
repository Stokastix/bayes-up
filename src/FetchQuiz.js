import React, { useState } from "react";
import * as firebase from "firebase/app";
import "firebase/firestore";
import parse from "csv-parse";
import { getColor } from "./utils";
import "firebase/storage";
import { withRouter, useParams } from "react-router-dom";

const FetchQuiz = ({ history, setQuiz }) => {
  const [background] = useState(getColor);
  const [quizStatus, setQuizStatus] = useState("fetch");
  const [dataUrl, setDataUrl] = useState(undefined);
  const { quizId } = useParams();

  function parseCsv(data) {
    const output = [];
    parse(data, {
      trim: true,
      skip_empty_lines: true,
      relax_column_count: true,
      from_line: 2
    })
      .on("readable", function() {
        let record;
        while ((record = this.read())) {
          output.push(record);
        }
      })
      .on("end", function() {
        setQuiz({ questions: output });
      });
  }

  function openQuiz() {
    history.push("/quiz");
    fetch(dataUrl)
      .then(response => response.text())
      .then(parseCsv);
  }

  function getStorageUrl() {
    const storageRef = firebase.storage().ref();
    storageRef
      .child("quizzes/" + quizId + ".csv")
      .getDownloadURL()
      .then(function(url) {
        setDataUrl(url);
        setQuizStatus("success");
      })
      .catch(err => {
        setQuizStatus("fail");
      });
  }

  if (!dataUrl && quizStatus === "fetch") getStorageUrl();

  const result = {
    fail: <h1>Sorry, quiz doesn't exist....</h1>,
    fetch: <p>fetching url...</p>,
    success: [
      <p key="9">[put some info here... (name, date, author)]</p>,
      <button className="fullwidth-button" key="1" onClick={() => openQuiz()}>
        Open Quiz
      </button>
    ]
  };

  return (
    <div id="fetchQuiz" className="rootColumn" style={{ background }}>
      <h1>Quiz Fetcher</h1>
      {result[quizStatus]}
    </div>
  );
};

export default withRouter(FetchQuiz);
