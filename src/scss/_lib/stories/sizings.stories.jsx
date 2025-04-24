import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";

export default {
  title: "Classnames/Sizings"
};


export const Width = () => {
  return (
    <>
     <Wrapper>
      <pre>.w-auto</pre>
      <div class="bg-gray-300 d-flex">
        <div class="bg-gray-400 w-auto">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.w-0</pre>
      <div class="bg-gray-300 d-flex">
        <div class="bg-gray-400 w-0">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.w-50</pre>
      <div class="bg-gray-300 d-flex">
        <div class="bg-gray-400 w-50">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.w-100</pre>
      <div class="bg-gray-300 d-flex">
        <div class="bg-gray-400 w-100">content</div>
      </div>
    </Wrapper>
    </>
  );
};

// export const MinWidth = () => {
//   return (
//     <>
//      <Wrapper>
//       <pre>.min-w-auto</pre>
//       <div class="bg-gray-300 d-flex">
//         <div class="bg-gray-400 min-w-auto">content</div>
//       </div>
//     </Wrapper>
//     <Wrapper>
//       <pre>.min-w-0</pre>
//       <div class="bg-gray-300 d-flex">
//         <div class="bg-gray-400 min-w-0">content</div>
//       </div>
//     </Wrapper>
//     <Wrapper>
//       <pre>.min-w-50</pre>
//       <div class="bg-gray-300 d-flex">
//         <div class="bg-gray-400 min-w-50">content</div>
//       </div>
//     </Wrapper>
//     <Wrapper>
//       <pre>.min-w-100</pre>
//       <div class="bg-gray-300 d-flex">
//         <div class="bg-gray-400 min-w-100">content</div>
//       </div>
//     </Wrapper>
//     </>
//   );
// };

// export const MaxWidth = () => {
//   return (
//     <>
//      <Wrapper>
//       <pre>.max-w-auto</pre>
//       <div class="bg-gray-300 d-flex">
//         <div class="bg-gray-400 w-100 max-w-auto">content</div>
//       </div>
//     </Wrapper>
//     <Wrapper>
//       <pre>.max-w-0</pre>
//       <div class="bg-gray-300 d-flex">
//         <div class="bg-gray-400 w-100 max-w-0">content</div>
//       </div>
//     </Wrapper>
//     <Wrapper>
//       <pre>.max-w-50</pre>
//       <div class="bg-gray-300 d-flex">
//         <div class="bg-gray-400 w-100 max-w-50">content</div>
//       </div>
//     </Wrapper>
//     <Wrapper>
//       <pre>.max-w-100</pre>
//       <div class="bg-gray-300 d-flex">
//         <div class="bg-gray-400 w-100 max-w-100">content</div>
//       </div>
//     </Wrapper>
//     </>
//   );
// };

export const ViewportWidth = () => {
  return (
    <>
     <Wrapper>
      <pre>.vw-auto</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 vw-auto">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.vw-0</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 vw-0">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.vw-50</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 vw-50">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.vw-100</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 vw-100">content</div>
      </div>
    </Wrapper>
    </>
  );
};

export const MinViewportWidth = () => {
  return (
    <>
     <Wrapper>
      <pre>.min-vw-auto</pre>
      <div class="bg-gray-300 d-flex">
        <div class="bg-gray-400 w-auto min-vw-auto">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.min-vw-0</pre>
      <div class="bg-gray-300 d-flex">
        <div class="bg-gray-400 w-auto min-vw-0">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.min-vw-50</pre>
      <div class="bg-gray-300 d-flex">
        <div class="bg-gray-400 w-auto min-vw-50">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.min-vw-100</pre>
      <div class="bg-gray-300 d-flex">
        <div class="bg-gray-400 w-auto min-vw-100">content</div>
      </div>
    </Wrapper>
    </>
  );
};

export const MaxViewportWidth = () => {
  return (
    <>
     <Wrapper>
      <pre>.max-vw-auto</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 w-auto max-vw-auto">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.max-vw-0</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 w-auto max-vw-0">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.max-vw-50</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 w-auto max-vw-50">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.max-vw-100</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 w-auto max-vw-100">content</div>
      </div>
    </Wrapper>
    </>
  );
};

export const Height = () => {
  return (
    <>
     <Wrapper>
      <pre>.h-auto</pre>
      <div class="bg-gray-300" style={{ height: "20vh"}}>
        <div class="bg-gray-400 h-auto">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.h-0</pre>
      <div class="bg-gray-300" style={{ height: "20vh"}}>
        <div class="bg-gray-400 h-0">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.h-50</pre>
      <div class="bg-gray-300" style={{ height: "20vh"}}>
        <div class="bg-gray-400 h-50">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.h-100</pre>
      <div class="bg-gray-300" style={{ height: "20vh"}}>
        <div class="bg-gray-400 h-100">content</div>
      </div>
    </Wrapper>
    </>
  );
};

export const ViewportHeight = () => {
  return (
    <>
     <Wrapper>
      <pre>.vh-auto</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 vh-auto">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.vh-0</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 vh-0">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.vh-50</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 vh-50">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.vh-100</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 vh-100">content</div>
      </div>
    </Wrapper>
    </>
  );
};

export const MinViewportHeight = () => {
  return (
    <>
     <Wrapper>
      <pre>.min-vh-auto</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 min-vh-auto">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.min-vh-0</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 min-vh-0">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.min-vh-50</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 min-vh-50">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.min-vh-100</pre>
      <div class="bg-gray-300">
        <div class="bg-gray-400 min-vh-100">content</div>
      </div>
    </Wrapper>
    </>
  );
};

export const MaxViewportHeight = () => {
  return (
    <>
     <Wrapper>
      <pre>.max-vh-auto</pre>
      <div class="bg-gray-300" style={{ height: "20vh"}}>
        <div class="bg-gray-400 h-100 max-vh-auto">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.max-vh-0</pre>
      <div class="bg-gray-300" style={{ height: "20vh"}}>
        <div class="bg-gray-400 h-100 max-vh-0">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.max-vh-50</pre>
      <div class="bg-gray-300" style={{ height: "20vh"}}>
        <div class="bg-gray-400 h-100 max-vh-50">content</div>
      </div>
    </Wrapper>
    <Wrapper>
      <pre>.max-vh-100</pre>
      <div class="bg-gray-300" style={{ height: "20vh"}}>
        <div class="bg-gray-400 h-100 max-vh-100">content</div>
      </div>
    </Wrapper>
    </>
  );
};
