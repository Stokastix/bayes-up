import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";
import { useHistory } from "react-router-dom";

const MyQuizzes = () => {
  const history = useHistory();
  const [background] = useState(getColor);
  const [quizList, setQuizList] = useState(null);

  if (quizList === null) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;
    const db = firebase.firestore();
    db.collection("quizzes")
      .doc(userid)
      .get()
      .then(function(doc) {
        if (doc.exists) {
          setQuizList(doc.data());
        } else {
          setQuizList({});
        }
      });
  }

  return (
    <div id="settings" className="rootColumn" style={{ background }}>
      {quizList === null ? (
        <span>Loading quizzes ...</span>
      ) : (
        <>
          <h1>Your Quizzes</h1>
          <h2>Click on a quiz to share it, edit it, or see the results.</h2>
          {Object.entries(quizList).map(([quizId, quizName]) => {
            return (
              <button
                className="fullwidth-button"
                key={quizId}
                onClick={() => history.push(`/s/${quizId}`)}
              >
                {quizName}
              </button>
            );
          })}
        </>
      )}
      <button
        className="fullwidth-button"
        onClick={() => history.push("/home")}
      >
        Home
      </button>
    </div>
  );
};

export default MyQuizzes;
