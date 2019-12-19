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
import { BrowserRouter as Router, Route } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import "./transitions.css";

const App = () => {
  const path = window.location.pathname;
  const [quiz, setQuiz] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const routes = [
    { path: "/", Component: <Home /> },
    { path: "/Home", Component: <Home /> },
    {
      path: "/quizList",
      Component: <QuizList setQuiz={setQuiz} />
    },
    {
      path: "/quiz",
      Component: <Quiz quiz={quiz} setQuiz={setQuiz} />
    },
    { path: "/editor", Component: <Editor quiz={quiz} /> },
    { path: "/stats", Component: <Stats /> },
    {
      path: "/settings",
      Component: <Settings setLoggedIn={setLoggedIn} />
    },
    {
      path: "/q/:quizId",
      Component: <FetchQuiz setQuiz={setQuiz} path={path} />
    },
    { path: "/myquizzes", Component: <MyQuizzes /> }
  ];

  if (loggedIn) {
    return (
      <div className="App">
        <Router>
          {routes.map(({ path, Component }) => (
            <Route key={path} exact path={path}>
              {({ match }) => (
                <CSSTransition
                  in={match != null}
                  timeout={300}
                  classNames="page"
                  unmountOnExit
                >
                  {Component}
                </CSSTransition>
              )}
            </Route>
          ))}
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
