export default class Shader {
  constructor(gl, vertexShaderSource, fragmentShaderSource, uniforms,
    attributes, vertexSize) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    for (const uniform of uniforms) {
      this[uniform] = gl.getUniformLocation(this.program, uniform);
    }

    this.attributes = attributes;

    for (const attribute of this.attributes) {
      this[attribute] = gl.getAttribLocation(this.program, attribute);
    }

    this.vertexSize = vertexSize;
  }

  use(gl) {
    gl.useProgram(this.program);

    for (const attribute of this.attributes) {
      gl.enableVertexAttribArray(this[attribute]);
    }
  }
}
