import BasicShader from './BasicShader';
import Map from './Map';
import Player from './Player';

export default class Game {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.gl = this.canvas.getContext('webgl');

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.projection = new Float32Array([
      2.0 / 639.0, 0.0, 0.0, 0.0,
      0.0, -2.0 / 479.0, 0.0, 0.0,
      0.0, 0.0, -1.0, 0.0,
      -1.0, 1.0, 0.0, 1.0
    ]);

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.basicShader = new BasicShader(this.gl);
    this.map = new Map(this.gl);

    let leaf = this.map.root.getRandomLeaf();

    this.player = new Player(this.gl, this.basicShader,
      (leaf.roomX + leaf.roomW / 2) * 10, (leaf.roomY + leaf.roomH / 2) * 10);

    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;

    this.lastTimestamp = performance.now();
  }

  update(timestamp) {
    let deltaTime = timestamp - this.lastTimestamp;

    if (this.up) {
      this.view[13] += deltaTime * 0.1;
    }

    if (this.down) {
      this.view[13] -= deltaTime * 0.1;
    }

    if (this.left) {
      this.view[12] += deltaTime * 0.1;
    }

    if (this.right) {
      this.view[12] -= deltaTime * 0.1;
    }

    this.lastTimestamp = timestamp;
  }

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection, this.view);
    this.player.draw(this.gl, this.projection, this.view);
  }
}
