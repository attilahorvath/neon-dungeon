import Heart from './Heart';

const HEART_SEGMENTS = 101;
const HEART_RADIUS = 10;

export default class HeartCollection {
  constructor(gl, shader, count) {
    this.HEART_SEGMENTS = HEART_SEGMENTS;

    const vertices = new Float32Array(HEART_SEGMENTS * shader.vertexSize);

    let vertexIndex = 0;

    vertices[vertexIndex++] = 0.0;
    vertices[vertexIndex++] = 0.0;

    for (let i = 0; i < (HEART_SEGMENTS - 1) / 2; i++) {
      const vertexX = -2.0 + i * (4.0 / ((HEART_SEGMENTS - 1) / 2 - 1));

      vertices[vertexIndex++] = vertexX * HEART_RADIUS;
      vertices[vertexIndex++] = -Math.sqrt(1.0 - (Math.abs(vertexX) - 1.0) *
        (Math.abs(vertexX) - 1.0)) * HEART_RADIUS;
    }

    for (let i = 0; i < (HEART_SEGMENTS - 1) / 2; i++) {
      const vertexX = -2.0 + i * (4.0 / ((HEART_SEGMENTS - 1) / 2 - 1));

      vertices[vertexIndex++] = -vertexX * HEART_RADIUS;
      vertices[vertexIndex++] = 3.0 * Math.sqrt(1.0 -
        (Math.sqrt(Math.abs(vertexX))) / Math.SQRT2) * HEART_RADIUS;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.hearts = [];

    for (let i = 0; i < count; i++) {
      this.hearts.push(new Heart(this, 30.0 + i * 50.0, 20.0));
    }
  }

  draw(gl, shader, lives, lastFlashing) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.view, false, this.view);
    gl.uniform4f(shader.color, 1.0, 0.0, 0.0, 1.0);

    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].draw(gl, shader, lives >= i + 1 ||
        (lastFlashing && i === lives));
    }
  }
}
