import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";
import { db } from "./";

export default ({ setView }) => {
  const [background] = useState(getColor);
  const [stats, setStats] = useState(null);

  if (!stats) {
    setTimeout(() => {
      const user = firebase.auth().currentUser;
      if (!user) return;
      const userid = user.uid;

      db.collection("stats")
        .doc(userid)
        .get()
        .then(function(doc) {
          if (doc.exists) {
            setStats(doc.data());
          } else {
            setStats({});
          }
        });
    }, 1);
    return (
      <div id="stats" className="rootColumn" style={{ background }}>
        <span>Loading Stats...</span>
        <button onClick={() => setView("home")}>Back to Home</button>
      </div>
    );
  }

  if (stats === {})
    return (
      <div id="stats" className="rootColumn" style={{ background }}>
        <h2>Your stats are empty</h2>
        <button onClick={() => setView("home")}>Back to Home</button>
      </div>
    );

  console.log(stats);
  return (
    <div id="stats" className="rootColumn" style={{ background }}>
      <table>
        <thead>
          <tr>
            <th>Target</th>
            <th>Actual</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {new Array(101).fill(0).map((_, target) => {
            const correctCount = stats[`correct_${target}%`] || 0;
            const incorrectCount = stats[`incorrect_${target}%`] || 0;
            const totalCount = correctCount + incorrectCount;
            return (
              totalCount > 0 && (
                <tr key={target}>
                  <th>{target}%</th>
                  <th>{Math.round((100 * correctCount) / totalCount)}%</th>
                  <th>{totalCount}</th>
                </tr>
              )
            );
          })}
        </tbody>
      </table>
      <button onClick={() => setView("home")}>Back to Home</button>
    </div>
  );
};
