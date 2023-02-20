import React from "react";
import "../../index.scss";
import "../../../commons/_images.scss";
import vars from "../../sass_vars.json";
import Wrapper from "../components/wrapper";

const GridBlockPlaceholder = ({ borderColor = "gray-500", backgroundColor, opacity = 0.5 }) => {
  const style = {
    border: `1px dotted var(--${borderColor})`,
    backgroundColor: `var(--${backgroundColor})`,
    opacity: opacity
  };
  return <span style={style} className={`d-block`}></span>;
};

const GridBlock = ({
  color = "primary",
  gridColumnStart,
  gridColumnEnd,
  gridColumnStartSpan,
  gridColumnFull,
  gridRowStart,
  gridRowEnd,
  gridRowStartSpan,
  gridRowFull,
  justifySelf
}) => {
  let classnames = [];
  if (gridColumnStart > 0) classnames.push(`col-start-${gridColumnStart}`);
  if (gridColumnEnd > 0) classnames.push(`col-end-${gridColumnEnd}`);
  if (gridColumnStartSpan > 0) classnames.push(`col-start-span-${gridColumnStartSpan}`);
  if (gridColumnFull > 0) classnames.push(`col-full`);
  if (gridRowStart > 0) classnames.push(`row-start-${gridRowStart}`);
  if (gridRowEnd > 0) classnames.push(`row-end-${gridRowEnd}`);
  if (gridRowStartSpan > 0) classnames.push(`row-start-span-${gridRowStartSpan}`);
  if (gridRowFull) classnames.push(`row-full`);
  if (justifySelf) classnames.push(`justify-self-${justifySelf}`);

  return (
    <span
      className={`fz-12 p-10 d-inline-flex justify-content-center align-items-center bg-color-${color} ${classnames.join(
        " "
      )}`}
    >
      {classnames.join(" ")}
    </span>
  );
};

const Component = (props) => {
  const { gridColumn, gridRow, gridGap } = props;

  let classnames = [`d-grid`, `grid-column-${gridColumn}`, `grid-row-${gridRow}`, `grid-gap-${gridGap}`];

  const mainGridStyle = {
    aspectRatio: "1/0.8"
  };

  // create range for total box to inject in overlay grid
  const range = Array.from({ length: gridColumn * gridRow }, (value, index) => index);

  return (
    <Wrapper>
      <div className="position-relative">
        {/* main grid with single block in it */}
        <div style={mainGridStyle} className={`${classnames.join(" ")}`}>
          <GridBlock {...props} />
          <GridBlockPlaceholder backgroundColor={"color-secondary"} opacity={1} />
        </div>
        {/* overlay grid */}
        <div className={`${classnames.join(" ")} position-absolute t-0 l-0 w-100 h-100 z-1000 pointer-events-none`}>
          {range.map((key) => (
            <GridBlockPlaceholder key={key} />
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

export default {
  title: "Grid Interactive demo",
  component: GridDemo,
  argTypes: {
    gridColumn: {
      control: { type: "range", min: 0, max: vars["$grid-columns"], step: 1 }
    },
    gridRow: {
      control: { type: "range", min: 0, max: vars["$grid-rows"], step: 1 }
    },
    gridColumnStart: {
      control: { type: "range", min: 0, max: vars["$grid-columns"], step: 1 }
    },
    gridColumnStartSpan: {
      control: { type: "range", min: 0, max: vars["$grid-columns"], step: 1 }
    },
    gridColumnEnd: {
      control: { type: "range", min: 0, max: vars["$grid-columns"] + 1, step: 1 }
    },
    gridColumnFull: {
      control: { type: "boolean", default: false }
    },
    gridRowStart: {
      control: { type: "range", min: 0, max: vars["$grid-rows"] + 1, step: 1 }
    },
    gridRowStartSpan: {
      control: { type: "range", min: 0, max: vars["$grid-rows"], step: 1 }
    },
    gridRowEnd: {
      control: { type: "range", min: 0, max: vars["$grid-rows"] + 1, step: 1 }
    },
    gridRowFull: {
      control: { type: "boolean", default: false }
    },
    justifySelf: {
      control: { type: "select", options: Object.keys(vars["$align-self"]), default: null }
    },
    gridGap: {
      options: Object.keys(vars.$spacers),
      control: { type: "range", min: 0, max: 60, step: 10 }
    }
  }
};

export const GridDemo = (props) => {
  return <Component {...props} />;
};

GridDemo.args = {
  gridColumn: vars["$grid-columns"],
  gridRow: vars["$grid-rows"],
  gridColumnStart: 0,
  gridColumnEnd: 0,
  gridColumnStartSpan: 0,
  gridColumnFull: false,
  gridRowStart: 0,
  gridRowEnd: 0,
  gridRowStartSpan: 0,
  gridRowFull: false,
  gridGap: 10
};
