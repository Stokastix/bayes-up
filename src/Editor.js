import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import * as firebase from "firebase/app";

import parse from "csv-parse";
import stringify from "csv-stringify";

import { getColor, shortID } from "./utils";
import { useHistory, useParams } from "react-router-dom";

const CSVEditor = ({ setEditor, setQuiz }) => {
  const [background] = useState(getColor);
  const [error, setError] = useState(false);

  const handleFile = e => {
    const reader = new FileReader();
    reader.onload = function() {
      setError(false);

      const data = reader.result;
      const options = {
        trim: true,
        skip_empty_lines: true,
        relax_column_count: true
      };
      parse(data, options, (err, output) => {
        if (err) {
          setError(err.message);
          return;
        }
        setEditor("online");
        setQuiz({ quizId: shortID(12), name: "", questions: output });
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
      {error && (
        <div className="choiceContainer">
          <h2>ERROR: Looks like your CSV has the wrong format.</h2>
          <span style={{ color: "red", textAlign: "left" }}>{error}</span>
        </div>
      )}
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

const OnlineEditor = ({ setEditor, quiz, setQuiz }) => {
  const history = useHistory();
  const [background] = useState(getColor);
  const [errors, setErrors] = useState([]);

  const addQuestion = () => {
    const { questions } = quiz;
    setQuiz(q => ({ ...q, questions: [...questions, ["", "", "", "", ""]] }));
  };

  const handleNameChange = e => {
    const name = e.target.value;
    setQuiz(q => ({ ...q, name }));
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

    const { quizId } = quiz;
    history.push(`/s/${quizId}`);

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

  if (!quiz || quiz.name === undefined || !quiz.questions) {
    return (
      <div id="editor" className="rootColumn" style={{ background }}>
        <h1>Editor</h1>
        <span>Fetching Quiz. . .</span>
      </div>
    );
  }

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

const Editor = () => {
  const history = useHistory();
  const { quizId } = useParams();
  const [background] = useState(getColor);
  const [editor, setEditor] = useState(quizId ? "online" : null);
  const [quiz, setQuiz] = useState(null);

  if (quizId && !quiz) {
    // Fetching Quiz and filling in the editor
    const storage = firebase.storage().ref();
    const ref = storage.child("quizzes/" + quizId + ".csv");

    ref
      .getMetadata()
      .then(metadata => {
        setQuiz(q => ({ ...q, name: metadata.customMetadata.name }));
      })
      .catch(err => {});

    ref
      .getDownloadURL()
      .then(url => {
        fetch(url)
          .then(response => response.text())
          .then(data => {
            const options = {
              trim: true,
              skip_empty_lines: true,
              relax_column_count: true
            };
            parse(data, options, (_, questions) => {
              setQuiz(q => ({ ...q, quizId, questions }));
            });
          });
      })
      .catch(err => {});
  }

  if (editor === null) {
    return (
      <div id="editor" className="rootColumn" style={{ background }}>
        <h1>Create a Quiz</h1>
        <h2>You can create your own quiz and share it.</h2>
        <button
          className="fullwidth-button"
          onClick={() => {
            history.push("/editor");
            setEditor("csv");
          }}
        >
          Create from a CSV file
        </button>
        <button
          className="fullwidth-button"
          onClick={() => {
            history.push("/editor");
            setEditor("online");
            setQuiz({
              name: "",
              quizId: shortID(12),
              questions: [["", "", "", "", ""]]
            });
          }}
        >
          Create online
        </button>
        <button
          className="fullwidth-button"
          onClick={() => history.push("/home")}
        >
          Home
        </button>
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

export default Editor;
