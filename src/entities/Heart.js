export default class Heart {
  constructor(heartCollection, x, y) {
    this.x = x;
    this.y = y;
    this.heartCollection = heartCollection;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);
  }

  draw(gl, shader, filled) {
    gl.uniformMatrix4fv(shader.model, false, this.model);

    if (filled) {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, this.heartCollection.HEART_SEGMENTS);
    } else {
      gl.drawArrays(gl.LINE_STRIP, 1, this.heartCollection.HEART_SEGMENTS - 1);
    }
  }
}
