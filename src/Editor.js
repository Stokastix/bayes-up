import React, { useState } from "react";
import { getColor } from "./utils";

const CSVEditor = ({ setEditor }) => {
  const [background] = useState(getColor);

  return (
    <div id="editor" className="rootColumn" style={{ background }}>
      <h2>upload a file</h2>
      <input type="file" accept=".csv" className="editor-input" />
      <button onClick={() => setEditor(null)}>Go Back</button>
    </div>
  );
};

const OnlineEditor = ({ setEditor }) => {
  const [background] = useState(getColor);

  return (
    <div id="editor" className="rootColumn" style={{ background }}>
      <h2>Fill the quiz online</h2>
      <button onClick={() => setEditor(null)}>Go Back</button>
    </div>
  );
};

export default ({ setView }) => {
  const [background] = useState(getColor);
  const [editor, setEditor] = useState(null);

  if (editor === null) {
    return (
      <div id="editor" className="rootColumn" style={{ background }}>
        <h1>Create a Quiz</h1>
        <h2>You can create your own quiz and share it.</h2>
        <button onClick={() => setEditor("csv")}>
          Create from a CSV file (recommended)
        </button>
        <button onClick={() => setView("home")}>Create online</button>
        <button onClick={() => setView("home")}>Go Back</button>
      </div>
    );
  }

  if (editor === "csv") {
    return <CSVEditor setEditor={setEditor} />;
  }

  if (editor === "online") {
    return <OnlineEditor setEditor={setEditor} />;
  }
};
