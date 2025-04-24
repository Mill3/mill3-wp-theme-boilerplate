import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";

export default {
  title: "Classnames/Colors"
};

const BackgroundColorElements = () => {
  return Object.keys(vars.$colors).map((key) => {

    return (
      <div>
        <pre>.bg-{key}</pre>
        <div className={`p-10 bg-${key}`}>Background-color</div>
      </div>
    );
  });
};

export const BackgroundColors = () => {
  return (
      <Wrapper>
        <BackgroundColorElements/>
      </Wrapper>
    );
};

const ColorElements = () => {
  return Object.keys(vars.$colors).map((key) => {

    return (
      <div>
        <pre>.{key}</pre>
        <p className={`p-10 ${key}`}>Color</p>
      </div>
    );
  });
};

export const TextColors = () => {
  return (
      <Wrapper>
        <ColorElements/>
      </Wrapper>
    );
};
