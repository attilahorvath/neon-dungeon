import Heart from '../Heart';

export default class CollectibleHeartCollection {
  constructor(game, count) {
    this.vertexBuffer = game.heartCollection.vertexBuffer;
    this.indexBuffer = game.heartCollection.indexBuffer;

    this.hearts = [];

    for (let i = 0; i < count; i++) {
      let room = null;

      do {
        room = game.map.root.getRandomLeaf();
      } while (room === game.startingRoom || room.containsHeart);

      this.hearts.push(new Heart(game.heartCollection,
        (room.roomX + 2 + Math.random() * (room.roomW - 4)) * 10,
        (room.roomY + 2 + Math.random() * (room.roomH - 4)) * 10,
        0.7));

      room.containsHeart = true;
    }
  }

  update(game) {
    for (const gem of this.hearts) {
      gem.update(game);
    }
  }

  draw(game) {
    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.vertexBuffer);
    game.gl.bindBuffer(game.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    game.basicShader.use(game.gl);

    game.gl.uniform4f(game.basicShader.color, 1.0, 0.0, 0.0, 1.0);

    for (const gem of this.hearts) {
      if (gem.x >= game.cameraX - 30 &&
        gem.x <= game.cameraX + game.canvas.width + 30 &&
        gem.y >= game.cameraY - 30 &&
        gem.y <= game.cameraY + game.canvas.height + 30) {
        gem.draw(game.gl, game.basicShader, true);
      }
    }
  }
}
