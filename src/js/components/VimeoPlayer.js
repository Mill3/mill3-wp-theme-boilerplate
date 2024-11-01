import VimeoAPI from "@utils/vimeo-api";
import MouseWheelFrame from "./MouseWheelFrame";

class VimeoPlayer extends MouseWheelFrame {
  constructor(el) {
    super(el);

    this.player = null;

    const urlParams = new URLSearchParams(this.el.src);

    this._autoplay = urlParams.get('autoplay') === '1';

    this._onPlaying = this._onPlaying.bind(this);
    this._onPause = this._onPause.bind(this);
  }

  destroy() {
    super.destroy();

    if (this.player) this.player.destroy();
    this.player = null;

    this._autoplay = null;

    this._onPlaying = null;
    this._onPause = null;
  }
  start() {
    if( this._started ) return;
    super.start();

    // autoplay hack
    if( this._autoplay ) this._onClick();
  }
  stop() {
    if( !this._started ) return;
    super.stop();

    if (this.player) {
      this.player.off("playing", this._onPlaying);
      this.player.off("pause", this._onPause);
    }
  }

  _onClick(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if( !this.player ) {
      VimeoAPI
        .load()
        .then((Player) => {
          this.player = new Player(this.el);
          this.player.on("playing", this._onPlaying);
          this.player.on("pause", this._onPause);
        });
    }
    else this.player.play();
  }
  _onPlaying() { this._unbindEvents(); }
  _onPause() { this._bindEvents(); }
}

export default VimeoPlayer;
