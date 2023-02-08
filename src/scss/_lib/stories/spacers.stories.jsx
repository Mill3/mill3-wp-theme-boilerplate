import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";
import CodeBlock from "./components/codeblock";
console.log('vars:', vars)

export default {
  title: "Spacers"
};

const SpacerElementMargin = ({ direction = "", value }) => (
  <pre className={`d-block p-10 m${direction}-${value}`}>
    .m{direction}-{value}
  </pre>
);

const SpacerElementPadding = ({ direction = "", value, className }) => (
  <pre className={`d-block p${direction}-${value} ${className}`}>
    .p{direction}-{value}
  </pre>
);

export const Margin = () => {
  return (
    <Wrapper title="margin">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementMargin value={key} />;
      })}
    </Wrapper>
  );
};

export const MarginBottom = () => {
  return (
    <Wrapper title="margin-bottom">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementMargin direction="b" value={key} />;
      })}
    </Wrapper>
  );
};

export const MarginTop = () => {
  return (
    <Wrapper title="margin-top">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementMargin direction="t" value={key} />;
      })}
    </Wrapper>
  );
};

export const MarginLeft = () => {
  return (
    <Wrapper title="margin-left">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementMargin direction="l" value={key} />;
      })}
    </Wrapper>
  );
};

export const MarginRight = () => {
  return (
    <Wrapper title="margin-right">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementMargin direction="r" value={key} />;
      })}
    </Wrapper>
  );
};

export const PaddingBottom = () => {
  return (
    <Wrapper title="padding-bottom">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementPadding direction="b" value={key} />;
      })}
    </Wrapper>
  );
};

export const PaddingTop = () => {
  return (
    <Wrapper title="padding-top">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementPadding direction="t" value={key} />;
      })}
    </Wrapper>
  );
};

export const PaddingLeft = () => {
  return (
    <Wrapper title="padding-left">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementPadding direction="l" value={key} />;
      })}
    </Wrapper>
  );
};

export const PaddingRight = () => {
  return (
    <Wrapper title="padding-right">
      {Object.keys(vars.$spacers).map((key) => {
        return <SpacerElementPadding direction="r" value={key} className="ta-right" />;
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
