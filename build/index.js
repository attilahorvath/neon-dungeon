(function () {
'use strict';

const MIN_SIZE = 5;
const MIN_ROOM_OFFSET = 1;
const MIN_ROOM_SIZE = 3;

class MapNode {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  isLeaf() {
    return !this.childA && !this.childB;
  }

  split() {
    if (!this.isLeaf() || this.w < MIN_SIZE * 2 || this.h < MIN_SIZE * 2) {
      this.createRoom();
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
    let size = Math.round(MIN_SIZE + Math.random() * (this.h - MIN_SIZE * 2));

    this.childA = new MapNode(this.x, this.y, this.w, size);
    this.childB = new MapNode(this.x, this.y + size, this.w, this.h - size);
  }

  splitVertically() {
    let size = Math.round(MIN_SIZE + Math.random() * (this.w - MIN_SIZE * 2));

    this.childA = new MapNode(this.x, this.y, size, this.h);
    this.childB = new MapNode(this.x + size, this.y, this.w - size, this.h);
  }

  createRoom() {
    this.roomW = Math.round(MIN_ROOM_SIZE + Math.random() *
      (this.w - 2 * MIN_ROOM_OFFSET - MIN_ROOM_SIZE));
    this.roomH = Math.round(MIN_ROOM_SIZE + Math.random() *
      (this.h - 2 * MIN_ROOM_OFFSET - MIN_ROOM_SIZE));
    this.roomX = Math.round(this.x + MIN_ROOM_OFFSET + Math.random() *
      (this.w - this.roomW - 2 * MIN_ROOM_OFFSET));
    this.roomY = Math.round(this.y + MIN_ROOM_OFFSET + Math.random() *
      (this.h - this.roomH - 2 * MIN_ROOM_OFFSET));
  }

  leafCount() {
    if (this.isLeaf()) {
      return 1;
    }

    return this.childA.leafCount() + this.childB.leafCount();
  }

  visitLeaves(f) {
    if (this.isLeaf()) {
      return f(this);
    }

    this.childA.visitLeaves(f);
    this.childB.visitLeaves(f);
  }

  visitLeafPairs(f) {
    if (this.isLeaf()) {
      return this;
    }

    let leafA = this.childA.visitLeafPairs(f);
    let leafB = this.childB.visitLeafPairs(f);

    f(leafA, leafB);

    return Math.random() < 0.5 ? leafA : leafB;
  }
}

var vertexShaderSource = "uniform mediump mat4 projection;attribute vec2 vertexPosition;attribute vec2 vertexTexCoord;varying highp vec2 texCoord;void main(){gl_Position=projection*vec4(vertexPosition,0.0,1.0);texCoord=vertexTexCoord;}";

var fragmentShaderSource = "precision highp float;const float tolerance=0.2;uniform sampler2D sampler;uniform mediump vec4 color;uniform mediump vec2 texSize;varying highp vec2 texCoord;void main(){float left=step(tolerance,texture2D(sampler,vec2(texCoord.x-1.0/texSize.x,texCoord.y)).a);float right=step(tolerance,texture2D(sampler,vec2(texCoord.x+1.0/texSize.x,texCoord.y)).a);float top=step(tolerance,texture2D(sampler,vec2(texCoord.x,texCoord.y-1.0/texSize.y)).a);float bottom=step(tolerance,texture2D(sampler,vec2(texCoord.x,texCoord.y+1.0/texSize.y)).a);float current=step(tolerance,texture2D(sampler,vec2(texCoord.x,texCoord.y)).a);float p=((1.0-left)+(1.0-right)+(1.0-top)+(1.0-bottom))*current;gl_FragColor=color*p;}";

class MapShader {
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

    this.vertexPosition = gl.getAttribLocation(this.program, 'vertexPosition');
    gl.enableVertexAttribArray(this.vertexPosition);

    this.vertexTexCoord = gl.getAttribLocation(this.program, 'vertexTexCoord');
    gl.enableVertexAttribArray(this.vertexTexCoord);

    this.projection = gl.getUniformLocation(this.program, 'projection');
    this.sampler = gl.getUniformLocation(this.program, 'sampler');
    this.color = gl.getUniformLocation(this.program, 'color');
    this.texSize = gl.getUniformLocation(this.program, 'texSize');
  }

  use(gl) {
    gl.useProgram(this.program);
    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.vertexTexCoord, 2, gl.FLOAT, false, 16, 8);
  }
}

const TILE_SIZE = 10;
const MAP_WIDTH = 640 / TILE_SIZE;
const MAP_HEIGHT = 480 / TILE_SIZE;

class Map {
  constructor(gl) {
    this.root = new MapNode(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.root.split();

    this.grid = new Uint8Array(MAP_WIDTH * MAP_HEIGHT);

    const vertices = new Float32Array([
      0, 0, 0, 0,
      639, 0, 1, 0,
      0, 479, 0, 1,
      639, 479, 1, 1
    ]);

    const indices = new Uint16Array([
      0, 2, 1,
      1, 2, 3
    ]);

    this.root.visitLeaves(leaf => {
      for (let y = leaf.roomY; y < leaf.roomY + leaf.roomH; y++) {
        for (let x = leaf.roomX; x < leaf.roomX + leaf.roomW; x++) {
          this.grid[y * MAP_WIDTH + x] = 0xFF;
        }
      }
    });

    this.root.visitLeafPairs((leafA, leafB) => {
      let aCenterX = Math.floor(leafA.roomX + leafA.roomW / 2);
      let aCenterY = Math.floor(leafA.roomY + leafA.roomH / 2);
      let bCenterX = Math.floor(leafB.roomX + leafB.roomW / 2);
      let bCenterY = Math.floor(leafB.roomY + leafB.roomH / 2);

      for (let y = aCenterY; y != bCenterY;
        y += Math.sign(bCenterY - aCenterY)) {
        this.grid[y * MAP_WIDTH + aCenterX] = 0xFF;
      }

      for (let x = aCenterX; x != bCenterX;
        x += Math.sign(bCenterX - aCenterX)) {
        this.grid[bCenterY * MAP_WIDTH + x] = 0xFF;
      }
    });

    this.texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, MAP_WIDTH, MAP_HEIGHT, 0,
      gl.ALPHA, gl.UNSIGNED_BYTE, this.grid);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    this.shader = new MapShader(gl);
  }

  draw(gl, projection) {
    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniform4f(this.shader.color, 0.0, 0.0, 1.0, 1.0);
    gl.uniform1i(this.shader.sampler, 0);
    gl.uniform2f(this.shader.texSize, 640.0, 480.0);

    gl.drawElements(gl.TRIANGLES, 6,
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

    this.map = new Map(this.gl);
  }

  update() {}

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection);
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
