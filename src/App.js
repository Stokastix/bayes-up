import React, { useState } from "react";
import Home from "./Home";
import QuizList from "./QuizList";
import Quiz from "./Quiz";
import Editor from "./Editor";
import Stats from "./Stats";
import Settings from "./Settings";
import SignIn from "./SignIn";
import FetchQuiz from "./FetchQuiz";
import MyQuizzes from "./MyQuizzes";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const App = () => {
  const path = window.location.pathname;
  const [quiz, setQuiz] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  if (loggedIn) {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/quizList">
              <QuizList setQuiz={setQuiz} />
            </Route>
            <Route exact path="/quiz">
              <Quiz quiz={quiz} setQuiz={setQuiz} />
            </Route>
            <Route exact path="/editor">
              <Editor quiz={quiz} />
            </Route>
            <Route exact path="/stats">
              <Stats />
            </Route>
            <Route exact path="/settings">
              <Settings setLoggedIn={setLoggedIn} />
            </Route>
            <Route exact path="/q/:quizId">
              <FetchQuiz setQuiz={setQuiz} path={path} />
            </Route>
            <Route exact path="/myquizzes">
              <MyQuizzes />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  } else {
    return (
      <div className="App">
        <SignIn setLoggedIn={setLoggedIn} />
      </div>
    );
  }
};

export default App;
