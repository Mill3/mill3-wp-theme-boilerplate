precision mediump float;

// an attribute will receive data from a buffer
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform vec2 u_size;
uniform vec2 u_translate;
uniform float u_progress;

varying vec2 v_uv;

void main() {
  // resolution to [0, 1]
  vec2 zeroToOne = a_position * u_size / u_resolution + u_translate / u_resolution;

  // bubble distortion
  float vDist = 1.0 - smoothstep(0.0, 0.5, distance(a_position.y, u_progress));
  float hDirection = sign(a_position.x - 0.5); // polarity [-1.0, 0.0 or 1.0]
  zeroToOne.x += 0.02 * pow(vDist, 2.0) * hDirection;

  // convert from [0, 1] to [-1, 1]
  vec2 clipSpace = zeroToOne * 2.0 - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // pass varyings to fragment shader
  v_uv = a_texCoord;
}
