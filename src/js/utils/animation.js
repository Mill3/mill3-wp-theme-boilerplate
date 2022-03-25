/**
  * Convert css time to milliseconds (and remove timing suffix)
  * 
  * Example: 
  * cssTimeToMs(400ms) return 400
  * cssTimeToMs(0.4s) return 400
  * 
  * @param {*} time 
  * @returns 
  */
 export const cssTimeToMs = (time) => {
  // if time is in milliseconds, return floated value
  if( time.includes('ms') ) return parseFloat(time);

  // otherwise, time is in second
  // convert floated value to milliseconds
  return parseFloat(time) * 1000;
}


/**
 * Return converted value from number of frames to milliseconds
 * 
 * Example :
 * frameToMs(15) return 500
 * 
 * @param {number} frame 
 * @param {number} fps 
 * @returns number
 */
 export const frameToMs = (frame, fps = 30) => frame / fps * 1000;




 export default {
  cssTimeToMs,
  frameToMs,
 };
