import MapNode from './MapNode';

const NUM_LINES = 4;
const VERTICES_PER_LINE = 2;
const VERTICES_PER_ROOM = 4;
const VERTEX_SIZE = 2;

export default class Map {
  constructor(gl) {
    this.root = new MapNode(0, 0, 640, 480);
    this.root.split();
    this.root.createRooms();

    this.leafCount = this.root.leafCount();

    const vertices = new Float32Array(this.leafCount * VERTICES_PER_ROOM *
                                      VERTEX_SIZE);
    const indices = new Uint16Array(this.leafCount * NUM_LINES *
                                    VERTICES_PER_LINE);

    let vbIndex = 0;
    let ibIndex = 0;
    let leafIndex = 0;

    this.root.visitLeaves(leaf => {
      vertices[vbIndex++] = leaf.roomX;
      vertices[vbIndex++] = leaf.roomY;

      vertices[vbIndex++] = leaf.roomX + leaf.roomW;
      vertices[vbIndex++] = leaf.roomY;

      vertices[vbIndex++] = leaf.roomX;
      vertices[vbIndex++] = leaf.roomY + leaf.roomH;

      vertices[vbIndex++] = leaf.roomX + leaf.roomW;
      vertices[vbIndex++] = leaf.roomY + leaf.roomH;

      indices[ibIndex++] = leafIndex * VERTICES_PER_ROOM;
      indices[ibIndex++] = leafIndex * VERTICES_PER_ROOM + 1;

      indices[ibIndex++] = leafIndex * VERTICES_PER_ROOM;
      indices[ibIndex++] = leafIndex * VERTICES_PER_ROOM + 2;

      indices[ibIndex++] = leafIndex * VERTICES_PER_ROOM + 1;
      indices[ibIndex++] = leafIndex * VERTICES_PER_ROOM + 3;

      indices[ibIndex++] = leafIndex * VERTICES_PER_ROOM + 2;
      indices[ibIndex++] = leafIndex * VERTICES_PER_ROOM + 3;

      leafIndex++;
    });

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  draw(gl, basicShader) {
    gl.uniform4f(basicShader.color, 0.0, 0.0, 1.0, 1.0);
    gl.drawElements(gl.LINES, this.leafCount * NUM_LINES * VERTICES_PER_LINE,
                    gl.UNSIGNED_SHORT, 0);
  }
}
