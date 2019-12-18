import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import * as firebase from "firebase/app";

import { getColor, shortID } from "./utils";

const CSVEditor = ({ setEditor, setQuiz }) => {
  const [background] = useState(getColor);
  const handleFile = e => {
    const reader = new FileReader();
    const name = e.target.value.split(/(\\|\/)/g).pop();
    reader.onload = function() {
      const text = reader.result;
      const questions = text.split("\n").map(x => x.split(","));
      setQuiz({ name, questions });
      setEditor("online");
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
    // TODO
    return true;
  };

  const handleSubmit = () => {
    if (!checkQuiz()) alert("quiz configuration has errors.");
    setEditor("share");

    const { name, questions } = quiz;
    const text = [name, ...questions.map(x => x.join(","))].join("\n");

    const storageRef = firebase.storage().ref();
    const ref = storageRef.child(`quizzes/${quizId}.csv`);
    ref.putString(text).then(snapshot => {
      console.log("Uploaded a quiz");
      console.log(snapshot);
    });

    const db = firebase.firestore();

    const user = firebase.auth().currentUser;
    if (!user) return;
    const userid = user.uid;
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
      <button className="fullwidth-button" onClick={handleSubmit}>
        Submit Quiz
      </button>
      <button className="fullwidth-button" onClick={() => setEditor(null)}>
        Go Back
      </button>
    </div>
  );
};

const DisplayShare = ({ setView, quizId }) => {
  const [background] = useState(getColor);

  const URL = `http://TODO.todo/quiz/${quizId}`;

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
      <a className="share-link" href={URL}>
        {URL}
      </a>
      <button className="fullwidth-button" onClick={copyToClipboard}>
        Copy URL
      </button>
      <button className="fullwidth-button" onClick={() => setView("home")}>
        Home
      </button>
    </div>
  );
};

export default ({ setView }) => {
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
        <button className="fullwidth-button" onClick={() => setView("home")}>
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
    return <DisplayShare setView={setView} quizId={quizId} />;
  }
};
