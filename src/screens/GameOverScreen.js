import HeartCollection from '../entities/HeartCollection';

export default class GameOverScreen {
  constructor(gl, shader) {
    this.heartCollection = new HeartCollection(gl, shader, 300.0, 330.0,
      3, 7.0);

    this.textTimer = 1800;
    this.showText = false;

    this.actionTimer = 2000;
  }

  update(deltaTime, game) {
    this.actionTimer -= deltaTime;

    if (game.input.wasJustReleased(game.input.ACTION) && this.actionTimer < 0) {
      game.reset();
      game.activeScreen = null;

      return;
    }

    this.textTimer -= deltaTime;

    if (this.textTimer <= 0) {
      this.textTimer = 800;
      this.showText = !this.showText;
    }
  }

  draw(gl, textContext, shader, projection, view) {
    shader.use(gl);

    gl.uniformMatrix4fv(shader.projection, false, projection);

    this.heartCollection.draw(gl, shader, null);

    textContext.fillText('GAME', 640, 50);
    textContext.fillText('OVER', 640, 100);

    if (this.showText) {
      textContext.fillText('PRESS SPACE TO TRY AGAIN', 640, 700);
    }
  }
}
