import React from "react";
import ReactPlayer from "react-player";

export default ({ content, next, submit }) => {
  return (
    <>
      <ReactPlayer className="react-player" url={content[0]} />
      <button className="fullwidth-button" onClick={() => submit() || next()}>
        Next
      </button>
    </>
  );
};
