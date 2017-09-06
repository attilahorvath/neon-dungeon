const SNAKE_SPEED = 0.02;

export default class Snake {
  constructor(snakeCollection, x, y) {
    this.snakeCollection = snakeCollection;
    this.x = x;
    this.y = y;

    this.angle = Math.random() * 2.0 * Math.PI;
    this.angleChange = -0.0005 + Math.random() * 0.001;

    this.model = new Float32Array([
      Math.cos(this.angle), Math.sin(this.angle), 0.0, 0.0,
      -Math.sin(this.angle), Math.cos(this.angle), 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);

    this.alive = true;
    this.charging = false;
    this.chargingTimer = 500;
  }

  update(deltaTime, game) {
    if (!this.alive) {
      return;
    }

    let speed = SNAKE_SPEED;

    const distX = game.player.x - this.x;
    const distY = game.player.y - this.y;

    const dist = Math.sqrt(distX * distX + distY * distY);

    const dirX = distX / dist;
    const dirY = distY / dist;

    if (dist < 7.0) {
      game.player.damage(game, dirX, dirY);
    }

    if (dist > 10.0 && dist < 150.0 &&
      game.map.getWallDistance(this.x, this.y, dirX, dirY) >= dist) {
      this.chargingTimer -= deltaTime;
    } else {
      this.chargingTimer = 500;
    }

    this.charging = this.chargingTimer <= 0;

    if (this.charging) {
      this.angle = Math.atan2(distY, distX);
      speed *= 6.0;
    } else {
      this.angle += deltaTime * 0.0001;
    }

    const newX = this.x + Math.cos(this.angle) * deltaTime * speed;
    const newY = this.y + Math.sin(this.angle) * deltaTime * speed;

    if (game.map.tileAt(newX, newY) === 0xFF) {
      this.x = newX;
      this.y = newY;
    } else {
      this.angle = this.angle - Math.PI;
      this.angleChange = -0.0005 + Math.random() * 0.001;

      this.x += Math.cos(this.angle) * this.snakeCollection.SNAKE_WIDTH;
      this.y += Math.sin(this.angle) * this.snakeCollection.SNAKE_WIDTH;
    }

    this.model[0] = Math.cos(this.angle);
    this.model[1] = Math.sin(this.angle);
    this.model[4] = -Math.sin(this.angle);
    this.model[5] = Math.cos(this.angle);

    this.model[12] = this.x;
    this.model[13] = this.y;
  }

  draw(gl, shader) {
    if (!this.alive) {
      return;
    }

    gl.uniformMatrix4fv(shader.model, false, this.model);

    if (this.charging) {
      gl.uniform4f(shader.color, 1.0, 0.0, 1.0, 1.0);
      gl.drawArrays(gl.LINE_STRIP, this.snakeCollection.SNAKE_SEGMENTS,
        this.snakeCollection.SNAKE_SEGMENTS);
    } else {
      gl.uniform4f(shader.color, 0.0, 1.0, 0.0, 1.0);
      gl.drawArrays(gl.LINE_STRIP, 0, this.snakeCollection.SNAKE_SEGMENTS);
    }
  }
}
