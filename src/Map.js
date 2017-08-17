const NUM_ROOMS = 10;
const NUM_LINES = 4;
const NUM_VERTICES = 2;
const VERTEX_SIZE = 2;
const ROOM_SIZE = NUM_LINES * NUM_VERTICES * VERTEX_SIZE;

export default class Map {
  constructor(gl) {
    const vertices = new Float32Array(NUM_ROOMS * ROOM_SIZE);

    for (let i = 0; i < NUM_ROOMS; i++) {
      const x = Math.random() * 640.0;
      const y = Math.random() * 480.0;
      const w = 50.0 + Math.random() * 300.0;
      const h = 50.0 + Math.random() * 200.0;

      vertices[i * ROOM_SIZE] = x;
      vertices[i * ROOM_SIZE + 1] = y;
      vertices[i * ROOM_SIZE + 2] = x + w;
      vertices[i * ROOM_SIZE + 3] = y;

      vertices[i * ROOM_SIZE + 4] = x;
      vertices[i * ROOM_SIZE + 5] = y;
      vertices[i * ROOM_SIZE + 6] = x;
      vertices[i * ROOM_SIZE + 7] = y + h;

      vertices[i * ROOM_SIZE + 8] = x + w;
      vertices[i * ROOM_SIZE + 9] = y;
      vertices[i * ROOM_SIZE + 10] = x + w;
      vertices[i * ROOM_SIZE + 11] = y + h;

      vertices[i * ROOM_SIZE + 12] = x;
      vertices[i * ROOM_SIZE + 13] = y + h;
      vertices[i * ROOM_SIZE + 14] = x + w;
      vertices[i * ROOM_SIZE + 15] = y + h;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  draw(gl, basicShader) {
    gl.uniform4f(basicShader.color, 0.0, 0.0, 1.0, 1.0);
    gl.drawArrays(gl.LINES, 0, NUM_ROOMS * NUM_LINES * NUM_VERTICES);
  }
}
