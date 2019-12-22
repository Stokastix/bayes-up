import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import * as firebase from "firebase/app";

import parse from "csv-parse";
import stringify from "csv-stringify";

import { getColor, shortID } from "./utils";
import { withRouter } from "react-router-dom";

const CSVEditor = ({ setEditor, setQuiz }) => {
  const [background] = useState(getColor);

  const handleFile = e => {
    const reader = new FileReader();
    const name = e.target.value.split(/(\\|\/)/g).pop();
    reader.onload = function() {
      const data = reader.result;
      const output = [];
      const options = {
        trim: true,
        skip_empty_lines: true,
        relax_column_count: true
      };

      parse(data, options)
        .on("readable", function() {
          let record;
          while ((record = this.read())) {
            output.push(record);
          }
        })
        .on("end", function() {
          setEditor("online");
          setQuiz({ name, questions: output });
        });
    };
    reader.readAsText(e.target.files[0]);
  };

  return (
    <div id="editor" className="rootColumn" style={{ background }}>
      <h2>
        Choose a CSV file. The lines should each contains one question, then the
        right answer, then one or several wrong answers. All separated by
        commas.
      </h2>
      <label className="editor-input">
        <input type="file" accept=".csv" onChange={handleFile} />
        <span>Select File</span>
      </label>
      <button className="fullwidth-button" onClick={() => setEditor(null)}>
        Go Back
      </button>
    </div>
  );
};

const QuestionEditorBox = ({ question, setQuestion, deleteQuestion }) => {
  const [q, correct, incorrect1, incorrect2, incorrect3] = question;

  const handleUpdate = i => e => {
    question[i] = e.target.value;
    setQuestion(question);
  };

  const margin = { margin: "4px" };
  return (
    <div className="question-input">
      <TextField
        style={margin}
        label="Question"
        defaultValue={q}
        onChange={handleUpdate(0)}
      />
      <TextField
        style={margin}
        label="Correct answer"
        defaultValue={correct}
        onChange={handleUpdate(1)}
      />
      <TextField
        style={margin}
        label={"Wrong answer"}
        defaultValue={incorrect1}
        onChange={handleUpdate(2)}
      />
      <TextField
        style={margin}
        label={"Wrong answer (optional)"}
        defaultValue={incorrect2}
        onChange={handleUpdate(3)}
      />
      <TextField
        style={margin}
        label={"Wrong answer (optional)"}
        defaultValue={incorrect3}
        onChange={handleUpdate(4)}
      />
      <button className="fullwidth-button" onClick={deleteQuestion}>
        Delete Question
      </button>
    </div>
  );
};

const OnlineEditor = ({ setEditor, quiz, setQuiz, quizId }) => {
  const [background] = useState(getColor);
  const [errors, setErrors] = useState([]);

  const addQuestion = () => {
    const { name, questions } = quiz;
    setQuiz({ name, questions: [...questions, ["", "", "", "", ""]] });
  };

  const handleNameChange = e => {
    setQuiz({ name: e.target.value, questions: quiz.questions });
  };

  const setQuestion = i => q => {
    quiz.questions[i] = q;
    setQuiz({ ...quiz });
  };

  const deleteQuestion = i => () => {
    const questions = quiz.questions.filter((_, j) => i !== j);
    setQuiz({ ...quiz, questions });
  };

  const checkQuiz = () => {
    const errorList = [];
    const { name, questions } = quiz;
    if (!name) errorList.push("The name of the quiz is missing.");
    if (questions.length === 0)
      errorList.push("The quiz should have at least one question.");
    questions.forEach(([q, a, b], i) => {
      if (!q) errorList.push(`The question of question ${i + 1} is missing.`);
      if (!a)
        errorList.push(`The correct answer of question ${i + 1} is missing.`);
      if (!b)
        errorList.push(`The incorrect answer of question ${i + 1} is missing.`);
    });
    setErrors(errorList);
    return errorList.length === 0;
  };

  const handleSubmit = () => {
    if (!checkQuiz()) return;

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;
    const username = user.displayName || "Guest User";

    setEditor("share");

    const { name, questions } = quiz;
    stringify(questions, (err, output) => {
      const storageRef = firebase.storage().ref();
      const ref = storageRef.child(`quizzes/${quizId}.csv`);
      const blob = new Blob([output], { type: "text/plain" });
      ref.put(blob, { customMetadata: { userid, username, name } });
    });

    db.collection("quizzes")
      .doc(userid)
      .set(
        {
          [quizId]: name
        },
        { merge: true }
      );
  };

  return (
    <div id="editor" className="rootColumn" style={{ background }}>
      <h1>Configure your quiz</h1>
      <TextField
        label="Quiz Name"
        value={quiz.name}
        onChange={handleNameChange}
      />
      {quiz.questions.map((q, i) => (
        <QuestionEditorBox
          key={quiz.questions.length + "_" + i}
          question={q}
          setQuestion={setQuestion(i)}
          deleteQuestion={deleteQuestion(i)}
        />
      ))}
      <button className="fullwidth-button" onClick={addQuestion}>
        Add Question
      </button>
      {errors.map(e => (
        <span key={e}>ERROR: {e}</span>
      ))}
      <button className="fullwidth-button" onClick={handleSubmit}>
        Submit Quiz
      </button>
      <button className="fullwidth-button" onClick={() => setEditor(null)}>
        Go Back
      </button>
    </div>
  );
};

const DisplayShare = ({ history, quizId }) => {
  const [background] = useState(getColor);

  const URL = `${window.location.host}/q/${quizId}`;

  const copyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = URL;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };
  return (
    <div id="editor" className="rootColumn" style={{ background }}>
      <h1>Quiz Created!</h1>
      <h2>Your quiz is now available at the URL:</h2>
      <a className="share-link" href={`/q/${quizId}`}>
        {URL}
      </a>
      <button className="fullwidth-button" onClick={copyToClipboard}>
        Copy URL
      </button>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/home")}
      >
        Home
      </button>
    </div>
  );
};

const Editor = ({ history }) => {
  const [background] = useState(getColor);
  const [editor, setEditor] = useState(null);
  const [quiz, setQuiz] = useState({
    name: "",
    questions: [["", "", "", "", ""]]
  });
  const [quizId] = useState(shortID(12));

  if (editor === null) {
    return (
      <div id="editor" className="rootColumn" style={{ background }}>
        <h1>Create a Quiz</h1>
        <h2>You can create your own quiz and share it.</h2>
        <button className="fullwidth-button" onClick={() => setEditor("csv")}>
          Create from a CSV file
        </button>
        <button
          className="fullwidth-button"
          onClick={() => setEditor("online")}
        >
          Create online
        </button>
        <button
          className="fullwidth-button"
          onClick={() => history.push("/home")}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (editor === "csv") {
    return <CSVEditor setEditor={setEditor} setQuiz={setQuiz} />;
  }

  if (editor === "online") {
    return (
      <OnlineEditor
        setEditor={setEditor}
        quiz={quiz}
        setQuiz={setQuiz}
        quizId={quizId}
      />
    );
  }

  if (editor === "share") {
    return <DisplayShare history={history} quizId={quizId} />;
  }
};

export default withRouter(Editor);
