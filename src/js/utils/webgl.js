export const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) return shader;

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

export const createVertexShader = (gl, source) => createShader(gl, gl.VERTEX_SHADER, source);
export const createFragmentShader = (gl, source) => createShader(gl, gl.FRAGMENT_SHADER, source);

export const createProgram = (gl, vertexShader, fragmentShader) => {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

export const createRectangle = (gl, x, y, width, height, widthSegments = 1, heightSegments = 1) => {
  // normalize values
  width = Math.max(0, width);
  height = Math.max(0, height);
  widthSegments = Math.max(1, Math.floor(widthSegments));
  heightSegments = Math.max(1, Math.floor(heightSegments));

  const vertices = [];
  const columnWidth = width / widthSegments;
  const rowHeight = height / heightSegments;

  for(let rowIndex = 0; rowIndex < heightSegments; rowIndex++) {
    let y1 = y + rowIndex * rowHeight;
    let y2 = y1 + rowHeight;

    for(let columnIndex = 0; columnIndex < widthSegments; columnIndex++) {
      let x1 = x + columnIndex * columnWidth;
      let x2 = x1 + columnWidth;

      vertices.push(
        x1, y1, 
        x2, y1,
        x1, y2,

        x1, y2,
        x2, y1,
        x2, y2
      );
    }
  }

  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

export default {
  createShader,
  createVertexShader,
  createFragmentShader,
  createProgram,
  createRectangle,
};
