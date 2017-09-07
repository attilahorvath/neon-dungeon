import NeonTitle from '../entities/texts/NeonTitle';
import DungeonTitle from '../entities/texts/DungeonTitle';

export default class TitleScreen {
  constructor(gl) {
    this.neonTitle = new NeonTitle(gl, 200.0, 20.0);
    this.dungeonTitle = new DungeonTitle(gl, 300.0, 400.0);

    this.textTimer = 4800;
    this.showText = false;
  }

  update(deltaTime, game) {
    if (game.input.wasJustReleased(game.input.ACTION)) {
      game.activeScreen = null;

      return;
    }

    this.neonTitle.update(deltaTime, game);
    this.dungeonTitle.update(deltaTime);

    this.textTimer -= deltaTime;

    if (this.textTimer <= 0) {
      this.textTimer = 800;
      this.showText = !this.showText;
    }
  }

  draw(gl, textContext, shader, projection, view) {
    this.neonTitle.draw(gl, projection, view);
    this.dungeonTitle.draw(gl, shader, projection, view);

    if (this.showText) {
      textContext.fillText('PRESS SPACE TO BEGIN', 640, 700);
    }
  }
}
