import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";
import { db } from "./";
import { withRouter } from "react-router-dom";

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

  const { groups, current } = new Array(101).fill(0).reduce(
    ({ count, groups, current }, _, target) => {
      const s = stats[`correct_${target}%`] || 0; // number of correct answer
      const f = stats[`incorrect_${target}%`] || 0; // number of incorrect answer
      const n = s + f; // number of answers

      if (n === 0) return { count, groups, current };
      current.push(target);
      if (count + n > 30) {
        groups.push(current);
        return { count: 0, groups, current: [] };
      } else {
        return { count: count + n, groups, current };
      }
    },
    { count: 0, groups: [], current: [] }
  );
  groups.push(current);

  const _stats = groups.map(group => {
    const [S, F, A, N] = group.reduce(
      ([S, F, A, N], target) => {
        const s = stats[`correct_${target}%`] || 0; // number of correct answer
        const f = stats[`incorrect_${target}%`] || 0; // number of incorrect answer
        const n = s + f; // number of answers
        return [S + s, F + f, A + n * target, N + n];
      },
      [0, 0, 0, 0]
    );
    const target = A / N;
    const interval =
      group.length === 1 ? "" : ` (${group[0]}%~${group[group.length - 1]}%)`;
    const avg = (S + 1) / (N + 2);
    const std = (((S + 1) * (F + 1)) / (N + 3)) ** 0.5 / (N + 2);
    return [target, interval, avg, std, N];
  });

  return (
    <div id="stats" className="rootColumn" style={{ background }}>
      <h1>Stats</h1>
      <h2>Lifetime cummulated score: {stats.totalScore}</h2>
      <table>
        <thead>
          <tr>
            <th>Target</th>
            <th>Avg</th>
            <th>Std</th>
          </tr>
        </thead>
        <tbody>
          {_stats.map(([target, interval, avg, std, N]) => {
            return (
              N > 0 && (
                <tr key={target}>
                  <th>
                    {target.toFixed()}%{interval}
                  </th>
                  <th>{(100 * avg).toFixed(0)}%</th>
                  <th>±{(100 * std).toFixed(0)}%</th>
                </tr>
              )
            );
          })}
        </tbody>
      </table>
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
