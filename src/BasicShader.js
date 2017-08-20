import vertexShaderSource from '../shaders/basic.vert';
import fragmentShaderSource from '../shaders/basic.frag';

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

    this.vertexPosition = gl.getAttribLocation(this.program, 'vertexPosition');

    this.projection = gl.getUniformLocation(this.program, 'projection');
    this.view = gl.getUniformLocation(this.program, 'view');
    this.color = gl.getUniformLocation(this.program, 'color');
  }

  use(gl) {
    gl.useProgram(this.program);

    gl.enableVertexAttribArray(this.vertexPosition);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0);
  }
}
