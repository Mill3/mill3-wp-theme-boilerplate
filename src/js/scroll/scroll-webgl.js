import EMITTER from "@core/emitter";
import { INVIEW_ENTER } from "@scroll/constants";
import { $, $$, html, body, rect } from "@utils/dom";
import Viewport from "@utils/viewport";
import { createVertexShader, createFragmentShader, createProgram, createRectangle } from "@utils/webgl";

import VERTEX_SHADER from "./vertex.glsl";
import FRAGMENT_SHADER from "./fragment.glsl";

export const SELECTOR = "img[data-webgl]";

const DEBUG = false;

class ScrollWebGL {
  constructor(scroll) {
    this.scroll = scroll;
    this.canvas = $('.site-webgl', body);
    this.gl = this.canvas ? this.canvas.getContext('webgl') : null;
    this.images = null;

    this._data = { width: 0, height: 0, resolution: null, dpi: Viewport.devicePixelRatio, time: 0 };
    this._vertexShader = null;
    this._fragmentShader = null;
    this._program = null;
    this._attributes = null;
    this._buffers = null;
    this._uniforms = null;
    this._planeSegments = { width: 10, height: 40 };

    this._onCall = this._onCall.bind(this);

    if( this.gl ) {
      this._createGLEssentials();
      html.classList.add('has-scroll-webgl');
    }
  }

  init($target = body) {
    if( !this.gl ) return;

    this.images = [ ...$$(SELECTOR, $target) ].map(img => new GLImage(img, this.gl));
    this.resize();
  }
  update($target = body) {
    if( !this.gl ) return;

    this.gl.useProgram(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);

    this.images?.forEach(img => img.destroy());
    this.images = [ ...$$(SELECTOR, $target) ].map(img => new GLImage(img, this.gl));
    this.resize();
  }
  start() {
    if( !this.gl || this._started ) return;
    this._started = true;

    EMITTER.on("SiteScroll.webgl", this._onCall);
  }
  stop() {
    if( !this.gl || !this._started ) return;
    this._started = false;

    EMITTER.off("SiteScroll.webgl", this._onCall);
  }

  raf(delta = 1) {
    if( !this.gl || !this._started ) return;

    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // only get images who are inside viewport
    const imagesInViewport = this.images?.filter(img => img.isInViewport(this.scroll.y));

    // stop here if there is no images inside viewport
    if( imagesInViewport.length < 1 ) return;

    // Tell it to use our program (pair of shaders)
    this.gl.useProgram(this._program);

    // Turn on and bind position attribute
    this.gl.enableVertexAttribArray(this._attributes.position);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers.position);

    // Tell the attribute how to get data out of position's buffer (ARRAY_BUFFER)
    this.gl.vertexAttribPointer(this._attributes.position, 2, this.gl.FLOAT, false, 0, 0);

    // calculate how much vertices to draw
    const numVertices = this.gl.getBufferParameter(this.gl.ARRAY_BUFFER, this.gl.BUFFER_SIZE) / 8;

