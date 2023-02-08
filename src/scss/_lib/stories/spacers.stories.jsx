import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";
import CodeBlock from "./components/codeblock";
console.log('vars:', vars)

export default {
  title: "Spacers"
};

const Spacer = ({ direction = "", value }) => (
  <pre className={`d-block p-10 m${direction}-${value}`}>
    .m{direction}-{value}
  </pre>
);

export const Margin = () => {
  return (
    <Wrapper title="margin">
      {Object.keys(vars.$spacers).map((key) => {
        return <Spacer value={key} />;
      })}
    </Wrapper>
  );
};

export const MarginBottom = () => {
  return (
    <Wrapper title="margin-bottom">
      {Object.keys(vars.$spacers).map((key) => {
        return <Spacer direction="b" value={key} />;
      })}
    </Wrapper>
  );
};

export const MarginTop = () => {
  return (
    <Wrapper title="margin-top">
      {Object.keys(vars.$spacers).map((key) => {
        return <Spacer direction="t" value={key} />;
      })}
    </Wrapper>
  );
};

export const MarginLeft = () => {
  return (
    <Wrapper title="margin-left">
      {Object.keys(vars.$spacers).map((key) => {
        return <Spacer direction="l" value={key} />;
      })}
    </Wrapper>
  );
};

export const MarginRight = () => {
  return (
    <Wrapper title="margin-right">
      {Object.keys(vars.$spacers).map((key) => {
        return <Spacer direction="r" value={key} />;
      })}
    </Wrapper>
  );
};

export const SpacerSassFunction = () => {
  return <Wrapper title="Usage :">
    <CodeBlock source={`@use "@mill3-sass-mixins/spacers";
        .my-element { margin-top: spacers.spacer(20); }`} />
  </Wrapper>;
};
