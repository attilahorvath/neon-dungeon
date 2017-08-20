import vertexShaderSource from '../shaders/basic.vert';
import fragmentShaderSource from '../shaders/basic.frag';
import Shader from './Shader';

export default class BasicShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'color'];
    const attributes = ['vertexPosition'];

    super(gl, vertexShaderSource, fragmentShaderSource, uniforms, attributes);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0);
  }
}
