// https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4
// fully random shuffle by @BetonMAN
export const shuffle = (arr) =>
  arr
    .map((a) => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);


export const unique = (arr) => {
  return [ ...new Set(arr) ];
}

// compare that content of each index or array are equals via strict equality
// works only with two one dimensional arrays
export const isEqual = (arr1, arr2) => arr1.length === arr2.length && arr1.every((val, i) => val === arr2[i]);

export default {
  shuffle,
  unique,
  isEqual,
};
