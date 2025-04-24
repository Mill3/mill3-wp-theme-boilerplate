import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";

export default {
  title: "Classnames/Grid"
};

const fillArray = (l, startAt = 1) => Array.apply(null, Array(l)).map((y, i) => startAt + i);

let columnsArray = fillArray(vars["$grid-columns"]);
let rowsArray = fillArray(vars["$grid-rows"]);
let gapsArray = vars["$grid-gaps"];

export const GridColumns = () => {
  return Object.values(columnsArray).map((key) => {
    let columnArray = fillArray(key);
    return (
      <Wrapper>
        <pre>.grid-column-{key}</pre>
        <div className={`d-grid grid-column-${key} grid-gap-10`}>
          {Object.values(columnArray).map((key) => {
            return <div class="p-10 bg-gray-300">column-{key}</div>;
          })}
        </div>
      </Wrapper>
    );
  });
};

export const GridGap = () => {
  return Object.keys(gapsArray).map((key) => {
    return (
      <Wrapper>
        <pre>.grid-gap-{key}</pre>
        <div className={`d-grid grid-column-6 grid-gap-${key}`}>
          {(new Array(6)).fill(0).map((key, index) => {
            return <div class="p-10 bg-gray-300">column-{index + 1}</div>;
          })}
        </div>
      </Wrapper>
    );
  });
};

export const ColumGap = () => {
  return Object.keys(gapsArray).map((key) => {
    return (
      <Wrapper>
        <pre>.column-gap-{key} (.grid-gap-20)</pre>
        <div className={`d-grid grid-column-3 grid-gap-20 column-gap-${key}`}>
          {(new Array(9)).fill(0).map((key, index) => {
            return <div class="p-10 bg-gray-300">column-{index + 1}</div>;
          })}
        </div>
      </Wrapper>
    );
  });
};

export const RowGap = () => {
  return Object.keys(gapsArray).map((key) => {
    return (
      <Wrapper>
        <pre>.row-gap-{key} (.grid-gap-20)</pre>
        <div className={`d-grid grid-column-3 grid-gap-20 row-gap-${key}`}>
          {(new Array(9)).fill(0).map((key, index) => {
            return <div class="p-10 bg-gray-300">column-{index + 1}</div>;
          })}
        </div>
      </Wrapper>
    );
  });
};

export const GridColumnStart = () => {
  return (
    <>
      {Object.values(columnsArray).map((key) => {
        return (
          <Wrapper>
            <pre>.col-start-{key}</pre>
            <div className={`d-grid grid-column-${vars["$grid-columns"]} grid-gap-10`}>
              <div class={`p-10 bg-gray-300 col-start-${key}`}>column</div>
            </div>
          </Wrapper>
        );
      })}
    </>
  );
};

export const GridColumnSpan = () => {
  return (
    <>
      {Object.values(columnsArray).map((key) => {
        return (
          <Wrapper>
            <pre>.col-span-{key}</pre>
            <div className={`d-grid grid-column-${vars["$grid-columns"]} grid-gap-10`}>
              <div class={`p-10 bg-gray-300 col-start-1 col-span-${key}`}>column</div>
            </div>
          </Wrapper>
        );
      })}
    </>
  );
};

export const GridRows = () => {
  return Object.values(rowsArray).map((key) => {
    let rowArray = [];

    for (let i = 1; i <= key; i++) {
      rowArray.push(i);
    }

    return (
      <Wrapper>
        <pre>.grid-row-{key}</pre>
        <div className={`d-grid grid-row-${key} grid-gap-10`}>
          {Object.values(rowArray).map((key) => {
            return <div class="p-10 bg-gray-300">row-{key}</div>;
          })}
        </div>
      </Wrapper>
    );
  });
};

export const GridRowStart = () => {
  return (
    <Wrapper>
      <pre>.row-start-$value</pre>
      <div className={`d-grid grid-column-3 grid-row-${vars["$grid-rows"]} grid-gap-10`}>
        {Object.values(rowsArray).map((key) => {
          return <div class={`p-10 bg-gray-300 col-start-${key} row-start-${key}`}>row-start-{key}</div>;
        })}
      </div>
    </Wrapper>
  );
};

export const GridRowSpan = () => {
  return (
    <Wrapper>
      <pre>.row-span-$value</pre>
      <div className={`d-grid grid-column-3 grid-row-3 grid-gap-10`}>
        <div class={`p-10 bg-gray-300 row-span-1`}>row-span-1</div>
        <div class={`p-10 bg-gray-300 row-span-2`}>row-span-2</div>
        <div class={`p-10 bg-gray-300 row-span-3`}>row-span-3</div>
      </div>
    </Wrapper>
  );
};

export const JustifySelf = () => {
  return Object.keys(vars["$align-self"]).map((key) => {
    return (
      <Wrapper>
        <pre>justify-self-{key}</pre>
        <div className="d-grid grid-column-2 grid-gap-10">
          <div class="p-10 bg-gray-300">column</div>
          <div class={`p-10 bg-gray-300 color-primary justify-self-${key}`}>column</div>
        </div>
      </Wrapper>
    );
  });
};

export const Order = () => {
  return (
    <>
      <Wrapper note="This property works with CSS Flexbox and CSS Grid.">
        <div className="d-flex grid-gap-10">
          {Object.values(vars.$order).map((key) => {
            return (
              <div>
                <pre>.order-{key}</pre>
              </div>
            );
          })}
        </div>
      </Wrapper>
    </>
  );
};
