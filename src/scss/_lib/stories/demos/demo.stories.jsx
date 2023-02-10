import React from "react";
import "../../index.scss";
import "../../../commons/_images.scss";
import vars from "../../sass_vars.json";
import Wrapper from "../components/wrapper";

const Component = (props) => {
  // console.log('props:', props)
  const { fontSize, fontWeight, padding, marginTop, marginBottom, color, backgroundColor } = props;
  console.log('fontSize:', fontSize)

  let classnames = [`fz-${fontSize}`, `fw-${fontWeight}`, `p-${padding}`, `mt-${marginTop}`, `mb-${marginBottom}`, color, `bg-${backgroundColor}`];

  return (
    <Wrapper>
      <div style={{ borderRadius: '10px', overflow: 'hidden', fontFamily: 'Helvetica, sans-serif' }} className={classnames.join(" ")}>
        <span>Demo component</span>
        <pre className={`d-block m-0 mt-10`}>class='{classnames.join(" ")}'</pre>
      </div>
    </Wrapper>
  );
};

export const ComponentDemo = (props) => {
  return <Component {...props} />;
};

ComponentDemo.args = {
  fontSize: Object.keys(vars['$font-size'])[4],
  fontWeight: Object.values(vars['$font-weight'])[0],
  padding: 20,
  marginTop: 0,
  marginBottom: 0,
  color: 'color-primary',
  backgroundColor: 'gray-300'
};

export default {
  title: "Component Interactive demo",
  component: Component,
  argTypes: {
    fontSize: {
      options: Object.keys(vars['$font-size']),
      control: { type: "inline-radio" }
    },
    fontWeight: {
      options: Object.values(vars['$font-weight']),
      control: { type: "inline-radio" }
    },
    padding: {
      options: Object.keys(vars.$spacers),
      control: { type: "range", min: 10, max: 200, step: 10 }
    },
    marginTop: {
      options: Object.keys(vars.$spacers),
      control: { type: "range", min: 0, max: 200, step: 10 }
    },
    marginBottom: {
      options: Object.keys(vars.$spacers),
      control: { type: "range", min: 0, max: 200, step: 10 }
    },
    color: {
      options: Object.keys(vars.$colors),
      control: { type: "select" }
    },
    backgroundColor: {
      options: Object.keys(vars.$colors),
      control: { type: "select" }
    }
  }
};
