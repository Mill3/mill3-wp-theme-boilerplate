import React from "react";
import "../index.scss";
import "./easing.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";
import CodeBlock from "./components/codeblock";

export default {
  title: "Classnames/Easings"
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

// export const Linear = () => {
//   return (
//     <Box type={'linear'} easing="linear" />
//   );
// }

// export const Ease = () => {
//   return (
//     <Box type={'ease'} easing="ease" />
//   );
// }

// export const EaseIn = () => {
//   return (
//     <Box type={'ease-in'} easing="ease-in" />
//   );
// }

// export const EaseOut = () => {
//   return (
//     <Box type={'ease-out'} easing="ease-out" />
//   );
// }

// export const EaseInOut = () => {
//   return (
//     <Box type={'ease-in-out'} easing="ease-in-out" />
//   );
// }



export const all = () => {
  return Object.keys(vars.$easings).map((key) => {
    return <Box key={key} type={key} easing={vars.$easings[key]} />;
  });
};
