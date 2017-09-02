(function () {
'use strict';

class Input {
  constructor() {
    this.UP = 1;
    this.DOWN = 2;
    this.LEFT = 4;
    this.RIGHT = 8;

    this.pressed = 0;
    this.lastPressed = 0;

    this.justPressed = 0;
    this.justReleased = 0;
  }

  press(key) {
    this.pressed |= key;
  }

  release(key) {
    this.pressed &= ~key;
  }

  isPressed(key) {
    return (this.pressed & key) === key;
  }

  wasJustPressed(key) {
    return (this.justPressed & key) === key;
  }

  wasJustReleased(key) {
    return (this.justReleased & key) === key;
  }

  update() {
    this.justPressed = this.pressed & ~this.lastPressed;
    this.justReleased = this.lastPressed & ~this.pressed;

    this.lastPressed = this.pressed;
  }
}

var vertexShaderSource = "uniform mediump mat4 projection;uniform mediump mat4 view;uniform mediump mat4 model;attribute vec2 vertexPosition;void main(){gl_Position=projection*view*model*vec4(vertexPosition,0.0,1.0);}";

var fragmentShaderSource = "uniform mediump vec4 color;void main(){gl_FragColor=color;}";

class Shader {
  constructor(gl, vertexShaderSource, fragmentShaderSource, uniforms,
    attributes, vertexSize) {
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

    for (const uniform of uniforms) {
      this[uniform] = gl.getUniformLocation(this.program, uniform);
    }

    this.attributes = attributes;

    for (const attribute of this.attributes) {
      this[attribute] = gl.getAttribLocation(this.program, attribute);
    }

    this.vertexSize = vertexSize;
  }

  use(gl) {
    gl.useProgram(this.program);

    for (const attribute of this.attributes) {
      gl.enableVertexAttribArray(this[attribute]);
    }
  }
}

class BasicShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'model', 'color'];
    const attributes = ['vertexPosition'];

    super(gl, vertexShaderSource, fragmentShaderSource, uniforms, attributes,
      2);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0);
  }
}

const MIN_SIZE = 16;
const MIN_ROOM_OFFSET = 1;
const MIN_ROOM_SIZE = 10;

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
    const size = Math.round(MIN_SIZE + Math.random() * (this.h - MIN_SIZE * 2));

    this.childA = new MapNode(this.x, this.y, this.w, size);
    this.childB = new MapNode(this.x, this.y + size, this.w, this.h - size);
  }

  splitVertically() {
    const size = Math.round(MIN_SIZE + Math.random() * (this.w - MIN_SIZE * 2));

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

    const leafA = this.childA.visitLeafPairs(f);
    const leafB = this.childB.visitLeafPairs(f);

    f(leafA, leafB);

    return Math.random() < 0.5 ? leafA : leafB;
  }

  getRandomLeaf() {
    if (this.isLeaf()) {
      return this;
    }

    return Math.random() < 0.5 ? this.childA.getRandomLeaf()
      : this.childB.getRandomLeaf();
  }
}

var vertexShaderSource$1 = "uniform mediump mat4 projection;uniform mediump mat4 view;attribute vec2 vertexPosition;attribute vec2 vertexTexCoord;varying highp vec2 texCoord;void main(){gl_Position=projection*view*vec4(vertexPosition,0.0,1.0);texCoord=vertexTexCoord;}";

var fragmentShaderSource$1 = "precision highp float;const float tolerance=0.2;uniform sampler2D sampler;uniform mediump vec4 wallColor;uniform mediump vec4 roomColor;uniform mediump vec2 quadSize;varying highp vec2 texCoord;void main(){vec2 quadStep=1.0/quadSize;float neighbors=0.0;neighbors+=1.0-step(tolerance,texture2D(sampler,vec2(texCoord.x-quadStep.x,texCoord.y)).a);neighbors+=1.0-step(tolerance,texture2D(sampler,vec2(texCoord.x+quadStep.x,texCoord.y)).a);neighbors+=1.0-step(tolerance,texture2D(sampler,vec2(texCoord.x,texCoord.y-quadStep.y)).a);neighbors+=1.0-step(tolerance,texture2D(sampler,vec2(texCoord.x,texCoord.y+quadStep.y)).a);float current=step(tolerance,texture2D(sampler,vec2(texCoord.x,texCoord.y)).a);float wall=neighbors*current;gl_FragColor=wallColor*wall+roomColor*current;}";

class MapShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'sampler', 'wallColor',
      'roomColor', 'quadSize'];
    const attributes = ['vertexPosition', 'vertexTexCoord'];

    super(gl, vertexShaderSource$1, fragmentShaderSource$1, uniforms, attributes,
      4);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.vertexTexCoord, 2, gl.FLOAT, false, 16, 8);
  }
}

const TILE_SIZE = 10;
const CORRIDOR_SIZE = 5;

class Map {
  constructor(gl, width, height) {
    this.width = width;
    this.height = height;

    this.gridWidth = Math.ceil(this.width / TILE_SIZE);
    this.gridHeight = Math.ceil(this.height / TILE_SIZE);

    this.root = new MapNode(0, 0, this.gridWidth, this.gridHeight);
    this.root.split();

    this.grid = new Uint8Array(this.gridWidth * this.gridHeight);

    const vertices = new Float32Array([
      0.0, 0.0, 0.0, 0.0,
      this.width - 1.0, 0.0, 1.0, 0.0,
      0.0, this.height - 1.0, 0.0, 1.0,
      this.width - 1.0, this.height - 1.0, 1.0, 1.0
    ]);

    const indices = new Uint16Array([
      0, 2, 1,
      1, 2, 3
    ]);

    this.root.visitLeaves(leaf => {
      for (let y = leaf.roomY; y < leaf.roomY + leaf.roomH; y++) {
        for (let x = leaf.roomX; x < leaf.roomX + leaf.roomW; x++) {
          this.grid[y * this.gridWidth + x] = 0xFF;
        }
      }
    });

    this.root.visitLeafPairs((leafA, leafB) => {
      const aCenterX = Math.floor(leafA.roomX + leafA.roomW / 2);
      const aCenterY = Math.floor(leafA.roomY + leafA.roomH / 2);
      const bCenterX = Math.floor(leafB.roomX + leafB.roomW / 2);
      const bCenterY = Math.floor(leafB.roomY + leafB.roomH / 2);

      const corridorHalf = Math.floor(CORRIDOR_SIZE / 2);

      for (let y = aCenterY; y !== bCenterY;
        y += Math.sign(bCenterY - aCenterY)) {
        for (let x = -corridorHalf; x <= corridorHalf; x++) {
          this.grid[y * this.gridWidth + aCenterX + x] = 0xFF;
        }
      }

      for (let x = aCenterX; x !== bCenterX;
        x += Math.sign(bCenterX - aCenterX)) {
        for (let y = -corridorHalf; y <= corridorHalf; y++) {
          this.grid[(bCenterY + y) * this.gridWidth + x] = 0xFF;
        }
      }
    });

    this.texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, this.gridWidth, this.gridHeight,
      0, gl.ALPHA, gl.UNSIGNED_BYTE, this.grid);
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

  draw(gl, projection, view, wallsOnly) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);

    if (wallsOnly) {
      gl.uniform4f(this.shader.wallColor, 0.0, 0.0, 1.0, 1.0);
      gl.uniform4f(this.shader.roomColor, 0.0, 0.0, 0.0, 0.0);
    } else {
      gl.uniform4f(this.shader.wallColor, 0.0, 0.0, 0.0, 0.0);
      gl.uniform4f(this.shader.roomColor, 0.15, 0.15, 0.15, 1.0);
    }

    gl.uniform1i(this.shader.sampler, 0);
    gl.uniform2f(this.shader.quadSize, this.width, this.height);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  tileAt(x, y) {
    const tile = Math.floor(y / TILE_SIZE) * this.gridWidth +
      Math.floor(x / TILE_SIZE);
    return this.grid[tile];
  }

  getWallDistance(x, y, dirX, dirY) {
    dirX = dirX === 0 ? 0.00001 : dirX;
    dirY = dirY === 0 ? 0.00001 : dirY;

    let tileX = 0;
    let tileY = 0;
    let offset = 0;

    do {
      tileX = Math.floor((x + dirX * offset) / TILE_SIZE) * TILE_SIZE;
      tileY = Math.floor((y + dirY * offset) / TILE_SIZE) * TILE_SIZE;
      offset += TILE_SIZE / 10;
    } while (this.tileAt(tileX, tileY) !== 0 && offset < 1000);

    let ix = 0;
    let iy = 0;

    let distTop = (tileY - y) / dirY;
    ix = x + dirX * distTop;
    distTop = (ix >= tileX && ix <= tileX + TILE_SIZE) ? distTop : 1000;

    let distBottom = (tileY + TILE_SIZE - y) / dirY;
    ix = x + dirX * distBottom;
    distBottom = (ix >= tileX && ix <= tileX + TILE_SIZE) ? distBottom : 1000;

    let distLeft = (tileX - x) / dirX;
    iy = y + dirY * distLeft;
    distLeft = (iy >= tileY && iy <= tileY + TILE_SIZE) ? distLeft : 1000;

    let distRight = (tileX + TILE_SIZE - x) / dirX;
    iy = y + dirY * distRight;
    distRight = (iy >= tileY && iy <= tileY + TILE_SIZE) ? distRight : 1000;

    return Math.min(distTop, distBottom, distLeft, distRight);
  }
}

