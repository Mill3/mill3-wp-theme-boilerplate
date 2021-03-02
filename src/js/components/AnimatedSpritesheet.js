import { requestInterval } from "@utils/interval";
import { isNumber } from "@utils/is";

// inspired by https://github.com/antonjb/Sprite

/*
 * The default options
 * @param {Number} fps - Frames per second. Higher number is more taxing
 * @param {Boolean} loop - Whether the sprite animation loops
 * @param {Boolean} reverse - Whether to play the animation in reverse
 */
export const DEFAULT_OPTIONS = {
  fps: 12,
  loop: true,
  reverse: false
};

const STOP_OPTIONS = {
  animated: false
};

/**
 * The Sprite constructor
 * @constructor
 * @param {Element} el - The DOM Element
 * @param {Array|Object} frames - The frames of the Sprite
 * @param {Object} options - Additional options for the Sprite
 */
class AnimatedSpriteSheet {
  /**
   * The AnimatedSpriteSheet constructor
   * @constructor
   * @param {Element} el - The DOM Element
   * @param {Array|Object} frames - The frames of the Sprite
   * @param {Object} options - Additional options for the Sprite
   */
  constructor(el, frames, options = {}) {
    this.el = el;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this._isPlaying = false;
    this._currentFrame = 0;
    this._numFrames = frames.length;
    this._framePoints = frames;
    this._animationTick = null;
    this._tickCount = null;
    this._loopCount = 0;
    this._playOptions = null;

    this._onTick = this._onTick.bind(this);
    this._updateFrame(this._framePoints[this._currentFrame]);
  }

  /**
   * Destroy instance and all internal logics
   */
  destroy() {
    this.stop();

    this.el = null;
    this.options = null;

    this._isPlaying = null;
    this._currentFrame = null;
    this._numFrames = null;
    this._framePoints = null;
    this._animationTick = null;
    this._tickCount = null;
    this._loopCount = null;
    this._playOptions = null;

    this._onTick = null;
  }

  /*
   * Starts the spritesheet animation
   * @param {Object} options - Optional overrides
   *		{Number} fps - Frames per second
   *		{Number} from - Frame number to start from
   *		{Boolean} reverse - Whether to play in reverse
   *		{Boolean} loop - If the AnimatedSpriteSheet loops
   *		{Function} onFrame - Callback on a frame
   *		{Function} onComplete - Callback when the animation is finished
   */
  play(options = {}) {
    if (this._isPlaying) {
      return this;
    }

    this._playOptions = { ...this.options, ...options };
    this._loopCount = 0;
    this._tickCount = 0;

    if (this._playOptions.from) this.frame = this._playOptions.from;

    this._isPlaying = true;
    this._animationTick = requestInterval(
      this._onTick,
      1000 / this._playOptions.fps
    );
  }

  /*
   * Stop the spritesheet animation
   * @param {Object} options - Optional options
   *		{Number} frame - Frame to stop on
   *		{Boolean} animated - Whether to animate to the stopping frame
   *		{Function} onComplete - Callback once AnimatedSpriteSheet is stopped
   */
  stop(options = {}) {
    if (!this._isPlaying) {
      return this;
    }

    const opts = { ...STOP_OPTIONS, ...options };
    opts.frame = isNumber(opts.frame) ? opts.frame : this._currentFrame;

    if (this._animationTick) this._animationTick();

    this._animationTick = null;
    this._isPlaying = false;

    if (!opts.animated) {
      this.frame = opts.frame;
      if (opts.onComplete) opts.onComplete.call(this);
    } else {
      this.play({
        reverse: this._playOptions.reverse,
        fps: this._playOptions.fps,
        onFrame: frame => {
          if (opts.frame === frame) this.stop({ onComplete: opts.onComplete });
        }
      });
    }

    return this;
  }

  /*
   * Updates the position of the frame
   * @private
   * @param {Array} frame - The frame to move to
   */
  _updateFrame(frame) {
    //this.el.style.transform = `translate(${frame.x * -1}px, ${frame.y * -1}px)`;
    this.el.setAttribute('style', `--x: ${frame.x}; --y: ${frame.y};`);
  }

  /*
   * Update frame on each render
   * @private
   */
  _onTick() {
    this._currentFrame = (this._playOptions.reverse ? this._numFrames + (this._currentFrame - 1) : this._currentFrame + 1) % this._numFrames;
    this._updateFrame(this._framePoints[this._currentFrame]);

    if (this._playOptions.onFrame) this._playOptions.onFrame.call(this, this._currentFrame, this._loopCount);

    if (this._currentFrame === (this._playOptions.from || 0)) {
      this._loopCount += 1;

      if ( !this._playOptions.loop || this._loopCount === this._playOptions.loop) {
        this.stop();
        if (this._playOptions.onComplete) this._playOptions.onComplete.call(this);
      }
    }

    this._tickCount += 1;
  }

  /*
   * Returns whether the AnimatedSpriteSheet is animating
   * @returns {Boolean}
   */
  get isPlaying() {
    return this._isPlaying;
  }

  /*
   * Getter for the frame number
   * @returns {Number} the current frame number
   */
  get frame() {
    return this._currentFrame;
  }

  /*
   * Setter for the frame number
   * @param {Number} num - The frame number
   */
  set frame(num) {
    if (isNumber(num) && this._currentFrame !== num) {
      this._currentFrame = num < this._numFrames ? num : this._currentFrame;
      this._updateFrame(this._framePoints[this._currentFrame]);
    }
  }
}

export default AnimatedSpriteSheet;
