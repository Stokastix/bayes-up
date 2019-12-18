import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";

export default ({ setView, setLoggedIn }) => {
  const [background] = useState(getColor);

  const logout = () => {
    firebase.auth().signOut();
    setView("home");
    setLoggedIn(false);
  };

  return (
    <div id="settings" className="rootColumn" style={{ background }}>
      <h1>Your Account</h1>
      <button onClick={() => setView("myquizzes")}>See My Quizzes</button>
      <button onClick={() => setView("home")}>Back to Home</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
