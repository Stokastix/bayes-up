import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import "firebase/firestore";
import * as firebase from "firebase/app";

import "./index.css";
import App from "./App";

const firebaseConfig = {
  apiKey: "AIzaSyDS2IxNNl2uArVd3yHg0LX0WrdqcDKePoc",
  authDomain: "bayes-up.firebaseapp.com",
  databaseURL: "https://bayes-up.firebaseio.com",
  projectId: "bayes-up",
  storageBucket: "bayes-up.appspot.com",
  messagingSenderId: "1087423613302",
  appId: "1:1087423613302:web:969dc77f5187628c2ad257",
  measurementId: "G-SPNM85XCJW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

const ensureLoggedIn = () => {
  const x = localStorage.getItem("bayes-up-login-token");
  if (x) return;
  const newLogin = (Math.random() * 1000000000).toFixed(0);
  localStorage.setItem("bayes-up-login-token", newLogin);

  db.collection("stats")
    .doc(newLogin)
    .set({
      "Correct_0%": 0,
      "Correct_10%": 0,
      "Correct_20%": 0,
      "Correct_30%": 0,
      "Correct_40%": 0,
      "Correct_50%": 0,
      "Correct_60%": 0,
      "Correct_70%": 0,
      "Correct_80%": 0,
      "Correct_90%": 0,
      "Correct_100%": 0,
      "Incorrect_0%": 0,
      "Incorrect_10%": 0,
      "Incorrect_20%": 0,
      "Incorrect_30%": 0,
      "Incorrect_40%": 0,
      "Incorrect_50%": 0,
      "Incorrect_60%": 0,
      "Incorrect_70%": 0,
      "Incorrect_80%": 0,
      "Incorrect_90%": 0,
      "Incorrect_100%": 0
    });
};
ensureLoggedIn();

export const login = localStorage.getItem("bayes-up-login-token");

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