const HEART_SEGMENTS = 101;
const HEART_RADIUS = 10;

class Heart {
  constructor(gl, basicShader, x, y) {
    const vertices = new Float32Array(HEART_SEGMENTS * basicShader.vertexSize);

    let vertexIndex = 0;

    vertices[vertexIndex++] = 0.0;
    vertices[vertexIndex++] = 0.0;

    for (let i = 0; i < (HEART_SEGMENTS - 1) / 2; i++) {
      const vertexX = -2.0 + i * (4.0 / ((HEART_SEGMENTS - 1) / 2 - 1));

      vertices[vertexIndex++] = vertexX * HEART_RADIUS;
      vertices[vertexIndex++] = -Math.sqrt(1.0 - (Math.abs(vertexX) - 1.0) *
        (Math.abs(vertexX) - 1.0)) * HEART_RADIUS;
    }

    for (let i = 0; i < (HEART_SEGMENTS - 1) / 2; i++) {
      const vertexX = -2.0 + i * (4.0 / ((HEART_SEGMENTS - 1) / 2 - 1));

      vertices[vertexIndex++] = -vertexX * HEART_RADIUS;
      vertices[vertexIndex++] = 3.0 * Math.sqrt(1.0 -
        (Math.sqrt(Math.abs(vertexX))) / Math.SQRT2) * HEART_RADIUS;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.shader = basicShader;

    this.x = x;
    this.y = y;

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);
  }

  draw(gl, projection, view, filled) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, this.view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);
    gl.uniform4f(this.shader.color, 1.0, 0.0, 0.0, 1.0);

    if (filled) {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, HEART_SEGMENTS);
    } else {
      gl.drawArrays(gl.LINE_STRIP, 1, HEART_SEGMENTS - 1);
    }
  }
}

const PLAYER_RADIUS = 5;
const PLAYER_SEGMENTS = 10;
const PLAYER_SPEED = 0.2;
const PLAYER_LIVES = 3;

class Player {
  constructor(gl, basicShader, x, y) {
    const vertices = new Float32Array(PLAYER_SEGMENTS * basicShader.vertexSize);

    let vertexIndex = 0;

    for (let i = 0; i < PLAYER_SEGMENTS; i++) {
      const angle = ((Math.PI * 2.0) / PLAYER_SEGMENTS) * i;

      vertices[vertexIndex++] = Math.cos(angle) * PLAYER_RADIUS;
      vertices[vertexIndex++] = Math.sin(angle) * PLAYER_RADIUS;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.shader = basicShader;

    this.x = x;
    this.y = y;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);

    this.lives = PLAYER_LIVES;
    this.hearts = [];

    this.invincibilityTimer = 0;
    this.flashTimer = 0;
    this.visible = true;

    for (let i = 0; i < PLAYER_LIVES; i++) {
      this.hearts.push(new Heart(gl, basicShader, 30.0 + i * 50.0, 20.0));
    }
  }

  validPosition(map, x, y) {
    return map.tileAt(x - PLAYER_RADIUS, y) === 0xFF &&
      map.tileAt(x + PLAYER_RADIUS, y) === 0xFF &&
      map.tileAt(x, y - PLAYER_RADIUS) === 0xFF &&
      map.tileAt(x, y + PLAYER_RADIUS) === 0xFF;
  }

