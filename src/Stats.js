import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";
import { db } from "./";
import { withRouter } from "react-router-dom";

const StatGraph = ({ stats }) => {
  const plot = new Array(21).fill(0).map((_, i) => {
    const target = 5 * i;

    const s = stats[`correct_${target}%`] || 0; // number of correct answer
    const f = stats[`incorrect_${target}%`] || 0; // number of incorrect answer
    const n = s + f; // number of answers

    const avg = (s + 1) / (n + 2);
    const std = Math.max(
      0.02,
      (((s + 1) * (f + 1)) / (n + 3)) ** 0.5 / (n + 2)
    );
    return [Math.max(0, avg - 1 * std), Math.min(1, avg + 1 * std)];
  });

  const st = { stroke: "#000", strokeWidth: 2 };

  return (
    <div className="stat-graph-container">
      <svg className="stat-graph">
        {plot.map(([x, y], i) => {
          const percentage = i * 5;
          const target = 410 - 4 * percentage;
          const upper = 410 - 400 * y;
          const lower = 410 - 400 * x;
          return (
            <g key={`stats_${percentage}`}>
              <rect
                x={50 + i * 35}
                y={upper}
                width={30}
                height={lower - upper}
                style={{ fill: "#0006", strokeWidth: 2, stroke: "#000" }}
              />
              <circle cx={65 + i * 35} cy={target} r="5" fill="black" />
              {percentage % 10 === 0 && (
                <>
                  <line
                    x1="50"
                    y1={target}
                    x2="780"
                    y2={target}
                    style={{ strokeWidth: 1, stroke: "#000" }}
                  />
                  <text x="0" y={target} fill="#000">
                    {percentage} %
                  </text>
                  <text x="785" y={target} fill="#000">
                    {percentage} %
                  </text>
                </>
              )}
            </g>
          );
        })}
        <line x1="65" y1="410" x2="765" y2="10" style={st} />
      </svg>
    </div>
  );
};

const Stats = ({ history }) => {
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
        <button
          className="fullwidth-button"
          onClick={() => history.push("/home")}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div id="stats" className="rootColumn" style={{ background }}>
      <h1>Stats</h1>
      {stats.totalScore && (
        <h2>Lifetime cummulated score: {stats.totalScore.toFixed(1)}</h2>
      )}

      <h2 className="stat-explanation">
        The visualization below shows for every answer you have given what has
        been the frequency of correctness (estimated with standard error). Over
        all the times you have answered 10% did it really happen about 10% of
        the time? You can consider yourself well calibrated if all the black
        dots are inside the grey boxes!
      </h2>

      <StatGraph stats={stats} />

      <button
        className="fullwidth-button"
        onClick={() => history.push("/home")}
      >
        Back to Home
      </button>
    </div>
  );
};

export default withRouter(Stats);
