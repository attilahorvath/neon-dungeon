export default class Heart {
  constructor(heartCollection, x, y, scale) {
    this.x = x;
    this.y = y;
    this.heartCollection = heartCollection;

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
      game.player.collectHeart(game);
      this.collected = true;
    }
  }

  draw(gl, shader, filled) {
    if (this.collected) {
      return;
    }

    gl.uniformMatrix4fv(shader.model, false, this.model);

    if (filled) {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, this.heartCollection.HEART_SEGMENTS);
    } else {
      gl.drawArrays(gl.LINE_STRIP, 1, this.heartCollection.HEART_SEGMENTS - 1);
    }
  }
}
