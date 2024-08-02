import { $, $$, html, body, rect } from "@utils/dom";
import { cover, limit } from "@utils/math";
import Viewport from "@utils/viewport";
import { createVertexShader, createFragmentShader, createProgram } from "@utils/webgl";

export const SELECTOR = "img[data-webgl]";
const PERSPECTIVE = 1000;

class ScrollWebGL {
  constructor(scroll) {
    this.scroll = scroll;
    this.canvas = $('.site-webgl', body);
    this.gl = this.canvas ? this.canvas.getContext('webgl') : null;
    this.images = null;

    this._data = { width: 0, height: 0, dpi: Viewport.devicePixelRatio };

    if( this.gl ) {
      this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

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
  }
  stop() {
    if( !this.gl || !this._started ) return;
    this._started = false;
  }

  raf() {
    if( !this.gl || !this._started ) return;

    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Render each images
    const imagesRendered = this.images?.reduce((total, img) => total + (img.render(this.scroll.y) ? 1 : 0), 0);

    // show how many images are rendered in this frame (only during development)
    //if( process.env.NODE_ENV === "development" ) console.log(`images rendered: ${imagesRendered}`);
  }
  resize() {
    if( !this.gl ) return;

    const { dpi } = this._data;
    let { width, height } = rect(this.canvas);
    const resolution = { width, height };

    // save width / height
    this._data.width = width;
    this._data.height = height;

    width = width * dpi;
    height = height * dpi;

    // resize canvas
    this.canvas.width = width;
    this.canvas.height = height;

    // resize webgl context
    this.gl.viewport(0, 0, width, height);
    
    // resize each images
    this.images?.forEach(img => img.resize(this.scroll.y, resolution));
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
}



class GLImage {
  constructor(el, gl) {
    this.el = el;
    this.gl = gl;
    
    this._data = {
      width: 0, height: 0, top: 0, left: 0, 
      resolutionX: 0, resolutionY: 0, 
      ratio: 0, 
      clipX: 0.0, clipY: 0.0, clipW: 1.0, clipH: 1.0
    };
    this._texture = null;
    this._cover = this.el.classList.contains('image-as-background');

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
      clipping: this.gl.getUniformLocation(this._program, "u_clipping"),
      //offset: this.gl.getUniformLocation(this._program, "u_offset"),
    };

    this.init();
  }

  init() {
    // remove data-scroll attributes
    this.el.removeAttribute('data-scroll');

    // bind position buffer & create a rectangle
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers.position);
    this._createRectangle(0, 0, 1, 1);

    // bind texture coordinates buffer & create a rectangle of texture coordinates
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers.texture);
    this._createRectangle(0, 0, 1, 1);

