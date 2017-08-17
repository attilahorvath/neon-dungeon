const NUM_ROOMS = 10;
const NUM_LINES = 4;
const VERTICES_PER_LINE = 2;
const VERTICES_PER_ROOM = 4;
const VERTEX_SIZE = 2;

export default class Map {
  constructor(gl) {
    const vertices = new Float32Array(NUM_ROOMS * VERTICES_PER_ROOM *
                                      VERTEX_SIZE);
    const indices = new Uint16Array(NUM_ROOMS * NUM_LINES * VERTICES_PER_LINE);

    let verticesIndex = 0;
    let indicesIndex = 0;

    for (let i = 0; i < NUM_ROOMS; i++) {
      const x = Math.random() * 640.0;
      const y = Math.random() * 480.0;
      const w = 50.0 + Math.random() * 300.0;
      const h = 50.0 + Math.random() * 200.0;

      vertices[verticesIndex++] = x;
      vertices[verticesIndex++] = y;

      vertices[verticesIndex++] = x + w;
      vertices[verticesIndex++] = y;

      vertices[verticesIndex++] = x;
      vertices[verticesIndex++] = y + h;

      vertices[verticesIndex++] = x + w;
      vertices[verticesIndex++] = y + h;

      indices[indicesIndex++] = i * VERTICES_PER_ROOM;
      indices[indicesIndex++] = i * VERTICES_PER_ROOM + 1;

      indices[indicesIndex++] = i * VERTICES_PER_ROOM;
      indices[indicesIndex++] = i * VERTICES_PER_ROOM + 2;

      indices[indicesIndex++] = i * VERTICES_PER_ROOM + 1;
      indices[indicesIndex++] = i * VERTICES_PER_ROOM + 3;

      indices[indicesIndex++] = i * VERTICES_PER_ROOM + 2;
      indices[indicesIndex++] = i * VERTICES_PER_ROOM + 3;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  draw(gl, basicShader) {
    gl.uniform4f(basicShader.color, 0.0, 0.0, 1.0, 1.0);
    gl.drawElements(gl.LINES, NUM_ROOMS * NUM_LINES * VERTICES_PER_LINE,
                    gl.UNSIGNED_SHORT, 0);
  }
}
