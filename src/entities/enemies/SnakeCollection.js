import Snake from './Snake';

const SNAKE_SEGMENTS = 24;
const SNAKE_WIDTH = 30;
const SNAKE_HEIGHT = 10;

export default class SnakeCollection {
  constructor(game, count) {
    this.SNAKE_SEGMENTS = SNAKE_SEGMENTS;
    this.SNAKE_WIDTH = SNAKE_WIDTH;
    this.SNAKE_HEIGHT = SNAKE_HEIGHT;

    this.vertices = new Float32Array(this.SNAKE_SEGMENTS * 2 *
      game.basicShader.vertexSize);

    this.vertexBuffer = game.gl.createBuffer();

    this.snakes = [];

    for (let i = 0; i < count; i++) {
      let room = null;

      do {
        room = game.map.root.getRandomLeaf();
      } while (room === game.startingRoom || room.snakes > 6);

      this.snakes.push(new Snake(this,
        (room.roomX + 1 + Math.random() * (room.roomW - 2)) * 10,
        (room.roomY + 1 + Math.random() * (room.roomH - 2)) * 10));

      room.snakes++;
    }

    this.phase = 0;
    this.chargingPhase = 0;
  }

  update(deltaTime, game) {
    const gl = game.gl;

    this.phase += deltaTime * 0.01;
    this.chargingPhase += deltaTime * 0.06;

    if (this.phase > Math.PI * 2.0) {
      this.phase -= Math.PI * 2.0;
    }

    if (this.chargingPhase > Math.PI * 2.0) {
      this.chargingPhase -= Math.PI * 2.0;
    }

    this.vertexIndex = 0;

    this.generateVertices(this.phase);
    this.generateVertices(this.chargingPhase);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    for (const snake of this.snakes) {
      snake.update(deltaTime, game);
    }
  }

  generateVertices(phase) {
    for (let i = 0; i < SNAKE_SEGMENTS - 4; i++) {
      const snakeX = ((SNAKE_WIDTH - 10.0) / (SNAKE_SEGMENTS - 4.0)) * i -
        SNAKE_WIDTH;
      this.vertices[this.vertexIndex++] = snakeX;
      this.vertices[this.vertexIndex++] = Math.sin(i + phase) *
        (SNAKE_HEIGHT / 2.0);
    }

    this.vertices[this.vertexIndex++] = -5.0;
    this.vertices[this.vertexIndex++] = SNAKE_HEIGHT / 2.0;
    this.vertices[this.vertexIndex++] = 0.0;
    this.vertices[this.vertexIndex++] = 0.0;
    this.vertices[this.vertexIndex++] = -5.0;
    this.vertices[this.vertexIndex++] = -SNAKE_HEIGHT / 2.0;
    this.vertices[this.vertexIndex++] = this.vertices[this.vertexIndex - 9];
    this.vertices[this.vertexIndex++] = this.vertices[this.vertexIndex - 9];
  }

  draw(game) {
    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.vertexBuffer);

    game.basicShader.use(game.gl);

    for (const snake of this.snakes) {
      if (snake.x >= game.cameraX - 30 &&
        snake.x <= game.cameraX + game.canvas.width + 30 &&
        snake.y >= game.cameraY - 30 &&
        snake.y <= game.cameraY + game.canvas.height + 30) {
        snake.draw(game.gl, game.basicShader);
      }
    }
  }
}
