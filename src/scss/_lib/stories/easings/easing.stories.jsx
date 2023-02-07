import React from 'react';
import "../../index.scss";
import "./style.scss";
import vars from "../../sass_vars.json";

export default {
  title: 'Easings'
};

const Box = ({type, easing}) => {
  return (
    <div>
      <h4 className="fz-14">easings.{type}</h4>
      <div className="translate-box mb-60"><span style={{ animationTimingFunction: easing }}></span></div>
    </div>
  )
}

export const all = () => {
  return (
    Object.keys(vars.$easings).map((key) => {
      return <Box type={key} easing={vars.$easings[key]} />
    })
  )
}