    if( this.el.complete ) this._onImageLoaded();
  }
  destroy() {
    if( this.gl ) {
      if( this._texture ) this.gl.deleteTexture(this._texture);
      if( this._program ) this.gl.deleteProgram(this._program);
      if( this._vertexShader ) this.gl.deleteShader(this._vertexShader);
      if( this._fragmentShader ) this.gl.deleteShader(this._fragmentShader);
      if( this._attributes.position ) this.gl.disableVertexAttribArray(this._attributes.position);
      if( this._attributes.texture ) this.gl.disableVertexAttribArray(this._attributes.texture);
      if( this._buffers.position ) this.gl.deleteBuffer(this._buffers.position); 
      if( this._buffers.texture ) this.gl.deleteBuffer(this._buffers.texture);
    }

    this.el = null;
    this.gl = null;

    this._data = null;
    this._texture = null;
    this._cover = null;

    this._vertexShader = null;
    this._fragmentShader = null;
    this._program = null;
    this._attributes = null;
    this._buffers = null;
    this._uniforms = null;
  }
  render(scrollY = 0) {
    const { width, height, top, left, resolutionX, resolutionY, clipX, clipY, clipW, clipH } = this._data;

    // if image isn't in viewport, stop here
    if( !this._isInViewport(scrollY) ) return false;

    //const center = top - scrollY + height * 0.5;
    //const hvh = Viewport.height * 0.5;
    //const dist = hvh - center;
    //const offset = limit(-1, 1, dist / (hvh + height * 0.5)) * 0.05;

    // Tell it to use our program (pair of shaders)
    this.gl.useProgram(this._program);

    // Turn on and bind position attribute
    this.gl.enableVertexAttribArray(this._attributes.position);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers.position);

    // Tell the attribute how to get data out of position's buffer (ARRAY_BUFFER)
    this.gl.vertexAttribPointer(this._attributes.position, 2, this.gl.FLOAT, false, 0, 0);

    // Turn on and bind the texture attribute
    this.gl.enableVertexAttribArray(this._attributes.texture);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers.texture);

    // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    this.gl.vertexAttribPointer(this._attributes.texture, 2, this.gl.FLOAT, false, 0, 0);

    // set texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);

    // Set uniforms
    this.gl.uniform2f(this._uniforms.resolution, resolutionX, resolutionY);
    this.gl.uniform2f(this._uniforms.translate, left, top - scrollY);
    this.gl.uniform2f(this._uniforms.size, width, height);
    this.gl.uniform4f(this._uniforms.clipping, clipX, clipY, clipW, clipH);
    //this.gl.uniform2f(this._uniforms.offset, 0.0, offset);

    // Draw image
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    return true;
  }
  resize(scrollY = 0, resolution = {width: 0, height: 0}) {
    const { width, height, top, left } = rect(this.el);

    // update boundaries
    this._data.width = width;
    this._data.height = height;
    this._data.left = left;
    this._data.top = top + scrollY;

    // update resolution
    this._data.resolutionX = resolution.width;
    this._data.resolutionY = resolution.height;

    // update clipping
    if( this._cover ) {
      const clipping = cover(width, height, this._data.ratio);

      this._data.clipX = clipping.x / width * -1;
      this._data.clipY = clipping.y / height * -1;
      this._data.clipW = width / clipping.width;
      this._data.clipH = height / clipping.height;
    }
  }

  _onImageLoaded() {
    // save image natural ratio
    this._data.ratio = this.el.naturalWidth / this.el.naturalHeight;

    // create texture if don't exists
    if( !this._texture ) {
      this._texture = this.gl.createTexture();

      // Set the parameters so we can render any size video.
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
  _createRectangle(x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER, 
      new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
      ]
    ), this.gl.STATIC_DRAW);
  }
  _isInViewport(scrollY) {
    const { top, height } = this._data;

    // if image is below viewport's bottom OR image is above viewport's top
    return top - scrollY > Viewport.height || top - scrollY + height < 0 ? false : true;
  }
}


const VERTEX_SHADER = `
  // an attribute will receive data from a buffer
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform vec2 u_resolution;
  uniform vec2 u_size;
  uniform vec2 u_translate;
  uniform vec4 u_clipping;
  //uniform vec2 uOffset;

  varying vec2 v_texCoord;

  // all shaders have a main function
  void main() {
    // resolution to [0, 1]
    vec2 zeroToOne = a_position * u_size / u_resolution + u_translate / u_resolution;

    // convert from [0, 1] to [-1, 1]
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points
    v_texCoord = vec2(
      a_texCoord.x * u_clipping.z + u_clipping.x,
      a_texCoord.y * u_clipping.w + u_clipping.y
    );
  }
`;
const FRAGMENT_SHADER = `
  // fragment shaders don't have a default precision so we need to pick one. mediump is a good default
  precision mediump float;

  uniform sampler2D u_image;
  //uniform vec2 u_offset;

  varying vec2 v_texCoord; // the texCoords passed in from the vertex shader.

  //vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
  //  float r = texture2D(textureImage, uv + offset).r;
  //  vec2 gb = texture2D(textureImage, uv).gb;
  //  return vec3(r, gb);
  //}

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
    //gl_FragColor = vec4(rgbShift(u_image, v_texCoord, u_offset), 1.0);
  }
`;



export default ScrollWebGL;
