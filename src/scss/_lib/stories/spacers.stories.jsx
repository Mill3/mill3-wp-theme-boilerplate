import React from 'react';
import "../index.scss";
import vars from "../sass_vars.json";
// import Button from './buttons/button';

export default {
  title: 'Spacers',
  // component: Button,
  argTypes: {
    variant: {
      options: vars.$spacers,
      control: { type: 'select' },
    },
  },
};

// export const linear = () => {
//   return box(vars.$easings.linear);
// };

export const margin = () => {
  return <div>1</div>;
}
