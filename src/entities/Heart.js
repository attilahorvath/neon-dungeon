const HEART_SEGMENTS = 101;
const HEART_RADIUS = 10;

export default class Heart {
  constructor(gl, basicShader, x, y) {
    const vertices = new Float32Array(HEART_SEGMENTS * basicShader.vertexSize);

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

    this.shader = basicShader;

    this.x = x;
    this.y = y;

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);
  }

  draw(gl, projection, view, filled) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, this.view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);
    gl.uniform4f(this.shader.color, 1.0, 0.0, 0.0, 1.0);

    if (filled) {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, HEART_SEGMENTS);
    } else {
      gl.drawArrays(gl.LINE_STRIP, 1, HEART_SEGMENTS - 1);
    }
  }
}
