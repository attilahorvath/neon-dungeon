export default class Gem {
  constructor(x, y, scale) {
    this.x = x;
    this.y = y;

    this.model = new Float32Array([
      scale, 0.0, 0.0, 0.0,
      0.0, scale, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);

    this.collected = false;
  }

  update(game) {
    if (this.collected) {
      return;
    }

    const distX = game.player.x - this.x;
    const distY = game.player.y - this.y;

    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist <= 20.0) {
      game.player.collectGem(game);
      this.collected = true;
    }
  }

  draw(gl, shader, filled) {
    if (this.collected) {
      return;
    }

    gl.uniformMatrix4fv(shader.model, false, this.model);

    if (filled) {
      gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawElements(gl.LINES, 30, gl.UNSIGNED_SHORT,
        Uint16Array.BYTES_PER_ELEMENT * 24);
    }
  }
}