  update(deltaTime, game) {
    const distance = deltaTime * PLAYER_SPEED;

    let dirX = (game.input.isPressed(game.input.LEFT) ? -1 : 0) +
      (game.input.isPressed(game.input.RIGHT) ? 1 : 0);
    let dirY = (game.input.isPressed(game.input.UP) ? -1 : 0) +
      (game.input.isPressed(game.input.DOWN) ? 1 : 0);

    if (dirX !== 0 && dirY !== 0) {
      dirX *= Math.SQRT2 / 2.0;
      dirY *= Math.SQRT2 / 2.0;
    }

    const newX = this.x + dirX * distance;
    const newY = this.y + dirY * distance;

    if (newX !== this.x && this.validPosition(game.map, newX, this.y)) {
      this.x = newX;
      this.model[12] = this.x;
    }

    if (newY !== this.y && this.validPosition(game.map, this.x, newY)) {
      this.y = newY;
      this.model[13] = this.y;
    }

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= deltaTime;

      if (this.flashTimer > 0) {
        this.flashTimer -= deltaTime;
      } else {
        this.flashTimer = 85;

        this.visible = !this.visible;
      }
    } else {
      this.visible = true;
    }
  }

  damage(game) {
    if (this.invincibilityTimer > 0) {
      return;
    }

    this.lives -= 1;
    this.invincibilityTimer = 1000;

    game.shake(500);
  }

  draw(gl, projection, view) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);
    gl.uniform4f(this.shader.color, 1.0, 0.0, 0.0, 1.0);

    if (this.visible) {
      gl.drawArrays(gl.LINE_LOOP, 0, PLAYER_SEGMENTS);
    }

    for (let i = 0; i < this.hearts.length; i++) {
      const filled = this.lives >= i + 1 ||
        (this.invincibilityTimer > 0 && this.visible && i === this.lives);
      this.hearts[i].draw(gl, projection, view, filled);
    }
  }
}

const LIGHT_CONE_SEGMENTS = 256;
const LIGHT_CONE_RADIUS = 128;

class LightCone {
  constructor(gl, basicShader) {
    this.vertices = new Float32Array(LIGHT_CONE_SEGMENTS *
      basicShader.vertexSize);

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

const SNAKE_SEGMENTS = 24;
const SNAKE_WIDTH = 30;
const SNAKE_HEIGHT = 10;
const SNAKE_SPEED = 0.02;

class Snake {
  constructor(gl, basicShader, x, y) {
    this.vertices = new Float32Array(SNAKE_SEGMENTS * basicShader.vertexSize);

    this.vertexBuffer = gl.createBuffer();

    this.shader = basicShader;

    this.x = x;
    this.y = y;

    this.angle = Math.random() * 2.0 * Math.PI;
    this.angleChange = -0.0005 + Math.random() * 0.001;

    this.model = new Float32Array([
      Math.cos(this.angle), Math.sin(this.angle), 0.0, 0.0,
      -Math.sin(this.angle), Math.cos(this.angle), 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);

    this.phase = 0;
    this.charging = false;
  }

  update(deltaTime, game) {
    const gl = game.gl;

    this.phase += deltaTime * (this.charging ? 0.05 : 0.01);

    if (this.phase > Math.PI * 2.0) {
      this.phase -= Math.PI * 2.0;
    }

    let vertexIndex = 0;

    for (let i = 0; i < SNAKE_SEGMENTS - 4; i++) {
      const snakeX = ((SNAKE_WIDTH - 10.0) / (SNAKE_SEGMENTS - 4.0)) * i -
        SNAKE_WIDTH;
      this.vertices[vertexIndex++] = snakeX;
      this.vertices[vertexIndex++] = Math.sin(i + this.phase) *
        (SNAKE_HEIGHT / 2.0);
    }

    this.vertices[vertexIndex++] = -5.0;
    this.vertices[vertexIndex++] = SNAKE_HEIGHT / 2.0;
    this.vertices[vertexIndex++] = 0.0;
    this.vertices[vertexIndex++] = 0.0;
    this.vertices[vertexIndex++] = -5.0;
    this.vertices[vertexIndex++] = -SNAKE_HEIGHT / 2.0;
    this.vertices[vertexIndex++] = this.vertices[vertexIndex - 9];
    this.vertices[vertexIndex++] = this.vertices[vertexIndex - 9];

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    let speed = SNAKE_SPEED;

    const distX = game.player.x - this.x;
    const distY = game.player.y - this.y;
    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist < 10.0) {
      game.player.damage(game);
    }

    this.charging = dist > 10.0 && dist < 150.0 &&
      game.map.getWallDistance(this.x, this.y, distX / dist, distY / dist) >=
      dist;

    if (this.charging) {
      this.angle = Math.atan2(distY, distX);
      speed *= 5.0;
    } else {
      this.angle += deltaTime * 0.0001;
    }

    const newX = this.x + Math.cos(this.angle) * deltaTime * speed;
    const newY = this.y + Math.sin(this.angle) * deltaTime * speed;

    if (game.map.tileAt(newX, newY) === 0xFF) {
      this.x = newX;
      this.y = newY;
    } else {
      this.angle = this.angle - Math.PI;
      this.angleChange = -0.0005 + Math.random() * 0.001;

      this.x += Math.cos(this.angle) * SNAKE_WIDTH;
      this.y += Math.sin(this.angle) * SNAKE_WIDTH;
    }

    this.model[0] = Math.cos(this.angle);
    this.model[1] = Math.sin(this.angle);
    this.model[4] = -Math.sin(this.angle);
    this.model[5] = Math.cos(this.angle);

    this.model[12] = this.x;
    this.model[13] = this.y;
  }

  draw(gl, projection, view) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);
    gl.uniformMatrix4fv(this.shader.model, false, this.model);

    if (this.charging) {
      gl.uniform4f(this.shader.color, 1.0, 0.0, 1.0, 1.0);
    } else {
      gl.uniform4f(this.shader.color, 0.0, 1.0, 0.0, 1.0);
    }

    gl.drawArrays(gl.LINE_STRIP, 0, SNAKE_SEGMENTS);
  }
}

