import React, { useState } from "react";
import { getColor } from "./utils";

const quizList = [
  {
    name: "Bayes Rule",
    questions: [
      ["La crédence des théorie est la crédence des données", "Faux", "Vrai"],
      [
        "Un muslman tiré au hazard ressemble plus à un chinois qu'à un arabe",
        "Vrai",
        "Faux"
      ],
      ["Le prénom de Bayes était", "Thomas", "Pierre", "Simon", "Ray"],
      [
        "Si un couple tiré au hazard a deux enfants dont au moins un garçon. Quelle la probabilité qu'ils ont aussi une fille?",
        "2/3",
        "1/3",
        "1/2"
      ]
    ]
  },
  {
    name: "Turing and his Machines",
    questions: [
      ["Alan Turing was born in...", "1912", "1900", "1924", "1936"],
      [
        "The first recipient of the Turing award was ...",
        "Alan Perlis",
        "Alan Turing",
        "Ada Lovelace",
        "Donald Knuth"
      ],
      [
        "During the second world war, Alan Turing helped breaking the code of ...",
        "The Enigma machine",
        "The Turing machine",
        "The Crypto machine",
        "The Cypher machine"
      ],
      ["Turing machines have an infinite number of states", "False", "True"],
      ["Turing machines are deterministic", "True", "False"],
      [
        "There exists an infinite number of possible Turing machines",
        "True",
        "False"
      ],
      ["Turing machines read and write on an infinite tape", "True", "False"],
      ["Turing machines can compute any sequence of number", "False", "True"],
      [
        "Turing machines can compute everything that can be computed using a usual programming language",
        "True",
        "False"
      ]
    ]
  },
  {
    name: "Multiplications",
    questions: [
      ["6 * 7 = ?", "42", "46", "36"],
      ["142857 * 7 = ?", "999999", "1000009", "998899"],
      ["11 * 13 * 19 * 52579 = 142857143", "True", "False"],
      [
        "777777777 * 142857143 = ?",
        "111111111111111111",
        "11111111111111111",
        "1111111111111111111"
      ]
    ]
  }
];

export default ({ setView, setQuiz }) => {
  const [background] = useState(getColor);

  return (
    <div id="quizList" className="rootColumn" style={{ background }}>
      <h1>Choose a Quiz</h1>
      <h2>
        Each question can give up to 10 points. The number of points is
        proportional to a quadratic rule. Choose a quiz below to get started.
      </h2>
      {quizList.map(q => (
        <button
          onClick={() => {
            setView("quiz");
            setQuiz(q);
          }}
        >
          {q.name}
        </button>
      ))}
    </div>
  );
};
