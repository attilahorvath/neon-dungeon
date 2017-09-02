import Input from './Input';
import BasicShader from './shaders/BasicShader';
import Map from './entities/Map';
import Player from './entities/Player';
import LightCone from './entities/LightCone';
import SnakeCollection from './entities/enemies/SnakeCollection';
import PostProcessor from './PostProcessor';

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

const NUM_SNAKES = 75;

export default class Game {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;
    document.body.appendChild(this.canvas);

    this.gl = this.canvas.getContext('webgl');
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.BLEND);

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

    this.startingRoom = this.map.root.getRandomLeaf();

    this.player = new Player(this.gl, this.basicShader,
      (this.startingRoom.roomX + this.startingRoom.roomW / 2) * 10,
      (this.startingRoom.roomY + this.startingRoom.roomH / 2) * 10);

    this.snakeCollection = new SnakeCollection(this, NUM_SNAKES);

    this.lightCone = new LightCone(this.gl, this.basicShader);

    this.postProcessor = new PostProcessor(this.gl, this.canvas.width,
      this.canvas.height);

    this.lastTimestamp = performance.now();

    this.shakeTimer = 0;

    this.frames = 0;
    this.frameTimer = 0;
  }

  update(timestamp) {
    const deltaTime = timestamp - this.lastTimestamp;

    this.input.update();

    this.player.update(deltaTime, this);
    this.lightCone.update(deltaTime, this);

    this.snakeCollection.update(deltaTime, this);

    this.cameraX = this.player.x - this.canvas.width / 2.0;
    this.cameraY = this.player.y - this.canvas.height / 2.0;

    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;

      this.cameraX += -4.0 + Math.random() * 8.0;
      this.cameraY += -4.0 + Math.random() * 8.0;
    }

    this.view[12] = -this.cameraX;
    this.view[13] = -this.cameraY;

    this.lastTimestamp = timestamp;

    this.frames++;
    this.frameTimer += deltaTime;

    if (this.frameTimer > 1000) {
      console.log(`FPS: ${this.frames}`);
      this.frames = 0;
      this.frameTimer -= 1000;
    }
  }

  shake(duration) {
    this.shakeTimer = duration;
  }

  draw() {
    this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,
      this.postProcessor.framebuffer);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection, this.view, true);

    this.basicShader.use(this.gl);

    this.gl.uniformMatrix4fv(this.basicShader.projection, false,
      this.projection);
    this.gl.uniformMatrix4fv(this.basicShader.view, false, this.view);

    this.snakeCollection.draw(this);
    this.player.draw(this.gl, this.basicShader);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection, this.view, false);
    this.lightCone.draw(this.gl, this.projection, this.view);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.postProcessor.draw(this.gl);
  }
}
