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

const NUM_ROOMS = 10;
const NUM_LINES = 4;
const VERTICES_PER_LINE = 2;
const VERTICES_PER_ROOM = 4;
const VERTEX_SIZE = 2;

class Map {
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
