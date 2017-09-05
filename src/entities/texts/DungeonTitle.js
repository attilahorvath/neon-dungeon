export default class DungeonTitle {
  constructor(gl, x, y) {
    const vertices = new Float32Array([
      0.0, 0.0,
      0.0, 200.0,
      70.0, 100.0,
      70.0, 200.0,

      100.0, 0.0,
      100.0, 200.0,
      170.0, 200.0,
      170.0, 0.0,

      200.0, 0.0,
      200.0, 200.0,
      270.0, 0.0,
      270.0, 200.0,

      300.0, 0.0,
      370.0, 0.0,
      300.0, 200.0,
      370.0, 200.0,
      370.0, 100.0,
      330.0, 100.0,

      400.0, 0.0,
      470.0, 0.0,
      400.0, 200.0,
      470.0, 200.0,
      400.0, 100.0,
      470.0, 100.0,

      500.0, 0.0,
      570.0, 0.0,
      500.0, 200.0,
      570.0, 200.0,

      600.0, 0.0,
      600.0, 200.0,
      670.0, 0.0,
      670.0, 200.0
    ]);

    this.indices = new Uint16Array([
      0, 1,
      0, 2,
      2, 3,
      3, 1,

      4, 5,
      5, 6,
      6, 7,

      8, 9,
      8, 11,
      10, 11,

      12, 13,
      12, 14,
      14, 15,
      15, 16,
      16, 17,

      18, 19,
      18, 20,
      20, 21,
      22, 23,

      24, 25,
      24, 26,
      25, 27,
      26, 27,

      28, 29,
      28, 31,
      30, 31
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
    this.alpha = 0.0;
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime;
    this.alpha = this.elapsedTime / 4000.0;
  }

  draw(gl, shader, projection, view) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.projection, false, projection);
    gl.uniformMatrix4fv(shader.view, false, this.view);
    gl.uniformMatrix4fv(shader.model, false, this.model);

    gl.uniform4f(shader.color, 1.0, 1.0, 1.0, this.alpha);

    gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