var vertexShaderSource$2 = "attribute vec2 vertexPosition;attribute vec2 vertexTexCoord;varying highp vec2 texCoord;void main(){gl_Position=vec4(vertexPosition,0.0,1.0);texCoord=vertexTexCoord;}";

var fragmentShaderSource$2 = "precision highp float;uniform sampler2D sampler;uniform vec2 texSize;varying highp vec2 texCoord;void main(){vec2 texStep=1.0/texSize;vec4 color=vec4(0.0);color+=texture2D(sampler,vec2(texCoord.x,texCoord.y));color+=texture2D(sampler,vec2(texCoord.x-texStep.x,texCoord.y));color+=texture2D(sampler,vec2(texCoord.x+texStep.x,texCoord.y));color+=texture2D(sampler,vec2(texCoord.x,texCoord.y-texStep.y));color+=texture2D(sampler,vec2(texCoord.x,texCoord.y+texStep.y));gl_FragColor=color;}";

class BlueShader extends Shader {
  constructor(gl) {
    const uniforms = ['sampler', 'texSize'];
    const attributes = ['vertexPosition', 'vertexTexCoord'];

    super(gl, vertexShaderSource$2, fragmentShaderSource$2, uniforms, attributes,
      4);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.vertexTexCoord, 2, gl.FLOAT, false, 16, 8);
  }
}

class PostProcessor {
  constructor(gl, width, height) {
    this.width = width;
    this.height = height;

    const vertices = new Float32Array([
      -1.0, 1.0, 0.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 0.0
    ]);

    const indices = new Uint16Array([
      0, 2, 1,
      1, 2, 3
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    this.texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, this.texture, 0);

    this.shader = new BlueShader(gl);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  draw(gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    this.shader.use(gl);

    gl.uniform1i(this.shader.sampler, 0);
    gl.uniform2f(this.shader.texSize, this.width, this.height);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
}

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

const NUM_SNAKES = 75;

class Game {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;
    document.body.appendChild(this.canvas);

    this.gl = this.canvas.getContext('webgl');
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.BLEND);

    this.projection = new Float32Array([
      2.0 / (this.canvas.width - 1.0), 0.0, 0.0, 0.0,
      0.0, -2.0 / (this.canvas.height - 1.0), 0.0, 0.0,
      0.0, 0.0, -1.0, 0.0,
      -1.0, 1.0, 0.0, 1.0
    ]);

    this.cameraX = 0.0;
    this.cameraY = 0.0;

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      -this.cameraX, -this.cameraY, 0.0, 1.0
    ]);

