import vertexShaderSource from '../../shaders/alpha.vert';
import fragmentShaderSource from '../../shaders/alpha.frag';
import Shader from './Shader';

export default class ColorShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'model', 'color'];
    const attributes = ['vertexPosition', 'vertexAlpha'];

    super(gl, vertexShaderSource, fragmentShaderSource, uniforms, attributes,
      6);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 12, 0);
    gl.vertexAttribPointer(this.vertexAlpha, 1, gl.FLOAT, false, 12, 8);
  }
}
