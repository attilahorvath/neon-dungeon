import vertexShaderSource from '../shaders/map.vert.glsl';
import fragmentShaderSource from '../shaders/map.frag.glsl';

export default class MapShader {
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
    gl.enableVertexAttribArray(this.vertexPosition);

    this.vertexTexCoord = gl.getAttribLocation(this.program, 'vertexTexCoord');
    gl.enableVertexAttribArray(this.vertexTexCoord);

    this.projection = gl.getUniformLocation(this.program, 'projection');
    this.sampler = gl.getUniformLocation(this.program, 'sampler');
    this.color = gl.getUniformLocation(this.program, 'color');
    this.texSize = gl.getUniformLocation(this.program, 'texSize');
  }

  use(gl) {
    gl.useProgram(this.program);
    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.vertexTexCoord, 2, gl.FLOAT, false, 16, 8);
  }
}
