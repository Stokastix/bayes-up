import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";

export default ({ setView, setLoggedIn }) => {
  const [background] = useState(getColor);

  return (
    <div id="settings" className="rootColumn" style={{ background }}>
      <button
        onClick={() => {
          firebase.auth().signOut();
          setLoggedIn(false);
        }}
      >
        Logout
      </button>
      <button onClick={() => setView("home")}>Back to Home</button>
    </div>
  );
};