    this.input = new Input();

    this.basicShader = new BasicShader(this.gl);
    this.map = new Map(this.gl, this.canvas.width * 4, this.canvas.height * 4);

    this.startingRoom = this.map.root.getRandomLeaf();

    this.player = new Player(this.gl, this.basicShader,
      (this.startingRoom.roomX + this.startingRoom.roomW / 2) * 10,
      (this.startingRoom.roomY + this.startingRoom.roomH / 2) * 10);

    this.snakes = [];

    for (let i = 0; i < NUM_SNAKES; i++) {
      let room = null;

      do {
        room = this.map.root.getRandomLeaf();
      } while (room === this.startingRoom);

      this.snakes.push(new Snake(this.gl, this.basicShader,
        (room.roomX + 1 + Math.random() * (room.roomW - 2)) * 10,
        (room.roomY + 1 + Math.random() * (room.roomH - 2)) * 10));
    }

    this.lightCone = new LightCone(this.gl, this.basicShader);

    this.postProcessor = new PostProcessor(this.gl, this.canvas.width,
      this.canvas.height);

    this.lastTimestamp = performance.now();

    this.shakeTimer = 0;

    this.frames = 0;
    this.frameTimer = 0;
  }

  update(timestamp) {
    const deltaTime = timestamp - this.lastTimestamp;

    this.input.update();

    this.player.update(deltaTime, this);
    this.lightCone.update(deltaTime, this);

    for (const snake of this.snakes) {
      snake.update(deltaTime, this);
    }

    this.cameraX = this.player.x - this.canvas.width / 2.0;
    this.cameraY = this.player.y - this.canvas.height / 2.0;

    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;

      this.cameraX += -4.0 + Math.random() * 8.0;
      this.cameraY += -4.0 + Math.random() * 8.0;
    }

    this.view[12] = -this.cameraX;
    this.view[13] = -this.cameraY;

    this.lastTimestamp = timestamp;

    this.frames++;
    this.frameTimer += deltaTime;

    if (this.frameTimer > 1000) {
      console.log(`FPS: ${this.frames}`);
      this.frames = 0;
      this.frameTimer -= 1000;
    }
  }

  shake(duration) {
    this.shakeTimer = duration;
  }

  draw() {
    this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,
      this.postProcessor.framebuffer);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection, this.view, true);

    for (const snake of this.snakes) {
      if (snake.x >= this.cameraX - 30 &&
        snake.x <= this.cameraX + SCREEN_WIDTH + 30 &&
        snake.y >= this.cameraY - 30 &&
        snake.y <= this.cameraY + SCREEN_HEIGHT + 30) {
        snake.draw(this.gl, this.projection, this.view);
      }
    }

    this.player.draw(this.gl, this.projection, this.view);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection, this.view, false);
    this.lightCone.draw(this.gl, this.projection, this.view);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.postProcessor.draw(this.gl);
  }
}

const game = new Game();

const updateGame = timestamp => {
  requestAnimationFrame(updateGame);

  game.update(timestamp);
  game.draw();
};

addEventListener('keydown', event => {
  switch (event.keyCode) {
  case 38: case 87: case 75:
    game.input.press(game.input.UP);
    break;
  case 40: case 83: case 74:
    game.input.press(game.input.DOWN);
    break;
  case 37: case 65: case 72:
    game.input.press(game.input.LEFT);
    break;
  case 39: case 68: case 76:
    game.input.press(game.input.RIGHT);
    break;
  }
});

addEventListener('keyup', event => {
  switch (event.keyCode) {
  case 38: case 87: case 75:
    game.input.release(game.input.UP);
    break;
  case 40: case 83: case 74:
    game.input.release(game.input.DOWN);
    break;
  case 37: case 65: case 72:
    game.input.release(game.input.LEFT);
    break;
  case 39: case 68: case 76:
    game.input.release(game.input.RIGHT);
    break;
  }
});

requestAnimationFrame(updateGame);

}());
