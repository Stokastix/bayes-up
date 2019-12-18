import React, { useState } from "react";
import { getColor } from "./utils";
import * as firebase from "firebase/app";
import { withRouter } from "react-router-dom";

const Settings = ({ history, setLoggedIn }) => {
  const [background] = useState(getColor);

  const logout = () => {
    firebase.auth().signOut();
    setLoggedIn(false);
    history.push("/");
  };

  return (
    <div id="settings" className="rootColumn" style={{ background }}>
      <h1>Your Account</h1>
      <button
        className="fullwidth-button"
        onClick={() => history.push("/myquizzes")}
      >
        See My Quizzes
      </button>
      <button className="fullwidth-button" onClick={() => history.push("/")}>
        Back to Home
      </button>
      <button className="fullwidth-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default withRouter(Settings);
