import React, { useState } from "react";
import { getColor } from "./utils";

export default ({ setView }) => {
  const [background] = useState(getColor);
  return (
    <div id="editor" className="rootColumn" style={{ background }}>
      <h2>
        Unfortunately this part has not been implemented yet. It will be
        released in the next version
      </h2>
      <button onClick={() => setView("home")}>Go Back</button>
    </div>
  );
};
