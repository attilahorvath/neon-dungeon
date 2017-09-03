const LIGHT_CONE_SEGMENTS = 256;
const LIGHT_CONE_RADIUS = 196;

export default class LightCone {
  constructor(gl, basicShader) {
    this.baseVertices = new Float32Array(LIGHT_CONE_SEGMENTS *
      basicShader.vertexSize);

    this.baseVertexBuffer = gl.createBuffer();

    this.magnifiedVertices = new Float32Array(LIGHT_CONE_SEGMENTS *
      basicShader.vertexSize);

    this.magnifiedVertexBuffer = gl.createBuffer();

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

      this.baseVertices[vertexIndex] = dirX * distance;
      this.magnifiedVertices[vertexIndex] = dirX * (distance + 5.0);
      vertexIndex++;

      this.baseVertices[vertexIndex] = dirY * distance;
      this.magnifiedVertices[vertexIndex] = dirY * (distance + 5.0);
      vertexIndex++;
    }

    const gl = game.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.baseVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.baseVertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.magnifiedVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.magnifiedVertices, gl.STATIC_DRAW);
  }

  draw(gl, projection, view, magnified) {
    gl.bindBuffer(gl.ARRAY_BUFFER, (magnified ? this.magnifiedVertexBuffer
      : this.baseVertexBuffer));

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);
    gl.uniform4f(this.shader.color, 0.7, 0.7, 0.7, 1.0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, LIGHT_CONE_SEGMENTS);
  }
}
