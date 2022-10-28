import { $ } from "@utils/dom";
import easings from "@utils/easings";
import Viewport from "@utils/viewport";

export const getCall = (el) => {
  // if element doesn't have [data-scroll-call] attribute, return null
  if( !el.hasAttribute('data-scroll-call') ) return null;

  const call = el.dataset.scrollCall;
  const calls = call.split(',').map((item) => item.trim());

  if( calls.length === 1 ) return calls[0];
  return calls;
};

export const getDelay = (el) => {
  // if element doesn't have [data-scroll-delay] attribute, return
  if( !el.hasAttribute('data-scroll-delay') ) return false;

  // float number
  const delay = parseFloat(el.getAttribute('data-scroll-delay')) ?? 0;

  // value of 0 will result in no parallax at all, so we ignore it
  // value of 1 will result in no delay at all, so we ignore it
  return delay <= 0 || delay >= 1 ? false : delay;
};

export const getOffset = (el) => {
  // if element doesn't have [data-scroll-offset] attribute, return null
  if( !el.hasAttribute('data-scroll-offset') ) return null;

  // get value from [data-scroll-offset] attribute and split into array
  const offset = el.dataset.scrollOffset.split(',');

  // if offset is empty after splitting, return null
  if( !offset ) return null;

  // loop through each values in offset to transform into readable values
  offset.forEach((value, index) => {
    // if offset is not a string, continue to next value
    if( typeof value != 'string' ) return;

    // if value is in percentage, convert to pixels from vh
    if( value.includes('%') ) offset[index] = parseInt( (value.replace('%', '') * Viewport.height) / 100 );
    // otherwise, parse as integer
    else offset[index] = parseInt(value);
  });
  
  return offset;
};

export const getPosition = (el) => {
  return el.getAttribute('data-scroll-position');
};

export const getProgress = (el) => {
  // if element doesn't have [data-scroll-progress] attribute, return false
  if( !el.hasAttribute('data-scroll-progress') ) return [false, null];

  // float current value or return 0
  const progress = parseFloat( getComputedStyle(el).getPropertyValue('--scroll-progress') || 0 );

  // return easing function or null
  const easing = easings[ el.getAttribute('data-scroll-progress') ] || null;
  
  return [progress, easing];
};

export const getRepeat = (el) => {
  // if element doesn't have [data-scroll-repeat] attribute, return null
  if( !el.hasAttribute('data-scroll-repeat') ) return null;

  const repeat = el.dataset.scrollRepeat;

  if( repeat == 'false' ) return false;
  else if( repeat != undefined ) return true;
  
  return null;
};

export const getSpeed = (el) => {
  // if element doesn't have [data-scroll-speed] attribute, return false
  if( !el.hasAttribute('data-scroll-speed') ) return false;
  
  return parseFloat(el.getAttribute('data-scroll-speed')) * 0.1;
};

export const getTarget = (el) => {
  // if element doesn't have [data-scroll-target] attribute, return null
  if( !el.hasAttribute('data-scroll-target') ) return null;

  const target = el.dataset.scrollTarget;

  // if target is undefined, return null
  if( target == undefined ) return null;

  // try to select target in DOM
  const targetEl = $(target);

  // if target is not found in DOM, throw a warning a return null
  if( !targetEl ) {
    console.error(`Cannot find ${el}'s data-scroll-target=${target} in DOM.`);
    return null;
  }

  return targetEl;
};

export default {
  getCall,
  getDelay,
  getOffset,
  getPosition,
  getProgress,
  getRepeat,
  getSpeed,
  getTarget,
};
