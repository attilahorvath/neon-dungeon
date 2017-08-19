import Map from './Map';

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

    this.map = new Map(this.gl);
  }

  update() {}

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection);
  }
}
