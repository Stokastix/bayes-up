import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";

export default ({ setView }) => {
  const [background] = useState(getColor);
  const [quizList, setQuizList] = useState(null);

  if (quizList === null) {
    setTimeout(() => {
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
    });
    return (
      <div id="settings" className="rootColumn" style={{ background }}>
        <span>Loading quizzes ...</span>
        <button onClick={() => setView("home")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div id="settings" className="rootColumn" style={{ background }}>
      <h1>Your Quizzes</h1>
      <h2>
        [upcoming features: See stats of your quizzes and modify/delete them]
      </h2>
      {Object.entries(quizList).map(([quizId, quizName]) => {
        return (
          <button key={quizId} onClick={() => {}}>
            {quizName}
          </button>
        );
      })}
      <button onClick={() => setView("home")}>Back to Home</button>
    </div>
  );
};
