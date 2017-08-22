const LIGHT_CONE_SEGMENTS = 128;
const LIGHT_CONE_RADIUS = 128;

export default class LightCone {
  constructor(gl, basicShader) {
    this.vertices = new Float32Array(LIGHT_CONE_SEGMENTS * 2);

    this.vertexBuffer = gl.createBuffer();

    this.shader = basicShader;

    this.x = 0;
    this.y = 0;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      this.x, this.y, 0.0, 1.0
    ]);
  }

  update(deltaTime, game) {
    if (game.player.x === this.x && game.player.y === this.y) {
      return;
    }

    this.x = game.player.x;
    this.y = game.player.y;

    this.model[12] = this.x;
    this.model[13] = this.y;

    let vertexIndex = 2;

    for (let i = 0; i < LIGHT_CONE_SEGMENTS - 1; i++) {
      const angle = ((Math.PI * 2.0) / (LIGHT_CONE_SEGMENTS - 2)) * i;

      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      const distance = Math.min(
        game.map.getWallDistance(this.x, this.y, dirX, dirY),
        LIGHT_CONE_RADIUS);

      this.vertices[vertexIndex++] = dirX * distance;
      this.vertices[vertexIndex++] = dirY * distance;
    }

    const gl = game.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  draw(gl, projection, view) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);
    gl.uniform4f(this.shader.color, 1.0, 1.0, 0.0, 1.0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, LIGHT_CONE_SEGMENTS);
  }
}
