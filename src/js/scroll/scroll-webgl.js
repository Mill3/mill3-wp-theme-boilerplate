import * as THREE from 'three';

import { $$, body, rect } from "@utils/dom";
import Viewport from "@utils/viewport";

export const SELECTOR = "img[data-webgl]";

class ScrollWebGL {
  constructor(scroll) {
    this.scroll = scroll;
    this.images = null;

    let perspective = 1000;
    const fov = (180 * (2 * Math.atan(Viewport.height / 2 / perspective))) / Math.PI; // see fov image for a picture breakdown of this fov setting.

    this.camera = new THREE.PerspectiveCamera( fov, Viewport.width / Viewport.height, 1, 1000 );
    this.camera.position.set(0, 0, perspective); // set the camera position on the z axis.

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio( Viewport.devicePixelRatio );
    this.renderer.setSize( Viewport.width, Viewport.height );
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer.domElement.classList.add('position-fixed', 't-0', 'l-0', 'w-100', 'h-100', 'pointer-events-none');
    body.prepend( this.renderer.domElement );
  }

  init() {
    this.images = [ ...$$(SELECTOR) ].map(img => new GLImage(img, this.scene));
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

    this.images?.forEach(img => img.render(this.scroll.y, velocity));
    this.renderer.render( this.scene, this.camera );
  }
  resize() {
    this.renderer.setSize( Viewport.width, Viewport.height );
  }
  reset() {

  }
  cleanup() {
    // check for webgl images and remove data-scroll attributes
    [ ...$$(SELECTOR) ].forEach(img => img.removeAttribute('data-scroll'));
  }
}



class GLImage {
  constructor(el, scene) {
    this.el = el;
    this.scene = scene;
    
    this.bcr = null;
    this.offset = new THREE.Vector2(0, 0); // Positions of mesh on screen. Will be updated below.
    this.sizes = new THREE.Vector2(0, 0); //Size of mesh on screen. Will be updated below.

    this.init();
  }

  init() {
    this.updateBounds();
    this.updateSize();
    this.updateOffset();

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
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.render();

    this.scene.add(this.mesh);
    this.el.style.visibility = 'hidden';
  }
  render(y = 0, velocity = 0) {
    this.mesh.position.set(this.offset.x, this.offset.y + y, 0);
		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);

    this.material.uniforms.uOffset.value.set(0.0, velocity);
  }
  resize() {
    this.updateBounds();
  }

  updateBounds() {
    this.bcr = rect(this.el);
  }
  updateSize(){
    const { width, height } = rect(this.el);
    this.sizes.set(width, height);
  }
  updateOffset() {
    const { width, height, top, left } = this.bcr;
    this.offset.set(left - Viewport.width / 2 + width / 2, -top + Viewport.height / 2 - height / 2);
  }
}




const vertexShader = `
  uniform sampler2D uTexture;
  uniform vec2 uOffset;
  varying vec2 vUv;

  #define M_PI 3.1415926535897932384626433832795

  vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
    position.x = position.x + (sin(uv.y * M_PI) * offset.x);
    position.y = position.y + (sin(uv.x * M_PI) * offset.y);
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
