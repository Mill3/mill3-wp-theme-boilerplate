// copied from https://github.com/arasatasaygin/is.js
/*

──────────────────────────────────────────
──────────────────────────────────────────
IS
──────────────────────────────────────────
──────────────────────────────────────────

isArray( array );
isBoolean( true || false );
isDate( new Date() );
isDomNode( object );
isFunction( function );
isHTMLCollection( object );
isJSON( object );
isNodeList( object );
isNull( value );
isNumber( number );
isObject( object );
isString( string );
isUndefined( value );
isWindow( window );

*/

// is a given value Array? (check native isArray first)
export const isArray =
  Array.isArray ||
  function (v) {
    return toString.call(v) === "[object Array]";
  };

// is a given value Boolean?
export const isBoolean = (v) => v === true || v === false || toString.call(v) === "[object Boolean]";

// is a given value Date Object?
export const isDate = (v) => toString.call(v) === "[object Date]";

// is a given object a DOM node?
export const isDomNode = (v) => Object(v) === v && v.nodeType > 0;

// is a given value function?
export const isFunction = (v) => toString.call(v) === "[object Function]" || typeof v === "function";

// is a given object a HTMLCollection
export const isHTMLCollection = (v) => v instanceof HTMLCollection;

// is given value a pure JSON object?
export const isJSON = (v) => toString.call(v) === "[object Object]";

// is a given object a NodeList
export const isNodeList = (v) => v instanceof NodeList;

// is a given value null?
export const isNull = (v) => v === null;

// is a given value number?
export const isNumber = (v) => Number.isFinite(v);

// is a given value object?
export const isObject = (v) => v.constructor.name == "Object";

// is a given value String?
export const isString = (v) => toString.call(v) === "[object String]";

// is a given value undefined?
export const isUndefined = (v) => v === void 0;

// is a given value window?
export const isWindow = (v) => v != null && typeof v === "object" && "setInterval" in v;

export default {
  isArray,
  isBoolean,
  isDate,
  isDomNode,
  isFunction,
  isHTMLCollection,
  isNodeList,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  isWindow
};
