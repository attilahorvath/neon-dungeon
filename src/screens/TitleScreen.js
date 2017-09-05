import NeonTitle from '../entities/texts/NeonTitle';
import DungeonTitle from '../entities/texts/DungeonTitle';

export default class TitleScreen {
  constructor(gl) {
    this.neonTitle = new NeonTitle(gl, 200.0, 20.0);
    this.dungeonTitle = new DungeonTitle(gl, 280.0, 400.0);
  }

  update(deltaTime, game) {
    if (game.input.wasJustReleased(game.input.ACTION)) {
      game.activeScreen = null;

      return;
    }

    this.neonTitle.update(deltaTime);
    this.dungeonTitle.update(deltaTime);
  }

  draw(gl, shader, projection, view) {
    this.neonTitle.draw(gl, projection, view);
    this.dungeonTitle.draw(gl, shader, projection, view);
  }
}
