const PLAYER_RADIUS = 5;
const PLAYER_SEGMENTS = 10;
const VERTEX_SIZE = 2;

export default class Player {
  constructor(gl, basicShader, x, y) {
    const vertices = new Float32Array(PLAYER_SEGMENTS * VERTEX_SIZE);

    let vertexIndex = 0;

    for (let i = 0; i < PLAYER_SEGMENTS; i++) {
      let angle = ((Math.PI * 2.0) / PLAYER_SEGMENTS) * i;

      vertices[vertexIndex++] = x + Math.cos(angle) * PLAYER_RADIUS;
      vertices[vertexIndex++] = y + Math.sin(angle) * PLAYER_RADIUS;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.shader = basicShader;
  }

  draw(gl, projection, view) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);
    gl.uniform4f(this.shader.color, 1.0, 0.0, 0.0, 1.0);

    gl.drawArrays(gl.LINE_LOOP, 0, PLAYER_SEGMENTS);
  }
}
