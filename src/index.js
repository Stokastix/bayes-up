import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";

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
export const storageRef = firebase.storage().ref();

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
