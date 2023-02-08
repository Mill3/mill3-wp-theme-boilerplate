// import sassVars from 'get-sass-vars';
import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";

export default {
  title: "Basic"
};

const DisplayElements = ({ displayClassName }) => {
  return Object.values([1, 2, 3, 4]).map((key) => (
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

export const Pointers = () => {
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

const overflows = [];
overflows.push(`<div><pre>.overflow-auto</pre></div>`);
overflows.push(`<div><pre>.overflow-hidden</pre></div>`);
overflows.push(`<div><pre>.overflow-visible</pre></div>`);
overflows.push(`<div><pre>.overflow-scroll</pre></div>`);

const positions = [];
positions.push(`<div><pre>.position-static</pre></div>`);
positions.push(`<div><pre>.position-fixed</pre></div>`);
positions.push(`<div><pre>.position-relative</pre></div>`);
positions.push(`<div><pre>.position-absolute</pre></div>`);
positions.push(`<div><pre>.position-sticky</pre></div>`);

const lists = [];
lists.push(`
      <pre class="fw-700 m-0 mb-20">.list-none</pre>

      <p class="m-0 mb-20 p-0">Remove list bullet/numbers at the beginning of each &lt;li&gt;</p>

      <ul class="list-none bg-gray-200 p-10">
        <li>item 1</li>
        <li>item 2</li>
        <li>item 3</li>
        <li>item 4</li>
      </ul>`);

const z = `
  <pre class="fw-700 m-0 mb-20">.z-$value</pre>
  <p class="m-0 p-0">Supported values: ${Object.values(vars["$z-index"]).join(", ")}</p>
`;

// export const display = () => d.join("");
// export const list = () => lists.join("");
// export const overflow = () => overflows.join("");
// export const pointerEvents = () => pointers.join("");
// export const position = () => positions.join("");
// export const visiblity = () => visibilities.join("");
// export const zIndex = () => z;
