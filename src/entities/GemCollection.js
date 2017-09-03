import Gem from './Gem';

export default class GemCollection {
  constructor(gl, shader, count) {
    const vertices = new Float32Array([
      -20.0, 0.0,
      -13.0, -11.0,
      -7.0, 0.0,
      0.0, -11.0,
      6.0, 0.0,
      13.0, -11.0,
      19.0, 0.0,
      0.0, 25.0
    ]);

    const indices = new Uint16Array([
      1, 0, 2,
      3, 1, 2,
      3, 2, 4,
      5, 3, 4,
      5, 4, 6,
      2, 0, 7,
      4, 2, 7,
      6, 4, 7,

      0, 1,
      1, 2,
      0, 2,
      1, 3,
      2, 3,
      2, 4,
      3, 5,
      3, 4,
      4, 5,
      5, 6,
      4, 6,
      0, 7,
      2, 7,
      4, 7,
      6, 7
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.gems = [];

    for (let i = 0; i < count; i++) {
      this.gems.push(new Gem(30.0 + i * 50.0, 80.0, 1.0));
    }
  }

  draw(gl, shader, player) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.view, false, this.view);
    gl.uniform4f(shader.color, 1.0, 0.0, 1.0, 1.0);

    const lastFlashing = player.gemTimer <= 0 || player.gemVisible;

    for (let i = 0; i < this.gems.length; i++) {
      this.gems[i].draw(gl, shader, player.gems > i + 1 ||
        (lastFlashing && i === player.gems - 1));
    }
  }
}
