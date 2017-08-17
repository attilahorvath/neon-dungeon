(function () {
'use strict';

var vertexShaderSource = "uniform mediump mat4 projection;attribute vec2 position;void main(){gl_Position=projection*vec4(position,0.0,1.0);}";

var fragmentShaderSource = "uniform mediump vec4 color;void main(){gl_FragColor=color;}";

class BasicShader {
  constructor(gl) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    this.position = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(this.position);

    this.projection = gl.getUniformLocation(this.program, 'projection');
    this.color = gl.getUniformLocation(this.program, 'color');
  }

  use(gl) {
    gl.useProgram(this.program);
    gl.vertexAttribPointer(this.positon, 2, gl.FLOAT, false, 0, 0);
  }
}

const MIN_SIZE = 50;
const MIN_ROOM_OFFSET = 5;
const MIN_ROOM_SIZE = 30;

class MapNode {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  split() {
    if (this.childA || this.childB ||
        this.w <= MIN_SIZE * 2 || this.h <= MIN_SIZE * 2) {
      return false;
    }

    if (this.w / this.h <= 0.75) {
      this.splitHorizontally();
    } else if (this.h / this.w <= 0.75) {
      this.splitVertically();
    } else if (Math.random() < 0.5) {
      this.splitHorizontally();
    } else {
      this.splitVertically();
    }

    this.childA.split();
    this.childB.split();
  }

  splitHorizontally() {
    let size = MIN_SIZE + Math.random() * (this.h - MIN_SIZE * 2);

    this.childA = new MapNode(this.x, this.y, this.w, size);
    this.childB = new MapNode(this.x, this.y + size, this.w, this.h - size);
  }

  splitVertically() {
    let size = MIN_SIZE + Math.random() * (this.w - MIN_SIZE * 2);

    this.childA = new MapNode(this.x, this.y, size, this.h);
    this.childB = new MapNode(this.x + size, this.y, this.w - size, this.h);
  }

  createRooms() {
    this.visitLeaves(leaf => {
      leaf.roomW = MIN_ROOM_SIZE + Math.random() * (leaf.w - 2 * MIN_ROOM_OFFSET
                   - MIN_ROOM_SIZE);
      leaf.roomH = MIN_ROOM_SIZE + Math.random() * (leaf.h - 2 * MIN_ROOM_OFFSET
                   - MIN_ROOM_SIZE);
      leaf.roomX = leaf.x + MIN_ROOM_OFFSET + Math.random() * (leaf.w -
                   leaf.roomW - 2 * MIN_ROOM_OFFSET);
      leaf.roomY = leaf.y + MIN_ROOM_OFFSET + Math.random() * (leaf.h -
                   leaf.roomH - 2 * MIN_ROOM_OFFSET);
    });
  }

  leafCount() {
    if (!this.childA || !this.childB) {
      return 1;
    }

    return this.childA.leafCount() + this.childB.leafCount();
  }

  visitLeaves(f) {
    if (!this.childA || !this.childB) {
      return f(this);
    }

    this.childA.visitLeaves(f);
    this.childB.visitLeaves(f);
  }
}

const NUM_LINES = 4;
const VERTICES_PER_LINE = 2;
const VERTICES_PER_ROOM = 4;
const VERTEX_SIZE = 2;

class Map {
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

class Game {
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

    this.basicShader = new BasicShader(this.gl);
    this.map = new Map(this.gl);

    this.basicShader.use(this.gl);

    this.gl.uniformMatrix4fv(this.basicShader.projection, false, this.projection);
  }

  update(timestamp) {}

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.basicShader);
  }
}

const game = new Game;

const updateGame = timestamp => {
  requestAnimationFrame(updateGame);

  game.update(timestamp);
  game.draw();
};

requestAnimationFrame(updateGame);

}());
