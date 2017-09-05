import vertexShaderSource from '../../shaders/title.vert';
import fragmentShaderSource from '../../shaders/title.frag';
import Shader from './Shader';

export default class TitleShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'model', 'maxAlpha'];
    const attributes = ['vertexPosition', 'vertexColor'];

    super(gl, vertexShaderSource, fragmentShaderSource, uniforms, attributes,
      6);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(this.vertexColor, 4, gl.FLOAT, false, 24, 8);
  }
}