    // Turn on and bind the texture attribute
    this.gl.enableVertexAttribArray(this._attributes.texture);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers.texture);

    // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    this.gl.vertexAttribPointer(this._attributes.texture, 2, this.gl.FLOAT, false, 0, 0);

    this._data.time += delta;

    this.gl.uniform2fv(this._uniforms.resolution, this._data.resolution);
    this.gl.uniform1f(this._uniforms.time, this._data.time * 0.02);

    // render each images
    imagesInViewport.forEach(img => {
      // get image position (x, y)
      let [ x, y ] = img.position;
      y -= this.scroll.y;

      // set texture
      this.gl.bindTexture(this.gl.TEXTURE_2D, img.texture);

      // Set image specifics uniforms
      this.gl.uniform2fv(this._uniforms.scale, img.scale);
      this.gl.uniform2fv(this._uniforms.size, img.size);
      this.gl.uniform2fv(this._uniforms.transformOrigin, img.transformOrigin);
      this.gl.uniform2fv(this._uniforms.textureResolution, img.resolution);
      this.gl.uniform2f(this._uniforms.translate, x, y);
      this.gl.uniform1f(this._uniforms.opacity, img.opacity);
      this.gl.uniform1f(this._uniforms.progress, img.progress);

      // project specifics uniforms
      //this.gl.uniform1f(this._uniforms.myCustomUniform, myValue);

      // Draw image
      if( DEBUG ) this.gl.drawArrays(this.gl.LINE_STRIP, 0, numVertices);
      else this.gl.drawArrays(this.gl.TRIANGLES, 0, numVertices);
    });

    // show how many images are rendered in this frame (only during development)
    //if( process.env.NODE_ENV === "development" ) console.log(`images rendered: ${imagesInViewport.length}`);
  }
  resize() {
    if( !this.gl ) return;

    const { dpi } = this._data;
    let { width, height } = rect(this.canvas);

    // save width / height
    this._data.width = width;
    this._data.height = height;
    this._data.resolution = [ width, height ];

    width = width * dpi;
    height = height * dpi;

    // resize canvas
    this.canvas.width = width;
    this.canvas.height = height;

    // resize webgl context
    this.gl.viewport(0, 0, width, height);
    
    // resize each images
    this.images?.forEach(img => img.resize(this.scroll.y));
  }
  reset() {
    if( !this.gl ) return;

    this.gl.useProgram(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);

    this.images?.forEach(img => img.destroy());
    this.images = null;
  }
  /*
  destroy() {
    if( this._program ) this.gl.deleteProgram(this._program);
    if( this._vertexShader ) this.gl.deleteShader(this._vertexShader);
    if( this._fragmentShader ) this.gl.deleteShader(this._fragmentShader);
    if( this._attributes.position ) this.gl.disableVertexAttribArray(this._attributes.position);
    if( this._attributes.texture ) this.gl.disableVertexAttribArray(this._attributes.texture);
    if( this._buffers.position ) this.gl.deleteBuffer(this._buffers.position); 
    if( this._buffers.texture ) this.gl.deleteBuffer(this._buffers.texture);
  }
  */

  _createGLEssentials() {
    this._vertexShader = createVertexShader(this.gl, VERTEX_SHADER);
    this._fragmentShader = createFragmentShader(this.gl, FRAGMENT_SHADER);
    this._program = createProgram(this.gl, this._vertexShader, this._fragmentShader);

    this._attributes = {
      position: this.gl.getAttribLocation(this._program, "a_position"),
      texture: this.gl.getAttribLocation(this._program, "a_texCoord"),
    };

    this._buffers = {
      position: this.gl.createBuffer(),
      texture: this.gl.createBuffer(),
    };

    this._uniforms = {
      resolution: this.gl.getUniformLocation(this._program, "u_resolution"),
      size: this.gl.getUniformLocation(this._program, "u_size"),
      translate: this.gl.getUniformLocation(this._program, "u_translate"),
      transformOrigin: this.gl.getUniformLocation(this._program, "u_transformOrigin"),
      textureResolution: this.gl.getUniformLocation(this._program, "u_textureResolution"),
      time: this.gl.getUniformLocation(this._program, "u_time"),
      opacity: this.gl.getUniformLocation(this._program, "u_opacity"),
      scale: this.gl.getUniformLocation(this._program, "u_scale"),
      progress: this.gl.getUniformLocation(this._program, "u_progress"),

      // project specifics uniforms
      //myCustomUniform: this.gl.getUniformLocation(this._program, "u_myCustomUniform"),
    };

    // bind position buffer & create a rectangle
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers.position);
    createRectangle(this.gl, 0, 0, 1, 1, this._planeSegments.width, this._planeSegments.height);

    // bind texture coordinates buffer & create a rectangle of texture coordinates
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers.texture);
    createRectangle(this.gl, 0, 0, 1, 1, this._planeSegments.width, this._planeSegments.height);

    // enable transparency
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  _onCall(direction, obj) {
    // do nothing for "exit" events
    if (direction !== INVIEW_ENTER) return;

    const img = this.images?.find(img => img.el === obj.el);
    if( !img ) return;

    img.scrollObj = obj;
  }
}



class GLImage {
  constructor(el, gl) {
    this.el = el;
    this.gl = gl;
    this.opacity = 1;
    this.scrollObj = null;
    
    this._data = {
      position: [0, 0],
      resolution: [0, 0],
      scale: [1, 1],
      size: [0, 0],
      transformOrigin: [0.5, 0.5],
    };

    this._texture = null;

    this.init();
  }

  init() {
    // remove data-scroll attributes
    //this.el.removeAttribute('data-scroll');

    if( this.el.complete ) this._onImageLoaded();
  }
  destroy() {
    if( this._texture && this.gl ) this.gl.deleteTexture(this._texture);

    this.el = null;
    this.gl = null;
    this.opacity = null;

    this._data = null;
    this._texture = null;
  }
  resize(scrollY) {
    const bcr = rect(this.el);

    this._data.position[0] = bcr.x;
    this._data.position[1] = bcr.y - scrollY;
    this._data.size[0] = bcr.width;
    this._data.size[1] = bcr.height;
  }
  isInViewport(scrollY) {
    const y = this._data.position[1];

    // if image is below viewport's bottom OR image is above viewport's top
    return y - scrollY > Viewport.height || y - scrollY + this._data.size[1] < 0 ? false : true;
  }

  _onImageLoaded() {
    // save image natural ratio
    this._data.resolution[0] = this.el.naturalWidth;
    this._data.resolution[1] = this.el.naturalHeight;

    // create texture if don't exists
    if( !this._texture ) {
      this._texture = this.gl.createTexture();

      // Set the parameters so we can render any size image.
      this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR); // turn off mipmaps
    }

    // bind texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);

    // upload texture to GPU
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.el);
  }

  // getter - setter
  get position() { return this._data.position; }
  get progress() { return this.scrollObj?.progress ?? 0; }
  get resolution() { return this._data.resolution; }
  get scale() { return this._data.scale; }
  get size() { return this._data.size; }
  get texture() { return this._texture; }
  get transformOrigin() { return this._data.transformOrigin; }
}



export default ScrollWebGL;
