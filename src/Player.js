const PLAYER_RADIUS = 5;
const PLAYER_SEGMENTS = 10;
const VERTEX_SIZE = 2;

export default class Player {
  constructor(gl, basicShader, x, y) {
    const vertices = new Float32Array(PLAYER_SEGMENTS * VERTEX_SIZE);

    let vertexIndex = 0;

    for (let i = 0; i < PLAYER_SEGMENTS; i++) {
      let angle = ((Math.PI * 2.0) / PLAYER_SEGMENTS) * i;

      vertices[vertexIndex++] = Math.cos(angle) * PLAYER_RADIUS;
      vertices[vertexIndex++] = Math.sin(angle) * PLAYER_RADIUS;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.shader = basicShader;

    this.x = x;
    this.y = y;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);
  }

  update(deltaTime, game) {
    if (game.up && game.map.tileAt(this.x, this.y - PLAYER_RADIUS -
      deltaTime * 0.1) == 0xFF) {
      this.y -= deltaTime * 0.1;
    }

    if (game.down && game.map.tileAt(this.x, this.y + PLAYER_RADIUS +
      deltaTime * 0.1) == 0xFF) {
      this.y += deltaTime * 0.1;
    }

    if (game.left && game.map.tileAt(this.x - PLAYER_RADIUS -
      deltaTime * 0.1, this.y) == 0xFF) {
      this.x -= deltaTime * 0.1;
    }

    if (game.right && game.map.tileAt(this.x + PLAYER_RADIUS +
      deltaTime * 0.1, this.y) == 0xFF) {
      this.x += deltaTime * 0.1;
    }

    this.model[12] = this.x;
    this.model[13] = this.y;
  }

  draw(gl, projection, view) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);
    gl.uniform4f(this.shader.color, 1.0, 0.0, 0.0, 1.0);

    gl.drawArrays(gl.LINE_LOOP, 0, PLAYER_SEGMENTS);
  }
}
