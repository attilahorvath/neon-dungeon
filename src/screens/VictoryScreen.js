import GemCollection from '../entities/GemCollection';

export default class VictoryScreen {
  constructor(gl, shader) {
    this.gemCollection = new GemCollection(gl, shader, 640.0, 330.0, 1, 12.0);

    this.particleTimer = 100 + Math.random() * 1000;

    this.actionTimer = 2000;
  }

  update(deltaTime, game) {
    this.actionTimer -= deltaTime;

    if (game.input.wasJustReleased(game.input.ACTION) && this.actionTimer < 0) {
      game.reset();
      game.activeScreen = null;

      return;
    }

    this.particleTimer -= deltaTime;

    if (this.particleTimer <= 0) {
      this.particleTimer = 100 + Math.random() * 1000;
      game.particleSystem.emitRandom(game.gl,
        Math.random() * 1280, Math.random() * 720, 0.01, 0.2,
        1.0, 0.0, 1.0, 50);
    }
  }

  draw(gl, textContext, shader, projection, view) {
    shader.use(gl);

    gl.uniformMatrix4fv(shader.projection, false, projection);

    this.gemCollection.draw(gl, shader, null);

    textContext.fillText('VICTORY!', 640, 50);
    textContext.fillText('THANKS FOR PLAYING!', 640, 700);
  }
}
