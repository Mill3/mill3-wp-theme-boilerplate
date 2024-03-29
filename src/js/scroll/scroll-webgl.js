import * as THREE from 'three';

import { $$, html, body, rect } from "@utils/dom";
import { radToDegree } from "@utils/math";
import Viewport from "@utils/viewport";

export const SELECTOR = "img[data-webgl]";
const PERSPECTIVE = 1000;

class ScrollWebGL {
  constructor(scroll) {
    this.scroll = scroll;
    this.images = null;

    this.camera = new THREE.PerspectiveCamera( getCameraFOV(), getCameraAspect(), 1, 1000 );
    this.camera.position.set(0, 0, PERSPECTIVE);

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio( Viewport.devicePixelRatio );
    this.renderer.setSize( Viewport.width, Viewport.height );
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer.domElement.classList.add('position-fixed', 't-0', 'l-0', 'w-100', 'h-100', 'pointer-events-none');
    body.prepend( this.renderer.domElement );
    html.classList.add('has-scroll-webgl');
  }

  init($target = body) {
    this.images = [ ...$$(SELECTOR, $target) ].map(img => new GLImage(img, this.scene));
    this.resize();
  }
  start() {
    if( this._started ) return;
    this._started = true;
  }
  stop() {
    if( !this._started ) return;
    this._started = false;
  }

  raf() {
    if( !this._started ) return;

    const velocity = this.scroll.velocity * 0.00008;
    const magic_number = this.camera.fov * this.camera.aspect * 0.039116933943734396;

    this.images?.forEach(img => img.render(this.scroll.y, velocity, magic_number));
    this.renderer.render( this.scene, this.camera );
  }
  resize() {
    this.camera.fov = getCameraFOV(); // readjust fov.
    this.camera.aspect = getCameraAspect(); // readjust aspect ratio.
    this.camera.updateProjectionMatrix(); // Used to recalulate projection dimensions.

    this.images?.forEach(img => img.resize(this.scroll.y));
    this.renderer.setSize( Viewport.width, Viewport.height );
  }
  reset() {}
}



class GLImage {
  constructor(el, scene) {
    this.el = el;
    this.scene = scene;
    
    this._bcr = { width: 0, height: 0, top: 0, left: 0 }; // Boundaries of image.
    this._offset = new THREE.Vector2(0, 0); // Positions of mesh on screen.
    this._sizes = new THREE.Vector2(0, 0); // Size of mesh on screen.
    this._visible = true;

    this.init();
  }

  init() {
    // remove data-scroll attributes
    this.el.removeAttribute('data-scroll');

    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100);
    this.texture  = new THREE.TextureLoader().load(this.el.src);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTexture: { value: this.texture }, //texture data
        uOffset: { value: new THREE.Vector2(0.0, 0.0) }, //distortion strength
        uAlpha: { value: 1 } //opacity
      },
      transparent: false,
      wireframe: false,
      //side: THREE.DoubleSide,
      side: THREE.FrontSide,
    });

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.visible = this._visible;

    this.scene.add(this.mesh);
  }
  render(y = 0, velocity = 0, magic_number = 1) {
    const position = this._offset.y + y;

    //const half_height = this.sizes.y / 2;
    //const hvh = Viewport.height / 2;
    //const safezone = 100; // safety area around image (in pixels)

    //const magic_number = 5.10273973; // viewport: 1920 x 890 (including vertical scrollbar)
    //const magic_number = 4.93333333; // viewport: 1536 x 712 (including vertical scrollbar) (80% of 1920x890)

    //const magic_number = 3.06818182; // viewport: 1455 x 890 (including vertical scrollbar)
    //const magic_number = 4.64; // viewport: 1455 x 700 (including vertical scrollbar)
    //const magic_number = 12.74509804; // viewport: 1920 x 700 (including vertical scrollbar)

    //const top = (hvh - half_height) * magic_number + safezone;
    //const bottom = (hvh * -1 + half_height) * magic_number - safezone;
    //const isInView = position > bottom && position < top;

    //console.log(position, isInView, magic_number);
    //console.log(hvh, this.sizes.y, position, isInView);

    //this.mesh.visible = isInView;

    //if( isInView ) {
      this.mesh.position.set(this._offset.x, position, 0);
      this.material.uniforms.uOffset.value.set(0.0, velocity);
    //}
  }
  resize(y = 0) {
    const { width, height, top, left } = rect(this.el);

    // update boundaries
    this._bcr.width = width;
    this._bcr.height = height;
    this._bcr.left = left;
    this._bcr.top = top + y;

    // update size
    this._sizes.set(width, height);
		this.mesh.scale.set(this._sizes.x, this._sizes.y, 1);

    // update offset
    this._offset.set(this._bcr.left - Viewport.width / 2 + this._bcr.width / 2, -this._bcr.top + Viewport.height / 2 - this._bcr.height / 2);
  }

  // getter - setter
  get box() { return this.mesh; }

  get visible() { return this._visible; }
  set visible(value) {
    if( this._visible === value ) return;
    this._visible = value;

    this.mesh.visible = value;
  }
}


// utilities
const getCameraFOV = () => {
  // see fov image for a picture breakdown of this fov setting.
  return radToDegree(2 * Math.atan(Viewport.height / 2 / PERSPECTIVE));
};
const getCameraAspect = () => {
  return Viewport.width / Viewport.height;
};


const vertexShader = `
  uniform sampler2D uTexture;
  uniform vec2 uOffset;
  varying vec2 vUv;

  #define M_PI 3.1415926535897932384626433832795

  vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
    position.x = position.x + (sin(uv.y * M_PI) * offset.x);
    position.y = position.y + (sin(uv.x * M_PI) * offset.y * 1.5);
    return position;
  }

  void main() {
    vUv = uv;
    vec3 newPosition = deformationCurve(position, uv, uOffset);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  }
`;
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uAlpha;
  uniform vec2 uOffset;
  varying vec2 vUv;

  vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
    float r = texture2D(textureImage,uv + offset).r;
    vec2 gb = texture2D(textureImage,uv).gb;
    return vec3(r,gb);
  }

  void main() {
    vec3 color = rgbShift(uTexture,vUv,uOffset);
    gl_FragColor = vec4(color,uAlpha);
  }
`;



export default ScrollWebGL;
