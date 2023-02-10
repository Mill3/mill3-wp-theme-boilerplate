import React from "react";
import "../../index.scss";
import "./style.scss";
import vars from "../../sass_vars.json";
import Wrapper from "../components/wrapper";
import CodeBlock from "../components/codeblock";

export default {
  title: "Easings"
};

const Box = ({ type, easing }) => {
  return (
    <Wrapper title={`easings.${type}`}>
      <div className="translate-box">
        <span style={{ animationTimingFunction: easing }}></span>
      </div>
      <CodeBlock
        source={`@use "@mill3-sass-vars/easings";
        .my-element { transition: transform 650ms easings.${type}; }`}
      />
    </Wrapper>
  );
};

export const all = () => {
  return Object.keys(vars.$easings).map((key) => {
    return <Box type={key} easing={vars.$easings[key]} />;
  });
};
