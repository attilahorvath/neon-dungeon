import TitleShader from '../../shaders/TitleShader';

export default class NeonTitle {
  constructor(gl, x, y) {
    this.shader = new TitleShader(gl);

    const vertices = new Float32Array([
      0.0, 300.0, 0.0, 0.0, 1.0, 0.0 / 4.0,
      0.0, 0.0, 0.0, 0.0, 1.0, 0.33 / 4.0,
      150.0, 300.0, 0.0, 0.0, 1.0, 0.66 / 4.0,
      150.0, 0.0, 0.0, 0.0, 1.0, 1.0 / 4.0,

      390.0, 0.0, 1.0, 0.0, 1.0, 0.25 + 0.0 / 4.0,
      210.0, 0.0, 1.0, 0.0, 1.0, 0.25 + 0.25 / 4.0,
      210.0, 300.0, 1.0, 0.0, 1.0, 0.25 + 0.5 / 4.0,
      390.0, 300.0, 1.0, 0.0, 1.0, 0.25 + 0.75 / 4.0,
      210.0, 150.0, 1.0, 0.0, 1.0, 0.25 + 0.75 / 4.0,
      390.0, 150.0, 1.0, 0.0, 1.0, 0.25 + 1.0 / 4.0,

      450.0, 0.0, 1.0, 1.0, 0.0, 0.5 + 0.0 / 4.0,
      450.0, 300.0, 1.0, 1.0, 0.0, 0.5 + 0.25 / 4.0,
      600.0, 300.0, 1.0, 1.0, 0.0, 0.5 + 0.5 / 4.0,
      600.0, 0.0, 1.0, 1.0, 0.0, 0.5 + 0.75 / 4.0,
      450.0, 0.0, 1.0, 1.0, 0.0, 0.5 + 1.0 / 4.0,

      660.0, 300.0, 1.0, 0.0, 0.0, 0.75 + 0.0 / 4.0,
      660.0, 0.0, 1.0, 0.0, 0.0, 0.75 + 0.33 / 4.0,
      810.0, 300.0, 1.0, 0.0, 0.0, 0.75 + 0.66 / 4.0,
      810.0, 0.0, 1.0, 0.0, 0.0, 0.75 + 1.0 / 4.0
    ]);

    this.indices = new Uint16Array([
      0, 1,
      1, 2,
      2, 3,

      4, 5,
      5, 6,
      6, 7,
      8, 9,

      10, 11,
      11, 12,
      12, 13,
      13, 14,

      15, 16,
      16, 17,
      17, 18
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.x = x;
    this.y = y;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      this.x, this.y, 0.0, 1.0
    ]);

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.elapsedTime = 0;
    this.maxAlpha = 1.0;
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime;
    this.maxAlpha = this.elapsedTime / 4000.0;
  }

  draw(gl, projection, view) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, this.view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);

    gl.uniform1f(this.shader.maxAlpha, this.maxAlpha);

    gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
