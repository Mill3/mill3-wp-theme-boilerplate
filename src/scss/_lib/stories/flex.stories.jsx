import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";

export default {
  title: "Flex"
};

const FlexElements = ({ itemClassNames, itemsClassNames }) => {
  return [1, 2, 3, 4].map((key) => (
    <div key={key} className={`p-10 bg-gray-300 ${key == 1 ? itemClassNames : ""} ${itemsClassNames}`}>
      block-{key}
    </div>
  ));
};

export const FlexDirection = () => {
  return Object.values(vars['$flex-direction']).map((direction, key) => {
    return (
      <Wrapper>
        <pre>.flex-{direction}</pre>
        <div className={`d-flex grid-gap-10 flex-${direction}`}>
          <FlexElements />
        </div>
      </Wrapper>
    );
  });
};

export const JustifyContent = () => {
  return Object.keys(vars['$justify-content']).map((key) => {
    return (
      <Wrapper>
        <pre>.justify-content-{key}</pre>
        <div className={`d-flex grid-gap-10 justify-content-${key}`}>
          <FlexElements />
        </div>
      </Wrapper>
    );
  });
};

export const AlignItems = () => {
  return Object.keys(vars['$align-items']).map((key) => {
    return (
      <Wrapper>
        <pre>.align-items-{key}</pre>
        <div className={`d-flex grid-gap-10 align-items-${key}`} style={{ height: "20vh"}}>
          <FlexElements />
        </div>
      </Wrapper>
    );
  });
};

export const AlignContent = () => {
  return (
    <>
      <Wrapper note="This property only takes effect on multi-line flexible containers, where flex-flow is set to either wrap or wrap-reverse). A single-line flexible container (i.e. where flex-flow is set to its default value, no-wrap) will not reflect align-content." />
      {Object.keys(vars['$align-content']).map((key) => {
        return (
          <Wrapper>
            <pre>.align-content-{key}</pre>
            <div className={`d-flex flex-wrap grid-gap-10 align-content-${key}`} style={{ height: "20vh"}}>
              <FlexElements />
            </div>
          </Wrapper>
        );
      })}
    </>
  );
};

export const AlignSelf = () => {
  return Object.keys(vars['$align-self']).map((key) => {
    return (
      <Wrapper>
        <pre>.align-self-{key}</pre>
        <div className={`d-flex flex-wrap grid-gap-10`} style={{ height: "20vh"}}>
          <FlexElements itemClassNames={`color-primary align-self-${key}`} />
        </div>
      </Wrapper>
    );
  });
};

export const FlexWrap = () => {
  return Object.values(vars['$flex-wrap']).map((key) => {
    return (
      <Wrapper>
        <pre>.flex-{key}</pre>
        <div className={`d-flex grid-gap-10 flex-${key}`}>
          <FlexElements itemsClassNames="w-50" />
        </div>
      </Wrapper>
    );
  });
};

const FlexGrowElements = ({ currentKey }) => {
  return [0, 1, 2, 3].map((key) => (
    <div key={key} className={`p-10 bg-gray-300 ${key == 1 ? `color-primary flex-grow-${currentKey}` : `flex-grow-${key}`}`}>
      flex-grow-{key == 1 ? currentKey : key}
    </div>
  ));
};

export const FlexGrow = () => {
  return Object.values(vars['$flex-grow']).map((key) => {
    return (
      <Wrapper>
        <pre>.flex-grow-{key}</pre>
        <div className={`d-flex grid-gap-10`}>
          <FlexGrowElements currentKey={key} />
        </div>
      </Wrapper>
    );
  });
};

const FlexShrinkElements = ({ currentKey }) => {
  return [0, 1, 2, 3].map((key) => (
    <div key={key} className={`p-10 bg-gray-300 ${key == 1 ? `color-primary flex-shrink-${currentKey}` : `flex-shrink-${key}`}`} style={{ width: "30vw"}}>
      flex-shrink-{key == 1 ? currentKey : key}
    </div>
  ));
};

export const FlexShrink = () => {
  return Object.values(vars['$flex-shrink']).map((key) => {
    return (
      <Wrapper>
        <pre>.flex-shrink-{key}</pre>
        <div className="d-flex grid-gap-10">
          <FlexShrinkElements currentKey={key} />
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
          return <div><pre>.order-{key}</pre></div>
        })}
        </div>
      </Wrapper>
    </>
  );
};