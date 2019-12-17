import React, { Component } from "react";
import * as firebase from "firebase/app";
import "firebase/firestore";
import { storageRef } from "./";

class FetchQuizz extends Component {
  componentDidMount() {
    var starsRef = storageRef.child("quizz/example_quiz.csv");
    starsRef.getDownloadURL().then(function(url) {
      console.log("fecthing url", url);
      fetch(url)
        .then(response => response.text())
        .then(data => console.log("data", data));
    });
  }

  render() {
    return <h1>test</h1>;
  }
}
export default FetchQuizz;
