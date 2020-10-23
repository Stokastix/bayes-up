import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";
import { db } from "./";
import { withRouter } from "react-router-dom";

const Graph = ({ data }) => {
  return (
    <div className="stat-graph-container">
      <svg className="stat-graph">
        {new Array(11).fill(0).map((_, i) => {
          const percentage = i * 10;
          const target = 410 - 4 * percentage;
          return (
            <g key={`lines_${percentage}`}>
              <line
                x1={61 + i * 50}
                y1="10"
                x2={61 + i * 50}
                y2="410"
                style={{ strokeWidth: 1, stroke: "#0009" }}
              />
              <text x={50 + i * 50} y="425" fill="#000">
                {percentage} %
              </text>
              <line
                x1="50"
                y1={target}
                x2="575"
                y2={target}
                style={{ strokeWidth: 1, stroke: "#0009" }}
              />
              <text x="0" y={target} fill="#000">
                {percentage} %
              </text>
            </g>
          );
        })}

        {data.map(([freq, bot, top], i) => {
          const percentage = i * 5;
          const upper = 410 - 400 * top;
          const lower = 410 - 400 * bot;
          return (
            <g key={`stats_${percentage}`}>
              {freq !== null && (
                <>
                  <rect
                    x={50 + i * 25}
                    y={upper}
                    width={22}
                    height={lower - upper}
                    style={{ fill: "#0009", strokeWidth: 1 }}
                  />
                  <circle
                    cx={61 + i * 25}
                    cy={410 - 400 * freq}
                    r="5"
                    fill="#000"
                  />
                </>
              )}
            </g>
          );
        })}

        <line
          x1="61"
          y1="410"
          x2="561"
          y2="10"
          style={{ stroke: "#000", strokeWidth: 2 }}
        />
      </svg>
    </div>
  );
};

const StatGraphBayes = ({ stats }) => {
  const data = new Array(21).fill(0).map((_, i) => {
    const target = 5 * i;

    const s = stats[`correct_${target}%`] || 0; // number of correct answer
    const f = stats[`incorrect_${target}%`] || 0; // number of incorrect answer
    const n = s + f; // number of answers

    if (n < 3) return [null, null, null];

    const allProba = new Array(101)
      .fill(0)
      .map((_, i) => i / 100)
      .map(p => p ** s * (1 - p) ** f);

    const probaTotal = allProba.reduce((a, b) => a + b, 0);

    var top = 100;
    var top_loss = allProba[top];

    var bot = 0;
    var bot_loss = allProba[bot];

    while (top_loss < 0.05 * probaTotal) {
      top--;
      top_loss += allProba[top];
    }

    while (bot_loss < 0.05 * probaTotal) {
      bot++;
      bot_loss += allProba[bot];
    }

    bot = bot / 100 - 0.01;
    top = top / 100 + 0.01;

    top = Math.min(1, top);
    bot = Math.max(0, bot);

    return [target / 100, bot, top];
  });

  return <Graph data={data} />;
};

function binomial(n, k) {
  if (typeof n !== "number" || typeof k !== "number") return false;
  var coeff = 1;
  for (var x = 1; x <= k; x++) coeff /= x;
  for (x = n - k + 1; x <= n; x++) coeff *= x;
  return coeff;
}

const StatGraphFreq = ({ stats }) => {
  const data = new Array(21).fill(0).map((_, i) => {
    const target = 5 * i;

    const p = target / 100;

    const s = stats[`correct_${target}%`] || 0; // number of correct answer
    const f = stats[`incorrect_${target}%`] || 0; // number of incorrect answer
    const n = s + f; // number of answers

    if (n < 3) return [null, null, null];

    const freq = s / n;

    const allProba = new Array(n + 1)
      .fill(0)
      .map((_, _s) => _s)
      .map(_s => p ** _s * (1 - p) ** (n - _s) * binomial(n, _s));

    var top = n;
    var top_loss = allProba[top];

    var bot = 0;
    var bot_loss = allProba[bot];

    while (top_loss < 0.05) {
      top--;
      top_loss += allProba[top];
    }

    while (bot_loss < 0.05) {
      bot++;
      bot_loss += allProba[bot];
    }

    bot = bot / n - 0.01;
    top = top / n + 0.01;

    top = Math.min(1, top);
    bot = Math.max(0, bot);

    return [freq, bot, top];
  });

  return <Graph data={data} />;
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
        The visualizations below show your calibration. Over all the times you
        have answered 70% has it been the correct answer exactly 70% of the
        time? When you said 0% has it really never been the correct answer? If
        the answers to these questions are yes, you seem to be well calibrated.
        The graphs below show you an estimation of your calibration for each
        probabilities you have answered so far.
      </h2>

      <h2>- - - - - - -</h2>

      <h2 className="stat-explanation">
        The grey bars are 90% confidence intervals of your probability of
        correctness based on a uniform prior distribution over [0%-100%]. The
        black dots show the probability you should converge to if you are
        perfectly calibrated.
      </h2>

      <StatGraphBayes stats={stats} />

      <h2>- - - - - - -</h2>

      <h2 className="stat-explanation">
        The black dots show the exact ratio of correctness from the questions
        you have answered with each probability. The grey bars show where the
        ratio should be with 90% probability if you are perfectly calibrated.
      </h2>

      <StatGraphFreq stats={stats} />

      <button
        className="fullwidth-button"
        onClick={() => history.push("/home")}
      >
        Home
      </button>
    </div>
  );
};

export default withRouter(Stats);
