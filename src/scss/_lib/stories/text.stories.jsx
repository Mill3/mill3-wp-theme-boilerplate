import React from "react";
import "../index.scss";
import vars from "../sass_vars.json";
import Wrapper from "./components/wrapper";
// import CodeBlock from "./components/codeblock";

export default {
  title: "Text"
};

export const Headings = () => {
  return (
    <Wrapper title="Headings default">
      {
        [1, 2, 3, 4, 5, 6].map((key) => {
          const Tag = `h${key}`
          return (
            <Tag key={key}>H{key} default styling</Tag>
          )
        })
      }
    </Wrapper>
  )
}
