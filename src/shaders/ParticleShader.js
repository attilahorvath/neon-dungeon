import vertexShaderSource from '../../shaders/particle.vert';
import fragmentShaderSource from '../../shaders/particle.frag';
import Shader from './Shader';

export default class ParticleShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'elapsedTime'];
    const attributes = ['particlePosition', 'particleVelocity',
      'particleEmitted', 'particleColor'];

    super(gl, vertexShaderSource, fragmentShaderSource, uniforms, attributes,
      8);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.particlePosition, 2, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(this.particleVelocity, 2, gl.FLOAT, false, 32, 8);
    gl.vertexAttribPointer(this.particleEmitted, 1, gl.FLOAT, false, 32, 16);
    gl.vertexAttribPointer(this.particleColor, 3, gl.FLOAT, false, 32, 20);
  }
}
