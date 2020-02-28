import React, { useState } from "react";
import * as firebase from "firebase/app";
import "firebase/firestore";
import parse from "csv-parse";
import { getColor } from "./utils";
import "firebase/storage";
import { withRouter, useParams } from "react-router-dom";

const generateSteps = rawSteps => {
  const steps = [];
  for (var i = 0; i < rawSteps.length; i++) {
    if (rawSteps[i][0] === "RANDOM") {
      const r = Number(rawSteps[i][1]);
      const z = i + 1 + Math.floor(Math.random() * r);
      steps.push(rawSteps[z].filter(x => !!x));
      i += r;
    } else {
      steps.push(rawSteps[i].filter(x => !!x));
    }
  }
  return steps;
};

const FetchQuiz = ({ history, setQuiz }) => {
  const [background] = useState(getColor);
  const [quizStatus, setQuizStatus] = useState("fetch");
  const [dataUrl, setDataUrl] = useState(undefined);

  const [name, setName] = useState(undefined);
  const [username, setUserName] = useState(undefined);

  const { quizId } = useParams();

  const parseCsv = data => {
    const options = {
      trim: true,
      skip_empty_lines: true,
      relax_column_count: true
    };
    parse(data, options, (_, output) => {
      const questions = generateSteps(output);
      setQuiz({ name, quizId, questions });
    });
  };

  function openQuiz() {
    setQuiz(null);
    history.push("/quiz");
    fetch(dataUrl)
      .then(response => response.text())
      .then(parseCsv);
  }

  const getStorageUrl = () => {
    setQuizStatus("fetching");
    const storageRef = firebase.storage().ref();
    const ref = storageRef.child("quizzes/" + quizId + ".csv");

    ref
      .getMetadata()
      .then(metadata => {
        // Metadata now contains the metadata for 'images/forest.jpg'
        setName(metadata.customMetadata.name);
        setUserName(metadata.customMetadata.username);
      })
      .catch(function(error) {
        // setQuizStatus("fail");
      });

    ref
      .getDownloadURL()
      .then(function(url) {
        setDataUrl(url);
        setQuizStatus("success");
      })
      .catch(err => {
        setQuizStatus("fail");
      });
  };

  if (!dataUrl && quizStatus === "fetch") getStorageUrl();

  return (
    <div id="fetchQuiz" className="rootColumn" style={{ background }}>
      <h1>Shared Quiz</h1>
      {quizStatus === "fail" && <h1>Sorry, quiz doesn't exist....</h1>}
      {quizStatus === "fetching" && <p>Fetching quiz...</p>}
      {quizStatus === "success" && (
        <>
          {name && <h1>Title: {name}</h1>}
          {username && <h1>Author: {username}</h1>}
          <button className="fullwidth-button" onClick={() => openQuiz()}>
            Open Quiz
          </button>
        </>
      )}
    </div>
  );
};

export default withRouter(FetchQuiz);
