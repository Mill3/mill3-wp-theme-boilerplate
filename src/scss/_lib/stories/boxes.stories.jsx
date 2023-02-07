import React from 'react';
import "../index.scss";
import "../../commons/_images.scss";
import vars from "../sass_vars.json";

const Box = ({ size }) => {
  return (
    <div className='mb-40'>
      <pre>.box-{size}</pre>
      <div className={`box box-${size} w-50 bg-gray-400 overflow-hidden`}>
        <div className="box-content position-relative"><img src="https://images.unsplash.com/photo-1661961112835-ca6f5811d2af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2344&q=80" className="image-as-background" /></div>
      </div>
    </div>
  )
}

export default {
  title: "Boxes",
  component: Box,
  argTypes: {
    sizes: {
      options: Object.keys(vars.$boxes),
      control: { type: 'select' }
    },
  },
};

export const BoxDemo = (props) => {
  return (
    <Box size={props.sizes} />
  )
}

export const All = () => {
  return (
    Object.keys(vars.$boxes).map((key) => <Box size={key} />)
  )
}

BoxDemo.args = {
  sizes: Object.keys(vars.$boxes)[0],
}
