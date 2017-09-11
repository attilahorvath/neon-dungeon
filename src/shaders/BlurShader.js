import vertexShaderSource from '../../shaders/blur.vert';
import fragmentShaderSource from '../../shaders/blur.frag';
import Shader from './Shader';

export default class BlurShader extends Shader {
  constructor(gl) {
    const uniforms = ['sampler', 'texSize', 'direction', 'radius'];
    const attributes = ['vertexPosition', 'vertexTexCoord'];

    super(gl, vertexShaderSource, fragmentShaderSource, uniforms, attributes,
      4);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.vertexTexCoord, 2, gl.FLOAT, false, 16, 8);
  }
}
