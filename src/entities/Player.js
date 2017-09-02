import HeartCollection from './HeartCollection';
import Sword from './weapons/Sword';

const PLAYER_RADIUS = 5;
const PLAYER_SEGMENTS = 10;
const PLAYER_SPEED = 0.2;
const PLAYER_LIVES = 3;

export default class Player {
  constructor(gl, shader, x, y) {
    const vertices = new Float32Array(PLAYER_SEGMENTS * shader.vertexSize);

    let vertexIndex = 0;

    for (let i = 0; i < PLAYER_SEGMENTS; i++) {
      const angle = ((Math.PI * 2.0) / PLAYER_SEGMENTS) * i;

      vertices[vertexIndex++] = Math.cos(angle) * PLAYER_RADIUS;
      vertices[vertexIndex++] = Math.sin(angle) * PLAYER_RADIUS;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.x = x;
    this.y = y;
    this.angle = 0.0;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);

    this.lives = PLAYER_LIVES;

    this.heartCollection = new HeartCollection(gl, shader, this.lives);

    this.invincibilityTimer = 0;
    this.flashTimer = 0;
    this.visible = true;

    this.slidingTimer = 0;
    this.slidingX = 0;
    this.slidingY = 0;

    this.sword = new Sword(gl, shader, this);
  }

  validPosition(map, x, y) {
    return map.tileAt(x - PLAYER_RADIUS, y) === 0xFF &&
      map.tileAt(x + PLAYER_RADIUS, y) === 0xFF &&
      map.tileAt(x, y - PLAYER_RADIUS) === 0xFF &&
      map.tileAt(x, y + PLAYER_RADIUS) === 0xFF;
  }

  update(deltaTime, game) {
    const distance = deltaTime * PLAYER_SPEED;

    let dirX = (game.input.isPressed(game.input.LEFT) ? -1 : 0) +
      (game.input.isPressed(game.input.RIGHT) ? 1 : 0);
    let dirY = (game.input.isPressed(game.input.UP) ? -1 : 0) +
      (game.input.isPressed(game.input.DOWN) ? 1 : 0);

    if (this.sword.swingTimer > 0) {
      dirX = dirY = 0;
    }

    if (dirX !== 0 && dirY !== 0) {
      dirX *= Math.SQRT2 / 2.0;
      dirY *= Math.SQRT2 / 2.0;
    }

    if (game.input.isPressed(game.input.LEFT) ||
      game.input.isPressed(game.input.RIGHT) ||
      game.input.isPressed(game.input.UP) ||
      game.input.isPressed(game.input.DOWN)) {
      this.angle = Math.atan2(dirY, dirX);
    }

    if (this.slidingTimer > 0) {
      this.slidingTimer -= deltaTime;

      dirX = this.slidingX;
      dirY = this.slidingY;
    }

    const newX = this.x + dirX * distance;
    const newY = this.y + dirY * distance;

    if (newX !== this.x && this.validPosition(game.map, newX, this.y)) {
      this.x = newX;
      this.model[12] = this.x;
    }

    if (newY !== this.y && this.validPosition(game.map, this.x, newY)) {
      this.y = newY;
      this.model[13] = this.y;
    }

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= deltaTime;

      if (this.flashTimer > 0) {
        this.flashTimer -= deltaTime;
      } else {
        this.flashTimer = 85;

        this.visible = !this.visible;
      }
    } else {
      this.visible = true;
    }

    if (game.input.wasJustPressed(game.input.ACTION)) {
      this.sword.swing();
    }

    this.sword.update(deltaTime, game);
  }

  damage(game, slidingX, slidingY) {
    if (this.invincibilityTimer > 0) {
      return;
    }

    this.lives -= 1;
    this.invincibilityTimer = 1000;

    this.slidingTimer = 500;
    this.slidingX = slidingX;
    this.slidingY = slidingY;

    game.shake(500);
  }

  draw(gl, shader) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.model, false, this.model);
    gl.uniform4f(shader.color, 1.0, 0.0, 0.0, 1.0);

    if (this.visible) {
      gl.drawArrays(gl.LINE_LOOP, 0, PLAYER_SEGMENTS);

      this.sword.draw(gl, shader);
    }

    this.heartCollection.draw(gl, shader, this.lives,
      this.invincibilityTimer > 0 && this.visible);
  }
}
