// import sassVars from 'get-sass-vars';
import "../index.scss";
import vars from "../sass_vars.json";

export default {
  title: 'Basic',
};

const d = Object.values(vars.$display).map(
  display => {
    let classname = `d-${display}`;
    let content = `
      <div>block 1</div>
      <div>block 2</div>
      <div>block 3</div>
      <div>block 4</div>
    `;

    switch(display) {
      case "inline":
        classname = "d-block";
        content = `
          <div class="d-inline bg-gray-200">block 1</div>
          <div class="d-inline bg-gray-300">block 2</div>
          <div class="d-inline bg-gray-200">block 3</div>
          <div class="d-inline bg-gray-400">block 4</div>
        `;
      break;
      case "flex":
        content = `
          <div class="w-50 p-10 bg-gray-200">block 1</div>
          <div class="w-50 p-10 bg-gray-400">block 2</div>
        `;
      break;
      case "grid":
        classname += " grid-column-4 grid-gap-10";
        content = `
          <div class="p-10 bg-gray-200">block 1</div>
          <div class="p-10 bg-gray-300">block 2</div>
          <div class="p-10 bg-gray-400">block 3</div>
          <div class="p-10 bg-gray-500">block 4</div>
        `;
      break;

      case "inline-block": return;
      case "inline-flex": return;
      case "inline-grid": return;
    }

    const output = `<div class="d-block m-0 mb-40 p-20 bg-gray-100">
      <pre class="mb-20">.d-${display}</pre>
      <div class="${classname} p-20" style="border: 1px solid var(--gray-400);">
        ${content}
      </div>
    </div>`;

    return output;
  }
);

d.push(`<p class="m-0 pl-40 pr-40 pt-10 pb-10 bg-gray-700 color-white"><em>.inline-block</em>, <em>.inline-flex</em> and <em>.inline-grid</em> are also available.</p>`);


const visibilities = [];
      visibilities.push(`<div><pre>.visibility-visible</pre> Show element</div>`);
      visibilities.push(`<div><pre>.visibility-hidden</pre> Hide element</div>`);

const pointers = [];
      pointers.push(`<div><pre>.pointer-events-all</pre> Enable all pointer-events for this element</div>`);
      pointers.push(`<div><pre>.pointer-events-none</pre> Disable all pointer-events for this element, and his children. If a child of his has .pointer-events-all, it will received pointer-events.</div>`);


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

export const display = () => d.join("");
export const list = () => lists.join("");
export const overflow = () => overflows.join("");
export const pointerEvents = () => pointers.join("");
export const position = () => positions.join("");
export const visiblity = () => visibilities.join("");
export const zIndex = () => z;
