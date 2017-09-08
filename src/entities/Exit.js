export default class Exit {
  constructor(game) {
    const vertices = new Float32Array([
      -15.0, -5.0,
      -15.0, -15.0,
      15.0, -15.0,
      15.0, 15.0,
      -15.0, 15.0,
      -15.0, 5.0,

      -20.0, 0.0,
      0.0, 0.0,
      -5.0, -5.0,
      -5.0, 5.0
    ]);

    const indices = new Uint16Array([
      0, 1,
      1, 2,
      2, 3,
      3, 4,
      4, 5,

      6, 7,
      7, 8,
      7, 9
    ]);

    this.vertexBuffer = game.gl.createBuffer();
    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.vertexBuffer);
    game.gl.bufferData(game.gl.ARRAY_BUFFER, vertices, game.gl.STATIC_DRAW);

    this.indexBuffer = game.gl.createBuffer();
    game.gl.bindBuffer(game.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    game.gl.bufferData(game.gl.ELEMENT_ARRAY_BUFFER, indices,
      game.gl.STATIC_DRAW);

    let room = null;

    do {
      room = game.map.root.getRandomLeaf();
    } while (room === game.startingRoom || room.containsExit);

    this.x = (room.roomX + 2 + Math.random() * (room.roomW - 4)) * 10;
    this.y = (room.roomY + 2 + Math.random() * (room.roomH - 4)) * 10;

    room.containsExit = true;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      this.x, this.y, 0.0, 1.0
    ]);
  }

  update(game) {
    const distX = game.player.x - this.x;
    const distY = game.player.y - this.y;

    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist <= 20.0) {
      game.player.touchExit(game);
    }
  }

  draw(gl, shader) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.model, false, this.model);
    gl.uniform4f(shader.color, 1.0, 1.0, 0.0, 1.0);

    gl.drawElements(gl.LINES, 16, gl.UNSIGNED_SHORT, 0);
  }
}
