import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";

import { getColor } from "./utils";

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
        Choose a CSV file with on each line the question, then the right answer,
        then one or several wrong answers. All separated by commas and in the
        specified order
      </h2>
      <label className="editor-input">
        <input type="file" accept=".csv" onChange={handleFile} />
        <span>Select File</span>
      </label>
      <button onClick={() => setEditor(null)}>Go Back</button>
    </div>
  );
};

const QuestionEditorBox = ({ question, setQuestion }) => {
  const [q, correct, incorrect1, incorrect2, incorrect3] = question;

  const margin = { margin: "4px" };
  return (
    <div className="question-input">
      <TextField style={margin} label="Question" value={q} />
      <TextField style={margin} label="Correct answer" value={correct} />
      <TextField style={margin} label={"Wrong answer"} value={incorrect1} />
      <TextField
        style={margin}
        label={"Wrong answer (optional)"}
        value={incorrect2}
      />
      <TextField
        style={margin}
        label={"Wrong answer (optional)"}
        value={incorrect3}
      />
      <button className="question-delete">Delete Question</button>
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
          key={i + q[0]}
          question={q}
          setQuestion={setQuestion(i)}
        />
      ))}
      <button onClick={addQuestion}>Add Question</button>
      <button onClick={() => {}}>Submit Quiz</button>
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
