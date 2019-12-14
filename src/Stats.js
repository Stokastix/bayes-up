import React, { useState } from "react";
import { getColor } from "./utils";
import { db, login } from "./";

export default ({ setView }) => {
  const [background] = useState(getColor);
  const [stats, setStats] = useState(null);

  if (!stats) {
    setTimeout(() => {
      db.collection("stats")
        .doc(login)
        .get()
        .then(function(doc) {
          if (doc.exists) {
            setStats(doc.data());
          } else {
            console.log("Could not find stats");
          }
        });
    }, 1);
    return (
      <div id="stats" className="rootColumn" style={{ background }}>
        <span>Loading Stats...</span>
        <button onClick={() => setView("quizList")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div id="stats" className="rootColumn" style={{ background }}>
      <table>
        <tr>
          <th>Target</th>
          <th>Actual</th>
          <th>Count</th>
        </tr>
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(target => {
          const correctCount = stats[`Correct_${target}%`];
          const incorrectCount = stats[`Incorrect_${target}%`];
          const totalCount = correctCount + incorrectCount;
          return (
            <tr>
              <th>{target}%</th>
              <th>
                {totalCount > 0
                  ? `${Math.round((100 * correctCount) / totalCount)}%`
                  : "No data"}
              </th>
              <th>{totalCount}</th>
            </tr>
          );
        })}
      </table>
      <button onClick={() => setView("quizList")}>Back to Home</button>
    </div>
  );
};
