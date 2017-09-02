export default class Sword {
  constructor(gl, shader, player) {
    const vertices = new Float32Array(4 * shader.vertexSize);

    let vertexIndex = 0;

    vertices[vertexIndex++] = 5.0;
    vertices[vertexIndex++] = 3.0;

    vertices[vertexIndex++] = 20.0;
    vertices[vertexIndex++] = 0.0;

    vertices[vertexIndex++] = 5.0;
    vertices[vertexIndex++] = -3.0;

    vertices[vertexIndex++] = 20.0;
    vertices[vertexIndex++] = 0.0;

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.x = player.x;
    this.y = player.y;

    this.angle = player.angle + Math.PI / 2.0;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      this.x, this.y, 0.0, 1.0
    ]);
  }

  update(deltaTime, game) {
    this.x = game.player.x;
    this.y = game.player.y;

    if (this.swingTimer > 0) {
      this.swingTimer -= deltaTime;

      this.angle = this.swingBaseAngle - ((150.0 - this.swingTimer) / 150.0) *
        Math.PI * 2.0;

      for (const snake of game.snakeCollection.snakes) {
        const dist1X = snake.x - this.x;
        const dist1Y = snake.y - this.y;

        const dist1 = Math.sqrt(dist1X * dist1X + dist1Y * dist1Y);

        const dist2X = snake.x - (this.x + Math.cos(this.angle) * 20.0);
        const dist2Y = snake.y - (this.y + Math.sin(this.angle) * 20.0);

        const dist2 = Math.sqrt(dist2X * dist2X + dist2Y * dist2Y);

        if (dist1 <= 25.0 && dist2 <= 25.0) {
          snake.alive = false;
        }
      }
    } else {
      this.angle = game.player.angle + Math.PI;
    }

    this.model[0] = Math.cos(this.angle);
    this.model[1] = Math.sin(this.angle);
    this.model[4] = -Math.sin(this.angle);
    this.model[5] = Math.cos(this.angle);

    this.model[12] = this.x;
    this.model[13] = this.y;
  }

  swing() {
    this.swingTimer = 150;
    this.swingBaseAngle = this.angle;
  }

  draw(gl, shader) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.model, false, this.model);
    gl.uniform4f(shader.color, 1.0, 0.0, 0.0, 1.0);

    gl.drawArrays(gl.LINES, 0, 4);
  }
}
