import vertexShaderSource from '../shaders/basic.vert.glsl';
import fragmentShaderSource from '../shaders/basic.frag.glsl';

export default class BasicShader {
  constructor(gl) {
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

    this.position = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(this.position);

    this.projection = gl.getUniformLocation(this.program, 'projection');
    this.color = gl.getUniformLocation(this.program, 'color');
  }

  use(gl) {
    gl.useProgram(this.program);
    gl.vertexAttribPointer(this.positon, 2, gl.FLOAT, false, 0, 0);
  }
}
