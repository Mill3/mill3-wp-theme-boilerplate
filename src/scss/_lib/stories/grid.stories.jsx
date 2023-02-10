import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";

export default {
  title: "Grid"
};

let columnsArray = [];
let rowsArray = [];

for (let i = 1; i <= vars['$grid-columns']; i++) {
  columnsArray.push(i);
}

for (let i = 1; i <= vars['$grid-rows']; i++) {
  rowsArray.push(i);
}

export const GridColumns = () => {
  return Object.values(columnsArray).map((key) => {
  let columnArray = [];

  for (let i = 1; i <= key; i++) {
    columnArray.push(i);
  }

  return (
    <Wrapper>
      <pre>.grid-column-{key}</pre>
      <div className={`d-grid grid-column-${key} grid-gap-10`}>
        {Object.values(columnArray).map((key) => {
          return <div class="p-10 bg-gray-300">column-{ key }</div>
        })}
      </div>
    </Wrapper>
  );
})} 

export const GridGap = () => {
  return Object.keys(vars.$spacers).map((key) => {

  return (
    <Wrapper>
      <pre>.grid-gap-{key}</pre>
      <div className={`d-grid grid-column-${vars['$grid-columns']} grid-gap-${key}`}>
        {Object.values(columnsArray).map((key) => {
          return <div class="p-10 bg-gray-300">column-{ key }</div>
        })}
      </div>
    </Wrapper>
  );
})} 

export const GridColumnStart = () => {
  return (
    <>
      {Object.values(columnsArray).map((key) => {
        return (
          <Wrapper>
            <pre>.col-start-{key}</pre>
            <div className={`d-grid grid-column-${vars['$grid-columns']} grid-gap-10`}>
              <div class={`p-10 bg-gray-300 col-start-${key}`}>column</div>
            </div>
          </Wrapper>
        );
      })
    }
    {Object.values(columnsArray).map((key) => {
        return (
          <Wrapper>
            <pre>.col-start-span-{key}</pre>
            <div className={`d-grid grid-column-${vars['$grid-columns']} grid-gap-10`}>
              <div class={`p-10 bg-gray-300 col-end-limit col-start-span-${key}`}>column</div>
            </div>
          </Wrapper>
        );
      })
    }
    </>
  );
} 

export const GridColumnEnd = () => {
  return (
    <>
      {Object.values(columnsArray).map((key) => {
        return (
          <Wrapper>
            <pre>.col-end-{key}</pre>
            <div className={`d-grid grid-column-${vars['$grid-columns']} grid-gap-10`}>
              <div class={`p-10 bg-gray-300 col-start-1 col-end-${key}`}>column</div>
            </div>
          </Wrapper>
        );
      })
    }
    {Object.values(columnsArray).map((key) => {
        return (
          <Wrapper>
            <pre>.col-end-span-{key}</pre>
            <div className={`d-grid grid-column-${vars['$grid-columns']} grid-gap-10`}>
              <div class={`p-10 bg-gray-300 col-start-1 col-end-span-${key}`}>column</div>
            </div>
          </Wrapper>
        );
      })
    }
    </>
  );
} 

export const GridColumnFull = () => {

  return (
    <Wrapper>
      <pre>.col-full</pre>
      <div className={`d-grid grid-column-${vars['$grid-columns']} grid-row-2 grid-gap-10`}>
        <div class={`p-10 bg-gray-300 row-start-1`}>column</div>
        <div class={`p-10 bg-gray-300 row-start-2 col-full color-primary`}>column</div>
      </div>
    </Wrapper>
  );
} 

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
          return <div class="p-10 bg-gray-300">row-{ key }</div>
        })}
      </div>
    </Wrapper>
  );
})} 

export const GridRowStart = () => {
  return (
    <>
    <Wrapper>
        <pre>.row-start-$value</pre>
        <div className={`d-grid grid-column-${vars['$grid-columns']} grid-row-${vars['$grid-rows']} grid-gap-10`}>
          {Object.values(rowsArray).map((key) => {
            return (
               <div class={`p-10 bg-gray-300 col-start-${key} row-start-${key}`}>row-start-{key}</div> 
            );
          })
        }
      </div>
    </Wrapper>
    <Wrapper>
        <pre>.row-start-span-$value</pre>
        <div className={`d-grid grid-column-${vars['$grid-columns']} grid-row-${vars['$grid-rows']} grid-gap-10`}>
          {Object.values(rowsArray).map((key) => {
            return (
               <div class={`p-10 bg-gray-300 col-start-${key} row-end-limit row-start-span-${key}`}>row-start-span-{key}</div> 
            );
          })
        }
      </div>
    </Wrapper>
    </>
  );
} 

export const GridRowEnd = () => {
  return (
    <>
    <Wrapper>
        <pre>.row-end-$value</pre>
        <div className={`d-grid grid-column-${vars['$grid-columns']} grid-row-${vars['$grid-rows']} grid-gap-10`}>
          {Object.values(rowsArray).map((key) => {
            return (
               <div class={`p-10 bg-gray-300 col-start-${key} row-end-${key}`}>row-end-{key}</div> 
            );
          })
        }
      </div>
    </Wrapper>
    <Wrapper>
        <pre>.row-end-span-$value</pre>
        <div className={`d-grid grid-column-${vars['$grid-columns']} grid-row-${vars['$grid-rows']} grid-gap-10`}>
          {Object.values(rowsArray).map((key) => {
            return (
               <div class={`p-10 bg-gray-300 col-start-${key} row-end-span-${key}`}>row-end-span-{key}</div> 
            );
          })
        }
      </div>
    </Wrapper>
    </>
  );
} 

export const GridRowFull = () => {

  return (
    <Wrapper>
      <pre>.row-full</pre>
      <div className={`d-grid grid-column-${vars['$grid-columns']} grid-row-${vars['$grid-rows']} grid-gap-10`}>
        <div class={`p-10 bg-gray-300 col-start-1`}>row</div>
        <div class={`p-10 bg-gray-300 col-start-2 row-full color-primary`}>row</div>
      </div>
    </Wrapper>
  );
} 

export const JustifySelf = () => {
  return Object.keys(vars['$align-self']).map((key) => {
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
}

export const Order = () => {
  return (
    <>
      <Wrapper note="This property works with CSS Flexbox and CSS Grid.">
        <div className="d-flex grid-gap-10">
        {Object.values(vars.$order).map((key) => {
          return <div><pre>.order-{key}</pre></div>
        })}
        </div>
      </Wrapper>
    </>
  );
};