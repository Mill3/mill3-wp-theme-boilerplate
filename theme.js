const generateValues = (start, end, step = 1) => {
  const len = Math.floor((end - start) / step) + 1;
  return Array(len)
    .fill()
    .map((_, idx) => start + idx * step);
};

const theme = {
  "background-position": {
    bottom: "bottom",
    center: "center",
    left: "left",
    "left-bottom": "left bottom",
    "left-top": "left top",
    right: "right",
    "right-bottom": "right bottom",
    "right-top": "right top",
    top: "top"
  },
  "background-size": ["auto", "cover", "contain"],
  overflow: ["auto", "hidden", "visible", "scroll"],
  display: ["none", "inline", "inline-block", "block", "flex", "inline-flex", "grid", "inline-grid"],
  boxes: {
    narrow: "38%",
    superscope: "45%",
    "half-square": "50%",
    widescreen: "56.25%",
    landscape: "74%",
    "wide-angle": "87.5%",
    square: "100%",
    portrait: "130%"
  },
  "flex-direction": ["column", "column-reverse", "row", "row-reverse"],
  visiblity: ["visible", "hidden"],
  "pointer-events": ["all", "none"],
  "justify-content": {
    center: "center",
    end: "flex-end",
    start: "flex-start",
    between: "space-between",
    around: "around",
    stretch: "stretch"
  },
  "align-items": {
    baseline: "baseline",
    end: "flex-end",
    start: "flex-start",
    center: "center",
    stretch: "stretch"
  },
  "align-content": {
    baseline: "baseline",
    end: "flex-end",
    start: "flex-start",
    center: "center",
    stretch: "stretch"
  },
  "align-self": {
    baseline: "baseline",
    end: "flex-end",
    start: "flex-start",
    center: "center",
    stretch: "stretch"
  },
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  "flex-grow": generateValues(0, 5),
  "flex-shrink": generateValues(0, 5),
  order: generateValues(0, 5),
  "font-family": {
    sans: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "Noto Sans",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "Noto Color Emoji"
    ],
    serif: ["Georgia", "serif"],
    mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
  },
  "font-size": {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "4rem"
  },
  heading: {
    h1: "4rem",
    h2: "3rem",
    h3: "2rem",
    h4: "1rem",
    h5: "0.8rem",
    h6: "0.7rem"
  },
  position: ["static", "fixed", "absolute", "sticky", "relative"],
  "font-weight": [100, 200, 300, 400, 500, 600, 700, 800, 900],
  "text-transform": ["lowercase", "uppercase", "capitalize", "none", "inherit"],
  "text-decoration": ["none", "underline", "inherit"],
  "text-align": ["left", "right", "center"],
  "font-style": ["normal", "italic", "oblique", "inherit"],
  "line-height": {
    none: "1",
    base: "1.25",
    relaxed: "1.5",
    loose: "2"
  },
  "grid-breakpoints": {
    xs: "0px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    xxl: "1441px"
  },
  "list-type": ["none"],
  gutter: "18px",
  spacers: {
    auto: "auto",
    "0": 0,
    "1": "5px",
    "2": "10px",
    "3": "20px",
    "4": "30px",
    "5": "40px",
    "6": "50px",
    "7": "60px",
    "8": "90px",
    "9": "130px",
    "10": "200px"
  },
  sizes: [
    "auto",
    0,
    5,
    10,
    15,
    20,
    25,
    30,
    35,
    40,
    45,
    50,
    55,
    60,
    65,
    70,
    75,
    80,
    85,
    90,
    95,
    100
  ],
  "z-index": generateValues(0, 10000, 1000),
  columns: {
    auto: "auto",
    // 12 columns base
    "1": "8.3333%",
    "2": "50%",
    "3": "40%",
    "4": "30%",
    "5": "41.66667%",
    "6": "50%",
    "7": "58.3333%",
    "8": "66.666667",
    "9": "75%",
    "10": "83.33333%",
    "11": "91.66667%",
    "12": "100%",
    // 10 columns base
    "100": "10%",
    "200": "20%",
    "300": "30%",
    "400": "40%",
    "500": "50%",
    "600": "60%",
    "700": "70%",
    "800": "80%",
    "900": "90%",
    "1000": "100%",
    screen: "100vw"
  },
  "grid-columns": {
    "1": "1fr",
    "2": "repeat(2, 1fr)",
    "3": "repeat(3, 1fr)",
    "4": "repeat(4, 1fr)",
    "5": "repeat(5, 1fr)",
    "6": "repeat(6, 1fr)",
    "7": "repeat(7, 1fr)",
    "8": "repeat(8, 1fr)",
    "9": "repeat(9, 1fr)",
    "10": "repeat(10, 1fr)",
    "11": "repeat(11, 1fr)",
    "12": "repeat(12, 1fr)"
  },
  radiuses: {
    "0": "0",
    "50": "50%",
    "100": "100%"
  },
  boxShadow: {},
  colors: {
    "color-transparent": "transparent",
    "color-current": "currentColor",
    "color-black": "#000000",
    "color-white": "#ffffff",
    "color-primary": "#0d6efd",
    "color-secondary": "#6610f2",
    "gray-100": "#f7fafc",
    "gray-200": "#edf2f7",
    "gray-300": "#e2e8f0",
    "gray-400": "#cbd5e0",
    "gray-500": "#a0aec0",
    "gray-600": "#718096",
    "gray-700": "#4a5568",
    "gray-800": "#2d3748",
    "gray-900": "#1a202c"
  }
};

module.exports = theme;
