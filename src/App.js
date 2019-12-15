import React, { useState } from "react";
import Home from "./Home";
import QuizList from "./QuizList";
import Quiz from "./Quiz";
import Editor from "./Editor";
import Stats from "./Stats";
import SignIn from "./SignIn";

const App = () => {
  const [view, setView] = useState("home");
  const [quiz, setQuiz] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  if(loggedIn){
    return (
      <div className="App">
        {view === "home" && <Home setView={setView} />}
        {view === "quizList" && <QuizList setView={setView} setQuiz={setQuiz} />}
        {view === "quiz" && (
          <Quiz quiz={quiz} setQuiz={setQuiz} setView={setView} />
        )}
        {view === "editor" && <Editor quiz={quiz} setView={setView} />}
        {view === "stats" && <Stats setView={setView} />}
      </div>
    );
  } else {
    return(
      <div className="App">
        <h1 style={{textAlign: "center"}}>
          Bayes Up <br />
          Login <br/>
        </h1>
        <SignIn setLoggedIn={setLoggedIn} />
      </div>
    );
  }
};

export default App;
