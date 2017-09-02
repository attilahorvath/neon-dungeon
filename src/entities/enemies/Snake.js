const SNAKE_SEGMENTS = 24;
const SNAKE_WIDTH = 30;
const SNAKE_HEIGHT = 10;
const SNAKE_SPEED = 0.02;

export default class Snake {
  constructor(gl, basicShader, x, y) {
    this.vertices = new Float32Array(SNAKE_SEGMENTS * basicShader.vertexSize);

    this.vertexBuffer = gl.createBuffer();

    this.shader = basicShader;

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

    this.phase = 0;
    this.alive = true;
    this.charging = false;
  }

  update(deltaTime, game) {
    if (!this.alive) {
      return;
    }

    const gl = game.gl;

    this.phase += deltaTime * (this.charging ? 0.07 : 0.01);

    if (this.phase > Math.PI * 2.0) {
      this.phase -= Math.PI * 2.0;
    }

    let vertexIndex = 0;

    for (let i = 0; i < SNAKE_SEGMENTS - 4; i++) {
      const snakeX = ((SNAKE_WIDTH - 10.0) / (SNAKE_SEGMENTS - 4.0)) * i -
        SNAKE_WIDTH;
      this.vertices[vertexIndex++] = snakeX;
      this.vertices[vertexIndex++] = Math.sin(i + this.phase) *
        (SNAKE_HEIGHT / 2.0);
    }

    this.vertices[vertexIndex++] = -5.0;
    this.vertices[vertexIndex++] = SNAKE_HEIGHT / 2.0;
    this.vertices[vertexIndex++] = 0.0;
    this.vertices[vertexIndex++] = 0.0;
    this.vertices[vertexIndex++] = -5.0;
    this.vertices[vertexIndex++] = -SNAKE_HEIGHT / 2.0;
    this.vertices[vertexIndex++] = this.vertices[vertexIndex - 9];
    this.vertices[vertexIndex++] = this.vertices[vertexIndex - 9];

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    let speed = SNAKE_SPEED;

    const distX = game.player.x - this.x;
    const distY = game.player.y - this.y;

    const dist = Math.sqrt(distX * distX + distY * distY);

    const dirX = distX / dist;
    const dirY = distY / dist;

    if (dist < 10.0) {
      game.player.damage(game, dirX, dirY);
    }

    this.charging = dist > 10.0 && dist < 150.0 &&
      game.map.getWallDistance(this.x, this.y, dirX, dirY) >= dist;

    if (this.charging) {
      this.angle = Math.atan2(distY, distX);
      speed *= 7.0;
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

      this.x += Math.cos(this.angle) * SNAKE_WIDTH;
      this.y += Math.sin(this.angle) * SNAKE_WIDTH;
    }

    this.model[0] = Math.cos(this.angle);
    this.model[1] = Math.sin(this.angle);
    this.model[4] = -Math.sin(this.angle);
    this.model[5] = Math.cos(this.angle);

    this.model[12] = this.x;
    this.model[13] = this.y;
  }

  draw(gl, projection, view) {
    if (!this.alive) {
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);

    if (this.charging) {
      gl.uniform4f(this.shader.color, 1.0, 0.0, 1.0, 1.0);
    } else {
      gl.uniform4f(this.shader.color, 0.0, 1.0, 0.0, 1.0);
    }

    gl.drawArrays(gl.LINE_STRIP, 0, SNAKE_SEGMENTS);
  }
}
