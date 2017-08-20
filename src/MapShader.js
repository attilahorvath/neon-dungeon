import vertexShaderSource from '../shaders/map.vert';
import fragmentShaderSource from '../shaders/map.frag';
import Shader from './Shader';

export default class MapShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'sampler', 'color', 'quadSize'];
    const attributes = ['vertexPosition', 'vertexTexCoord'];

    super(gl, vertexShaderSource, fragmentShaderSource, uniforms, attributes);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.vertexTexCoord, 2, gl.FLOAT, false, 16, 8);
  }
}
