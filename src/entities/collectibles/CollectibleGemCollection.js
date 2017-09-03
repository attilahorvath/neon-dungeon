import Gem from '../Gem';

export default class CollectibleGemCollection {
  constructor(game, count) {
    this.vertexBuffer = game.gemCollection.vertexBuffer;
    this.indexBuffer = game.gemCollection.indexBuffer;

    this.gems = [];

    for (let i = 0; i < count; i++) {
      let room = null;

      do {
        room = game.map.root.getRandomLeaf();
      } while (room === game.startingRoom || room.containsGem);

      this.gems.push(new Gem(
        (room.roomX + 1 + Math.random() * (room.roomW - 2)) * 10,
        (room.roomY + 1 + Math.random() * (room.roomH - 2)) * 10,
        0.7));

      room.containsGem = true;
    }
  }

  update(game) {
    for (const gem of this.gems) {
      gem.update(game);
    }
  }

  draw(game) {
    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.vertexBuffer);
    game.gl.bindBuffer(game.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    game.basicShader.use(game.gl);

    game.gl.uniform4f(game.basicShader.color, 1.0, 0.0, 1.0, 1.0);

    for (const gem of this.gems) {
      if (gem.x >= game.cameraX - 30 &&
        gem.x <= game.cameraX + game.canvas.width + 30 &&
        gem.y >= game.cameraY - 30 &&
        gem.y <= game.cameraY + game.canvas.height + 30) {
        gem.draw(game.gl, game.basicShader, false);
      }
    }
  }
}
