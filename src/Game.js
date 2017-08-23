import Input from './Input';
import BasicShader from './shaders/BasicShader';
import Map from './entities/Map';
import Player from './entities/Player';
import LightCone from './entities/LightCone';

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

export default class Game {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;
    document.body.appendChild(this.canvas);

    this.gl = this.canvas.getContext('webgl');
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.projection = new Float32Array([
      2.0 / (this.canvas.width - 1.0), 0.0, 0.0, 0.0,
      0.0, -2.0 / (this.canvas.height - 1.0), 0.0, 0.0,
      0.0, 0.0, -1.0, 0.0,
      -1.0, 1.0, 0.0, 1.0
    ]);

    this.cameraX = 0.0;
    this.cameraY = 0.0;

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      -this.cameraX, -this.cameraY, 0.0, 1.0
    ]);

    this.input = new Input();

    this.basicShader = new BasicShader(this.gl);
    this.map = new Map(this.gl, this.canvas.width * 4, this.canvas.height * 4);

    const leaf = this.map.root.getRandomLeaf();

    this.player = new Player(this.gl, this.basicShader,
      (leaf.roomX + leaf.roomW / 2) * 10, (leaf.roomY + leaf.roomH / 2) * 10);

    this.lightCone = new LightCone(this.gl, this.basicShader);

    this.lastTimestamp = performance.now();
  }

  update(timestamp) {
    const deltaTime = timestamp - this.lastTimestamp;

    this.input.update();

    this.player.update(deltaTime, this);
    this.lightCone.update(deltaTime, this);

    this.cameraX = this.player.x - this.canvas.width / 2.0;
    this.cameraY = this.player.y - this.canvas.height / 2.0;

    this.view[12] = -this.cameraX;
    this.view[13] = -this.cameraY;

    this.lastTimestamp = timestamp;
  }

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection, this.view);
    this.lightCone.draw(this.gl, this.projection, this.view);
    this.player.draw(this.gl, this.projection, this.view);
  }
}
