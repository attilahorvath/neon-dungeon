import ParticleShader from './shaders/ParticleShader';

const MAX_PARTICLES = 512;

export default class ParticleSystem {
  constructor(gl) {
    this.shader = new ParticleShader(gl);

    this.particles = new Float32Array(MAX_PARTICLES * this.shader.vertexSize);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particles, gl.STATIC_DRAW);

    this.nextParticle = 0;
    this.particleCount = 0;

    this.elapsedTime = 0;
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime;
  }

  emit(gl, x, y, dx, dy, r, g, b) {
    this.nextParticle = (this.nextParticle + 1) % MAX_PARTICLES;
    this.particleCount = (this.particleCount + 1) % MAX_PARTICLES;

    let vertexIndex = this.nextParticle * this.shader.vertexSize;

    this.particles[vertexIndex++] = x;
    this.particles[vertexIndex++] = y;
    this.particles[vertexIndex++] = dx;
    this.particles[vertexIndex++] = dy;
    this.particles[vertexIndex++] = this.elapsedTime;
    this.particles[vertexIndex++] = r;
    this.particles[vertexIndex++] = g;
    this.particles[vertexIndex++] = b;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particles, gl.STATIC_DRAW);
  }

  draw(gl, projection, view) {
    if (this.particleCount <= 0) {
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);

    gl.uniform1f(this.shader.elapsedTime, this.elapsedTime);

    gl.drawArrays(gl.POINTS, 0, this.particleCount);
  }
}
