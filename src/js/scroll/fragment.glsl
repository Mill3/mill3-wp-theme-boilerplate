// fragment shaders don't have a default precision so we need to pick one. mediump is a good default
precision mediump float;

uniform sampler2D u_image;
uniform float u_opacity;
uniform float u_progress;
uniform float u_time;
uniform vec2 u_size;
uniform vec2 u_scale;
uniform vec2 u_transformOrigin;
uniform vec2 u_textureResolution;

// project specifics uniforms
//uniform float u_myCustomUniform;

varying vec2 v_uv;

/*
vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
  float r = texture2D(textureImage, uv + offset).r;
  vec2 gb = texture2D(textureImage, uv).gb;

  return vec3(r, gb);
}
*/

vec2 resizeUvCover(vec2 uv, vec2 size, vec2 resolution, vec2 origin, vec2 scale) {
    vec2 ratio = vec2(
        min((resolution.x / resolution.y) / (size.x / size.y), 1.0) * scale.x,
        min((resolution.y / resolution.x) / (size.y / size.x), 1.0) * scale.y
    );

    return vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * origin.x,
        uv.y * ratio.y + (1.0 - ratio.y) * origin.y
    );
}

vec3 desaturate(vec3 color, float factor) {
	vec3 lum = vec3(0.299, 0.587, 0.114);
	vec3 gray = vec3(dot(lum, color));

	return mix(color, gray, factor);
}

void main() {
  // we need to invert scale to make this work width resizeUvCover (2.0 => 0.5)
  vec2 scale = 1.0 / vec2(u_scale + u_progress * 0.5);

  // object-fit: cover;
  vec2 uv = resizeUvCover(v_uv, u_textureResolution, u_size, u_transformOrigin, scale);

  // distortion effect
  //uv.x += sin(v_uv.y * 10.0 * u_progress) / 100.0;

  // map progress [0.0, 0.3] => [1.0, 0.0]
  float bottomGrayscale = 1.0 - smoothstep(0.0, 0.3, u_progress);
  // map progress [0.7, 1.0] => [0.0, 1.0]
  float topGrayscale = smoothstep(0.7, 1.0, u_progress);
  // add both grayscale factor
  float grayscale = bottomGrayscale + topGrayscale;

  //vec3 color = texture2D(u_image, uv).rgb;
  //vec3 color = rgbShift(u_image, uv, vec2(0.0, u_progress * 0.2));
  vec3 color = desaturate(texture2D(u_image, uv).rgb, grayscale);

  //
  gl_FragColor = vec4(color, u_opacity);


  // WIREFRAME (for debugging purpose)
  //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
