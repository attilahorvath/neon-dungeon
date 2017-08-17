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
const NUM_VERTICES = 2;
const VERTEX_SIZE = 2;
const ROOM_SIZE = NUM_LINES * NUM_VERTICES * VERTEX_SIZE;

class Map {
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

class Game {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.gl = this.canvas.getContext('webgl');

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.projection = new Float32Array([
      2.0 / 640.0, 0.0, 0.0, 0.0,
      0.0, -2.0 / 480.0, 0.0, 0.0,
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
