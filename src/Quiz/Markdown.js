import React from "react";
import ReactMarkdown from "react-markdown";

export default ({ content, next, submit }) => {
  return (
    <>
      <ReactMarkdown className="react-markdown" source={content.join("\n")} />
      <button className="fullwidth-button" onClick={() => submit() || next()}>
        Next
      </button>
    </>
  );
};
