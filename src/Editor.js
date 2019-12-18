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
      <button onClick={() => setEditor(null)}>Go Back</button>
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
      <button className="question-delete" onClick={deleteQuestion}>
        Delete Question
      </button>
    </div>
  );
};

const OnlineEditor = ({ setEditor, quiz, setQuiz }) => {
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
    const { name, questions } = quiz;
    const text = [name, ...questions.map(x => x.join(","))].join("\n");

    const quizID = shortID(12);
    const storageRef = firebase.storage().ref();
    const ref = storageRef.child(`quizzes/${quizID}.csv`);
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
          [quizID]: name
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
      <button onClick={addQuestion}>Add Question</button>
      <button onClick={handleSubmit}>Submit Quiz</button>
      <button onClick={() => setEditor(null)}>Go Back</button>
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

  if (editor === null) {
    return (
      <div id="editor" className="rootColumn" style={{ background }}>
        <h1>Create a Quiz</h1>
        <h2>You can create your own quiz and share it.</h2>
        <button onClick={() => setEditor("csv")}>Create from a CSV file</button>
        <button onClick={() => setEditor("online")}>Create online</button>
        <button onClick={() => setView("home")}>Go Back</button>
      </div>
    );
  }

  if (editor === "csv") {
    return <CSVEditor setEditor={setEditor} setQuiz={setQuiz} />;
  }

  if (editor === "online") {
    return <OnlineEditor setEditor={setEditor} quiz={quiz} setQuiz={setQuiz} />;
  }
};
