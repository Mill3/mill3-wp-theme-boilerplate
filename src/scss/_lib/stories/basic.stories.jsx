import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";

export default {
  title: "Basic"
};

const DisplayElements = ({ displayClassName }) => {
  return [1, 2, 3, 4].map((key) => (
    <div key={key} className={`p-10 bg-gray-300 ${displayClassName}`}>
      block-{key}
    </div>
  ));
};

export const Display = () => {
  return Object.values(vars.$display).map((display, key) => {
    let containerClassname = [];
    let itemsClassname = [`d-${display}`];

    switch (display) {
      case "inline":
        itemsClassname.push("mr-10");
        break;
      case "inline-block":
        containerClassname.push("d-block");
        itemsClassname.push("mr-10");
        break;
      case "block":
        containerClassname.push("d-grid grid-gap-10");
        break;
      case "flex":
        containerClassname.push("d-flex grid-gap-10");
        itemsClassname[0] = "d-block";
        break;
      case "inline-flex":
        containerClassname.push("d-flex grid-gap-10");
        break;
      case "grid":
        containerClassname.push("d-grid grid-gap-10 grid-column-4");
        break;
      case "inline-grid":
        itemsClassname.push("mr-10");
        break;
      default:
        break;
    }

    return (
      <Wrapper key={key}>
        <pre>.d-{display}</pre>
        <div className={containerClassname.join(" ")}>
          <DisplayElements displayClassName={itemsClassname.join(" ")} />
        </div>
      </Wrapper>
    );
  });
};

export const List = () => {
  return (
    <>
      <Wrapper title="Remove list bullet/numbers at the beginning of each <li>">
        <pre>.list-none</pre>
        <ul class="list-none p-0 m-0">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
          <li>Item 4</li>
        </ul>
      </Wrapper>
    </>
  );
};

export const Overflow = () => {
  return (
    <>
      <Wrapper>
        {Object.values(vars.$overflow).map((key) => {
          const keyName = typeof key === 'object' ? key[key.length-1] : key
          return <div><pre>.overflow-{keyName}</pre></div>
        })}
      </Wrapper>
    </>
  );
};

export const PointerEvents = () => {
  return (
    <>
      <Wrapper title="Enable all pointer-events for this element">
        <pre>.pointer-events-all</pre>
      </Wrapper>
      <Wrapper
        title="Disable all pointer-events for this element"
        note="Children inherit the property. If a child element has .pointer-events-all, it will cast pointer-events."
      >
        <pre>.pointer-events-none</pre>
      </Wrapper>
    </>
  );
};

export const Position = () => {
  return (
    <>
      <Wrapper>
        {Object.values(vars.$position).map((key) => {
          return <div><pre>.position-{key}</pre></div>
        })}
      </Wrapper>
    </>
  );
};

export const Visibilities = () => {
  return (
    <>
      <Wrapper title="Show an element">
        <pre>.visibility-visible</pre>
      </Wrapper>
      <Wrapper title="Hide an element">
        <pre>.visibility-hidden</pre>
      </Wrapper>
    </>
  );
};

export const ZIndex = () => {
  return (
    <>
      <Wrapper note="Supported values: 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000">
        <pre>.z-$value</pre>
      </Wrapper>
    </>
  );
};
