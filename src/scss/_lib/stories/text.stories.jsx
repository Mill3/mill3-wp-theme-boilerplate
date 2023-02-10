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

export const FontFamily = () => {
  return (
    <>
      <Wrapper>
        {Object.keys(vars['$font-family']).map((key) => {
          return (
            <div>
              <pre>.ff-{key}</pre>
              <h4 className={`fw-300 ff-${key}`}>ff-{key}</h4>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const FontSize = () => {
  return (
    <>
      <Wrapper>
        {Object.keys(vars['$font-size']).map((key) => {
          return (
            <div>
              <pre>.fz-{key}</pre>
              <p className={`fz-${key}`}>fz-{key}</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const FontSizeFluid = () => {
  return (
    <>
      <Wrapper>
        {Object.keys(vars['$font-size']).map((key) => {
          return (
            <div>
              <pre>.ffz-{key}</pre>
              <p className={`ffz-${key}`}>ffz-{key}</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const FontSizeFluidXsToMd = () => {
  return (
    <>
      <Wrapper>
        {Object.keys(vars['$font-size']).map((key) => {
          return (
            <div>
              <pre>.ffz-md-{key}</pre>
              <p className={`ffz-${key} ffz-md-${key}`}>ffz-md-{key}</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const FontSizeFluidXsToLg = () => {
  return (
    <>
      <Wrapper>
        {Object.keys(vars['$font-size']).map((key) => {
          return (
            <div>
              <pre>.ffz-lg-{key}</pre>
              <p className={`ffz-${key} ffz-md-${key} ffz-lg-${key}`}>ffz-lg-{key}</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const FontWeight = () => {
  return (
    <>
      <Wrapper>
        {Object.values(vars['$font-weight']).map((key) => {
          return (
            <div>
              <pre>.fw-{key}</pre>
              <h4 className={`fw-${key}`}>fw-{key}</h4>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const FontStyle = () => {
  return (
    <>
      <Wrapper>
        {Object.values(vars['$font-style']).map((key) => {
          return (
            <div>
              <pre>.fs-{key}</pre>
              <p className={`fs-${key}`}>fs-{key}</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const LineHeight = () => {
  return (
    <>
      <Wrapper>
        {Object.keys(vars['$line-height']).map((key) => {
          return (
            <div>
              <pre>.lh-{key}</pre>
              <p className={`lh-${key}`}>In turpis. Sed libero. Phasellus consectetuer vestibulum elit. Fusce fermentum odio nec arcu. Aenean viverra rhoncus pede. In ac felis quis tortor malesuada pretium. Morbi vestibulum volutpat enim. Nullam cursus lacinia erat. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas malesuada.</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const TextAlign = () => {
  return (
    <>
      <Wrapper>
        {Object.values(vars['$text-align']).map((key) => {
          return (
            <div>
              <pre>.ta-{key}</pre>
              <p className={`ta-${key}`}>In turpis. Sed libero. Phasellus consectetuer vestibulum elit. Fusce fermentum odio nec arcu. Aenean viverra rhoncus pede. In ac felis quis tortor malesuada pretium. Morbi vestibulum volutpat enim. Nullam cursus lacinia erat. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas malesuada.</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const TextTransform = () => {
  return (
    <>
      <Wrapper>
        {Object.values(vars['$text-transform']).map((key) => {
          return (
            <div>
              <pre>.tt-{key}</pre>
              <p className={`tt-${key}`}>In turpis. Sed libero. Phasellus consectetuer vestibulum elit. Fusce fermentum odio nec arcu. Aenean viverra rhoncus pede. In ac felis quis tortor malesuada pretium. Morbi vestibulum volutpat enim. Nullam cursus lacinia erat. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas malesuada.</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};

export const TextDecoration = () => {
  return (
    <>
      <Wrapper>
        {Object.values(vars['$text-decoration']).map((key) => {
          return (
            <div>
              <pre>.td-{key}</pre>
              <p className={`td-${key}`}>td-{key}</p>
            </div>
          )
        })}
      </Wrapper>
    </>
  );
};



