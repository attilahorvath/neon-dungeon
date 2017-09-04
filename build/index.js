(function () {
'use strict';

class Input {
  constructor() {
    this.UP = 1;
    this.DOWN = 2;
    this.LEFT = 4;
    this.RIGHT = 8;
    this.ACTION = 16;

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

    this.snakes = 0;
    this.containsGem = false;
    this.containsHeart = false;
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

class Sword {
  constructor(gl, shader, player) {
    const vertices = new Float32Array(3 * shader.vertexSize);

    let vertexIndex = 0;

    vertices[vertexIndex++] = 3.0;
    vertices[vertexIndex++] = 6.0;

    vertices[vertexIndex++] = 20.0;
    vertices[vertexIndex++] = 0.0;

    vertices[vertexIndex++] = 6.0;
    vertices[vertexIndex++] = 0.0;

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.x = player.x;
    this.y = player.y;

    this.angle = player.angle + Math.PI / 2.0;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      this.x, this.y, 0.0, 1.0
    ]);
  }

  update(deltaTime, game) {
    this.x = game.player.x;
    this.y = game.player.y;

    if (this.swingTimer > 0) {
      this.swingTimer -= deltaTime;

      this.angle = this.swingBaseAngle - ((150.0 - this.swingTimer) / 150.0) *
        Math.PI * 2.0;

      const endX = this.x + Math.cos(this.angle) * 20.0;
      const endY = this.y + Math.sin(this.angle) * 20.0;

      const particleAngle = this.angle + Math.PI / 2.0;

      for (let i = 0; i < 2; i++) {
        const particleDirX = Math.cos(particleAngle) * Math.random() * 0.1;
        const particleDirY = Math.sin(particleAngle) * Math.random() * 0.1;

        game.particleSystem.emit(game.gl, endX, endY,
          particleDirX, particleDirY, 1.0, 1.0, 0.0, 1);
      }

      for (const snake of game.snakeCollection.snakes) {
        if (!snake.alive) {
          continue;
        }

        const dist1X = snake.x - this.x;
        const dist1Y = snake.y - this.y;

        const dist1 = Math.sqrt(dist1X * dist1X + dist1Y * dist1Y);

        const dist2X = snake.x - endX;
        const dist2Y = snake.y - endY;

        const dist2 = Math.sqrt(dist2X * dist2X + dist2Y * dist2Y);

        if (dist1 <= 25.0 && dist2 <= 25.0) {
          snake.alive = false;

          game.particleSystem.emitRandom(game.gl, this.x, this.y, 0.01, 0.2,
            1.0, 0.0, 1.0, 50);
        }
      }
    } else {
      this.angle = game.player.angle + Math.PI;
    }

    this.model[0] = Math.cos(this.angle);
    this.model[1] = Math.sin(this.angle);
    this.model[4] = -Math.sin(this.angle);
    this.model[5] = Math.cos(this.angle);

    this.model[12] = this.x;
    this.model[13] = this.y;
  }

  swing() {
    this.swingTimer = 150;
    this.swingBaseAngle = this.angle;
  }

  draw(gl, shader) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.model, false, this.model);
    gl.uniform4f(shader.color, 1.0, 1.0, 0.0, 1.0);

    gl.drawArrays(gl.LINE_STRIP, 0, 3);
  }
}

const PLAYER_RADIUS = 5;
const PLAYER_SEGMENTS = 10;
const PLAYER_SPEED = 0.2;
const PLAYER_LIVES = 3;

class Player {
  constructor(gl, shader, x, y) {
    const vertices = new Float32Array(PLAYER_SEGMENTS * shader.vertexSize);

    let vertexIndex = 0;

    for (let i = 0; i < PLAYER_SEGMENTS; i++) {
      const angle = ((Math.PI * 2.0) / PLAYER_SEGMENTS) * i;

      vertices[vertexIndex++] = Math.cos(angle) * PLAYER_RADIUS;
      vertices[vertexIndex++] = Math.sin(angle) * PLAYER_RADIUS;
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.x = x;
    this.y = y;
    this.angle = 0.0;

    this.model = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);

    this.lives = PLAYER_LIVES;

    this.invincibilityTimer = 0;
    this.flashTimer = 0;
    this.visible = true;

    this.slidingTimer = 0;
    this.slidingX = 0;
    this.slidingY = 0;

    this.sword = new Sword(gl, shader, this);

    this.gems = 0;
    this.gemTimer = 0;
    this.gemFlashTimer = 0;
    this.gemVisible = true;

    this.newHeartTimer = 0;
    this.newHeartFlashTimer = 0;
    this.newHeartVisible = true;
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

    if (this.sword.swingTimer > 0) {
      dirX = dirY = 0;
    }

    if (dirX !== 0 && dirY !== 0) {
      dirX *= Math.SQRT2 / 2.0;
      dirY *= Math.SQRT2 / 2.0;
    }

    if (game.input.isPressed(game.input.LEFT) ||
      game.input.isPressed(game.input.RIGHT) ||
      game.input.isPressed(game.input.UP) ||
      game.input.isPressed(game.input.DOWN)) {
      this.angle = Math.atan2(dirY, dirX);
    }

    if (this.slidingTimer > 0) {
      this.slidingTimer -= deltaTime;

      dirX = this.slidingX;
      dirY = this.slidingY;
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

    if (this.gemTimer > 0) {
      this.gemTimer -= deltaTime;

      if (this.gemFlashTimer > 0) {
        this.gemFlashTimer -= deltaTime;
      } else {
        this.gemFlashTimer = 80;

        this.gemVisible = !this.gemVisible;
      }
    }

    if (this.newHeartTimer > 0) {
      this.newHeartTimer -= deltaTime;

      if (this.newHeartFlashTimer > 0) {
        this.newHeartFlashTimer -= deltaTime;
      } else {
        this.newHeartFlashTimer = 80;

        this.newHeartVisible = !this.newHeartVisible;
      }
    }

    if (game.input.wasJustPressed(game.input.ACTION)) {
      this.sword.swing();
    }

    this.sword.update(deltaTime, game);
  }

  damage(game, slidingX, slidingY) {
    if (this.invincibilityTimer > 0) {
      return;
    }

    this.lives--;
    this.invincibilityTimer = 1000;

    this.slidingTimer = 500;
    this.slidingX = slidingX;
    this.slidingY = slidingY;

    game.shake(500);

    game.particleSystem.emitRandom(game.gl, this.x, this.y, 0.01, 0.2,
      1.0, 0.0, 0.0, 50);
  }

  collectGem(game, gem) {
    this.gems++;
    this.gemTimer = 800;
    this.gemFlashTimer = 80;

    game.particleSystem.emitRandom(game.gl, gem.x, gem.y, 0.01, 0.1,
      1.0, 0.0, 1.0, 50);
  }

  collectHeart(game, heart) {
    this.lives++;
    this.newHeartTimer = 800;
    this.newHeartFlashTimer = 80;

    game.particleSystem.emitRandom(game.gl, heart.x, heart.y, 0.01, 0.1,
      1.0, 0.0, 0.0, 50);
  }

  draw(gl, shader) {
    if (!this.visible) {
      return;
    }

    this.sword.draw(gl, shader);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.model, false, this.model);
    gl.uniform4f(shader.color, 1.0, 0.0, 0.0, 1.0);

    gl.drawArrays(gl.LINE_LOOP, 0, PLAYER_SEGMENTS);
  }
}

var vertexShaderSource$2 = "uniform mediump mat4 projection;uniform mediump mat4 view;uniform mediump mat4 model;uniform mediump vec3 color;attribute vec2 vertexPosition;attribute float vertexAlpha;varying mediump vec4 vertexColor;void main(){gl_Position=projection*view*model*vec4(vertexPosition,0.0,1.0);vertexColor=vec4(color,vertexAlpha);}";

var fragmentShaderSource$2 = "varying mediump vec4 vertexColor;void main(){gl_FragColor=vertexColor;}";

class ColorShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'model', 'color'];
    const attributes = ['vertexPosition', 'vertexAlpha'];

    super(gl, vertexShaderSource$2, fragmentShaderSource$2, uniforms, attributes,
      6);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 12, 0);
    gl.vertexAttribPointer(this.vertexAlpha, 1, gl.FLOAT, false, 12, 8);
  }
}

const LIGHT_CONE_SEGMENTS = 256;
const LIGHT_CONE_RADIUS = 196;

class LightCone {
  constructor(gl) {
    this.shader = new ColorShader(gl);

    this.baseVertices = new Float32Array(LIGHT_CONE_SEGMENTS *
      this.shader.vertexSize);

    this.baseVertexBuffer = gl.createBuffer();

    this.magnifiedVertices = new Float32Array(LIGHT_CONE_SEGMENTS *
      this.shader.vertexSize);

    this.magnifiedVertexBuffer = gl.createBuffer();

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

    this.baseVertices[vertexIndex] = this.magnifiedVertices[vertexIndex] = 1.0;
    vertexIndex++;

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

      this.baseVertices[vertexIndex] = this.magnifiedVertices[vertexIndex] =
        (LIGHT_CONE_RADIUS - distance) / LIGHT_CONE_RADIUS;
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
    gl.uniform3f(this.shader.color, 0.7, 0.7, 0.7);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, LIGHT_CONE_SEGMENTS);
  }
}

class Heart {
  constructor(heartCollection, x, y, scale) {
    this.x = x;
    this.y = y;
    this.heartCollection = heartCollection;

    this.model = new Float32Array([
      scale, 0.0, 0.0, 0.0,
      0.0, scale, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);

    this.collected = false;
  }

  update(game) {
    if (this.collected) {
      return;
    }

    const distX = game.player.x - this.x;
    const distY = game.player.y - this.y;

    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist <= 20.0) {
      game.player.collectHeart(game, this);
      this.collected = true;
    }
  }

  draw(gl, shader, filled) {
    if (this.collected) {
      return;
    }

    gl.uniformMatrix4fv(shader.model, false, this.model);

    if (filled) {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, this.heartCollection.HEART_SEGMENTS);
    } else {
      gl.drawArrays(gl.LINE_STRIP, 1, this.heartCollection.HEART_SEGMENTS - 1);
    }
  }
}

const HEART_SEGMENTS = 101;
const HEART_RADIUS = 10;

class HeartCollection {
  constructor(gl, shader, count) {
    this.HEART_SEGMENTS = HEART_SEGMENTS;

    const vertices = new Float32Array(HEART_SEGMENTS * shader.vertexSize);

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

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.hearts = [];
    this.heartX = 30.0;

    for (let i = 0; i < count; i++) {
      this.hearts.push(new Heart(this, this.heartX, 20.0, 1.0));
      this.heartX += 50.0;
    }
  }

  update(player) {
    if (player.lives > this.hearts.length) {
      this.hearts.push(new Heart(this, this.heartX, 20.0, 1.0));
      this.heartX += 50.0;
    }
  }

  draw(gl, shader, player) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.view, false, this.view);
    gl.uniform4f(shader.color, 1.0, 0.0, 0.0, 1.0);

    const lastFlashing = player.invincibilityTimer > 0 && player.visible;
    const newFlashing = player.newHeartTimer <= 0 || player.newHeartVisible;

    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].draw(gl, shader, player.lives > i + 1 ||
        (newFlashing && i === player.lives - 1) ||
        (lastFlashing && i === player.lives));
    }
  }
}

class Gem {
  constructor(x, y, scale) {
    this.x = x;
    this.y = y;

    this.model = new Float32Array([
      scale, 0.0, 0.0, 0.0,
      0.0, scale, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, 0.0, 1.0
    ]);

    this.collected = false;
  }

  update(game) {
    if (this.collected) {
      return;
    }

    const distX = game.player.x - this.x;
    const distY = game.player.y - this.y;

    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist <= 20.0) {
      game.player.collectGem(game, this);
      this.collected = true;
    }
  }

  draw(gl, shader, filled) {
    if (this.collected) {
      return;
    }

    gl.uniformMatrix4fv(shader.model, false, this.model);

    if (filled) {
      gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawElements(gl.LINES, 30, gl.UNSIGNED_SHORT,
        Uint16Array.BYTES_PER_ELEMENT * 24);
    }
  }
}

class GemCollection {
  constructor(gl, shader, count) {
    const vertices = new Float32Array([
      -20.0, -7.0,
      -13.0, -18.0,
      -7.0, -7.0,
      0.0, -18.0,
      6.0, -7.0,
      13.0, -18.0,
      19.0, -7.0,
      0.0, 18.0
    ]);

    const indices = new Uint16Array([
      1, 0, 2,
      3, 1, 2,
      3, 2, 4,
      5, 3, 4,
      5, 4, 6,
      2, 0, 7,
      4, 2, 7,
      6, 4, 7,

      0, 1,
      1, 2,
      0, 2,
      1, 3,
      2, 3,
      2, 4,
      3, 5,
      3, 4,
      4, 5,
      5, 6,
      4, 6,
      0, 7,
      2, 7,
      4, 7,
      6, 7
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.gems = [];

    for (let i = 0; i < count; i++) {
      this.gems.push(new Gem(30.0 + i * 50.0, 80.0, 1.0));
    }
  }

  draw(gl, shader, player) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    shader.use(gl);

    gl.uniformMatrix4fv(shader.view, false, this.view);
    gl.uniform4f(shader.color, 1.0, 0.0, 1.0, 1.0);

    const lastFlashing = player.gemTimer <= 0 || player.gemVisible;

    for (let i = 0; i < this.gems.length; i++) {
      this.gems[i].draw(gl, shader, player.gems > i + 1 ||
        (lastFlashing && i === player.gems - 1));
    }
  }
}

const SNAKE_SPEED = 0.02;

class Snake {
  constructor(snakeCollection, x, y) {
    this.snakeCollection = snakeCollection;
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

    this.alive = true;
    this.charging = false;
    this.chargingTimer = 500;
  }

  update(deltaTime, game) {
    if (!this.alive) {
      return;
    }

    let speed = SNAKE_SPEED;

    const distX = game.player.x - this.x;
    const distY = game.player.y - this.y;

    const dist = Math.sqrt(distX * distX + distY * distY);

    const dirX = distX / dist;
    const dirY = distY / dist;

    if (dist < 5.0) {
      game.player.damage(game, dirX, dirY);
    }

    if (dist > 10.0 && dist < 150.0 &&
      game.map.getWallDistance(this.x, this.y, dirX, dirY) >= dist) {
      this.chargingTimer -= deltaTime;
    } else {
      this.chargingTimer = 500;
    }

    this.charging = this.chargingTimer <= 0;

    if (this.charging) {
      this.angle = Math.atan2(distY, distX);
      speed *= 6.0;
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

      this.x += Math.cos(this.angle) * this.snakeCollection.SNAKE_WIDTH;
      this.y += Math.sin(this.angle) * this.snakeCollection.SNAKE_WIDTH;
    }

    this.model[0] = Math.cos(this.angle);
    this.model[1] = Math.sin(this.angle);
    this.model[4] = -Math.sin(this.angle);
    this.model[5] = Math.cos(this.angle);

    this.model[12] = this.x;
    this.model[13] = this.y;
  }

  draw(gl, shader) {
    if (!this.alive) {
      return;
    }

    gl.uniformMatrix4fv(shader.model, false, this.model);

    if (this.charging) {
      gl.uniform4f(shader.color, 1.0, 0.0, 1.0, 1.0);
      gl.drawArrays(gl.LINE_STRIP, this.snakeCollection.SNAKE_SEGMENTS,
        this.snakeCollection.SNAKE_SEGMENTS);
    } else {
      gl.uniform4f(shader.color, 0.0, 1.0, 0.0, 1.0);
      gl.drawArrays(gl.LINE_STRIP, 0, this.snakeCollection.SNAKE_SEGMENTS);
    }
  }
}

const SNAKE_SEGMENTS = 24;
const SNAKE_WIDTH = 30;
const SNAKE_HEIGHT = 10;

class SnakeCollection {
  constructor(game, count) {
    this.SNAKE_SEGMENTS = SNAKE_SEGMENTS;
    this.SNAKE_WIDTH = SNAKE_WIDTH;
    this.SNAKE_HEIGHT = SNAKE_HEIGHT;

    this.vertices = new Float32Array(this.SNAKE_SEGMENTS * 2 *
      game.basicShader.vertexSize);

    this.vertexBuffer = game.gl.createBuffer();

    this.snakes = [];

    for (let i = 0; i < count; i++) {
      let room = null;

      do {
        room = game.map.root.getRandomLeaf();
      } while (room === game.startingRoom || room.snakes > 4);

      this.snakes.push(new Snake(this,
        (room.roomX + 1 + Math.random() * (room.roomW - 2)) * 10,
        (room.roomY + 1 + Math.random() * (room.roomH - 2)) * 10));

      room.snakes++;
    }

    this.phase = 0;
    this.chargingPhase = 0;
  }

  update(deltaTime, game) {
    const gl = game.gl;

    this.phase += deltaTime * 0.01;
    this.chargingPhase += deltaTime * 0.06;

    if (this.phase > Math.PI * 2.0) {
      this.phase -= Math.PI * 2.0;
    }

    if (this.chargingPhase > Math.PI * 2.0) {
      this.chargingPhase -= Math.PI * 2.0;
    }

    this.vertexIndex = 0;

    this.generateVertices(this.phase);
    this.generateVertices(this.chargingPhase);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    for (const snake of this.snakes) {
      snake.update(deltaTime, game);
    }
  }

  generateVertices(phase) {
    for (let i = 0; i < SNAKE_SEGMENTS - 4; i++) {
      const snakeX = ((SNAKE_WIDTH - 10.0) / (SNAKE_SEGMENTS - 4.0)) * i -
        SNAKE_WIDTH;
      this.vertices[this.vertexIndex++] = snakeX;
      this.vertices[this.vertexIndex++] = Math.sin(i + phase) *
        (SNAKE_HEIGHT / 2.0);
    }

    this.vertices[this.vertexIndex++] = -5.0;
    this.vertices[this.vertexIndex++] = SNAKE_HEIGHT / 2.0;
    this.vertices[this.vertexIndex++] = 0.0;
    this.vertices[this.vertexIndex++] = 0.0;
    this.vertices[this.vertexIndex++] = -5.0;
    this.vertices[this.vertexIndex++] = -SNAKE_HEIGHT / 2.0;
    this.vertices[this.vertexIndex++] = this.vertices[this.vertexIndex - 9];
    this.vertices[this.vertexIndex++] = this.vertices[this.vertexIndex - 9];
  }

  draw(game) {
    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.vertexBuffer);

    game.basicShader.use(game.gl);

    for (const snake of this.snakes) {
      if (snake.x >= game.cameraX - 30 &&
        snake.x <= game.cameraX + game.canvas.width + 30 &&
        snake.y >= game.cameraY - 30 &&
        snake.y <= game.cameraY + game.canvas.height + 30) {
        snake.draw(game.gl, game.basicShader);
      }
    }
  }
}

class CollectibleGemCollection {
  constructor(game, count) {
    this.vertexBuffer = game.gemCollection.vertexBuffer;
    this.indexBuffer = game.gemCollection.indexBuffer;

    this.gems = [];

    for (let i = 0; i < count; i++) {
      let room = null;

      do {
        room = game.map.root.getRandomLeaf();
      } while (room === game.startingRoom || room.containsGem);

      this.gems.push(new Gem(
        (room.roomX + 2 + Math.random() * (room.roomW - 4)) * 10,
        (room.roomY + 2 + Math.random() * (room.roomH - 4)) * 10,
        0.7));

      room.containsGem = true;
    }
  }

  update(game) {
    for (const gem of this.gems) {
      gem.update(game);
    }
  }

  draw(game) {
    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.vertexBuffer);
    game.gl.bindBuffer(game.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    game.basicShader.use(game.gl);

    game.gl.uniform4f(game.basicShader.color, 1.0, 0.0, 1.0, 1.0);

    for (const gem of this.gems) {
      if (gem.x >= game.cameraX - 30 &&
        gem.x <= game.cameraX + game.canvas.width + 30 &&
        gem.y >= game.cameraY - 30 &&
        gem.y <= game.cameraY + game.canvas.height + 30) {
        gem.draw(game.gl, game.basicShader, false);
      }
    }
  }
}

class CollectibleHeartCollection {
  constructor(game, count) {
    this.vertexBuffer = game.heartCollection.vertexBuffer;
    this.indexBuffer = game.heartCollection.indexBuffer;

    this.hearts = [];

    for (let i = 0; i < count; i++) {
      let room = null;

      do {
        room = game.map.root.getRandomLeaf();
      } while (room === game.startingRoom || room.containsHeart);

      this.hearts.push(new Heart(game.heartCollection,
        (room.roomX + 2 + Math.random() * (room.roomW - 4)) * 10,
        (room.roomY + 2 + Math.random() * (room.roomH - 4)) * 10,
        0.7));

      room.containsHeart = true;
    }
  }

  update(game) {
    for (const gem of this.hearts) {
      gem.update(game);
    }
  }

  draw(game) {
    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.vertexBuffer);
    game.gl.bindBuffer(game.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    game.basicShader.use(game.gl);

    game.gl.uniform4f(game.basicShader.color, 1.0, 0.0, 0.0, 1.0);

    for (const gem of this.hearts) {
      if (gem.x >= game.cameraX - 30 &&
        gem.x <= game.cameraX + game.canvas.width + 30 &&
        gem.y >= game.cameraY - 30 &&
        gem.y <= game.cameraY + game.canvas.height + 30) {
        gem.draw(game.gl, game.basicShader, true);
      }
    }
  }
}

var vertexShaderSource$3 = "uniform mediump mat4 projection;uniform mediump mat4 view;attribute vec2 vertexPosition;attribute vec2 vertexTexCoord;varying highp vec2 texCoord;void main(){gl_Position=projection*view*vec4(vertexPosition,0.0,1.0);texCoord=vertexTexCoord;}";

var fragmentShaderSource$3 = "uniform sampler2D sampler;varying highp vec2 texCoord;void main(){gl_FragColor=texture2D(sampler,texCoord);}";

class TextureShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'sampler'];
    const attributes = ['vertexPosition', 'vertexTexCoord'];

    super(gl, vertexShaderSource$3, fragmentShaderSource$3, uniforms, attributes,
      4);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.vertexTexCoord, 2, gl.FLOAT, false, 16, 8);
  }
}

class FogOfWar {
  constructor(gl, width, height) {
    this.width = width;
    this.height = height;

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

    gl.bindTexture(gl.TEXTURE_2D, null);

    this.projection = new Float32Array([
      2.0 / (this.width - 1.0), 0.0, 0.0, 0.0,
      0.0, 2.0 / (this.height - 1.0), 0.0, 0.0,
      0.0, 0.0, -1.0, 0.0,
      -1.0, -1.0, 0.0, 1.0
    ]);

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.shader = new TextureShader(gl);
  }

  draw(gl, projection, view) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);

    gl.uniform1i(this.shader.sampler, 0);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
}

var vertexShaderSource$4 = "attribute vec2 vertexPosition;attribute vec2 vertexTexCoord;varying highp vec2 texCoord;void main(){gl_Position=vec4(vertexPosition,0.0,1.0);texCoord=vertexTexCoord;}";

var fragmentShaderSource$4 = "precision highp float;uniform sampler2D sampler;uniform vec2 texSize;varying highp vec2 texCoord;void main(){vec2 texStep=1.0/texSize;vec4 color=vec4(0.0);color+=texture2D(sampler,vec2(texCoord.x,texCoord.y));color+=texture2D(sampler,vec2(texCoord.x-texStep.x,texCoord.y));color+=texture2D(sampler,vec2(texCoord.x+texStep.x,texCoord.y));color+=texture2D(sampler,vec2(texCoord.x,texCoord.y-texStep.y));color+=texture2D(sampler,vec2(texCoord.x,texCoord.y+texStep.y));gl_FragColor=color;}";

class BlueShader extends Shader {
  constructor(gl) {
    const uniforms = ['sampler', 'texSize'];
    const attributes = ['vertexPosition', 'vertexTexCoord'];

    super(gl, vertexShaderSource$4, fragmentShaderSource$4, uniforms, attributes,
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

var vertexShaderSource$5 = "uniform mediump mat4 projection;uniform mediump mat4 view;uniform mediump float elapsedTime;attribute vec2 particlePosition;attribute vec2 particleVelocity;attribute float particleEmitted;attribute vec3 particleColor;varying mediump vec4 color;void main(){vec2 position=particlePosition+particleVelocity*(elapsedTime-particleEmitted);gl_Position=projection*view*vec4(position,0.0,1.0);color=vec4(particleColor,(1000.0-(elapsedTime-particleEmitted))/1000.0);gl_PointSize=3.0;}";

var fragmentShaderSource$5 = "varying mediump vec4 color;void main(){gl_FragColor=color;}";

class ParticleShader extends Shader {
  constructor(gl) {
    const uniforms = ['projection', 'view', 'elapsedTime'];
    const attributes = ['particlePosition', 'particleVelocity',
      'particleEmitted', 'particleColor'];

    super(gl, vertexShaderSource$5, fragmentShaderSource$5, uniforms, attributes,
      8);
  }

  use(gl) {
    super.use(gl);

    gl.vertexAttribPointer(this.particlePosition, 2, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(this.particleVelocity, 2, gl.FLOAT, false, 32, 8);
    gl.vertexAttribPointer(this.particleEmitted, 1, gl.FLOAT, false, 32, 16);
    gl.vertexAttribPointer(this.particleColor, 3, gl.FLOAT, false, 32, 20);
  }
}

const MAX_PARTICLES = 512;

class ParticleSystem {
  constructor(gl) {
    this.shader = new ParticleShader(gl);

    this.particles = new Float32Array(MAX_PARTICLES * this.shader.vertexSize);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particles, gl.STATIC_DRAW);

    this.nextParticle = 0;
    this.particleCount = 0;

    this.elapsedTime = 0;
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime;
  }

  emit(gl, x, y, dx, dy, r, g, b, count) {
    for (let i = 0; i < count; i++) {
      this.nextParticle = (this.nextParticle + 1) % MAX_PARTICLES;
      this.particleCount++;

      if (this.particleCount > MAX_PARTICLES) {
        this.particleCount = MAX_PARTICLES;
      }

      let vertexIndex = this.nextParticle * this.shader.vertexSize;

      this.particles[vertexIndex++] = x;
      this.particles[vertexIndex++] = y;
      this.particles[vertexIndex++] = dx;
      this.particles[vertexIndex++] = dy;
      this.particles[vertexIndex++] = this.elapsedTime;
      this.particles[vertexIndex++] = r;
      this.particles[vertexIndex++] = g;
      this.particles[vertexIndex++] = b;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particles, gl.STATIC_DRAW);
  }

  emitRandom(gl, x, y, minSpeed, maxSpeed, r, g, b, count) {
    for (let i = 0; i < count; i++) {
      this.nextParticle = (this.nextParticle + 1) % MAX_PARTICLES;
      this.particleCount++;

      if (this.particleCount > MAX_PARTICLES) {
        this.particleCount = MAX_PARTICLES;
      }

      let vertexIndex = this.nextParticle * this.shader.vertexSize;

      const angle = Math.random() * Math.PI * 2.0;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      this.particles[vertexIndex++] = x;
      this.particles[vertexIndex++] = y;
      this.particles[vertexIndex++] = Math.cos(angle) * speed;
      this.particles[vertexIndex++] = Math.sin(angle) * speed;
      this.particles[vertexIndex++] = this.elapsedTime;
      this.particles[vertexIndex++] = r;
      this.particles[vertexIndex++] = g;
      this.particles[vertexIndex++] = b;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particles, gl.STATIC_DRAW);
  }

  draw(gl, projection, view) {
    if (this.particleCount <= 0) {
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    this.shader.use(gl);

    gl.uniformMatrix4fv(this.shader.projection, false, projection);
    gl.uniformMatrix4fv(this.shader.view, false, view);

    gl.uniform1f(this.shader.elapsedTime, this.elapsedTime);

    gl.drawArrays(gl.POINTS, 0, this.particleCount);
  }
}

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

const NUM_SNAKES = 150;
const NUM_GEMS = 5;
const NUM_HEARTS = 5;

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

    this.heartCollection = new HeartCollection(this.gl, this.basicShader,
      this.player.lives);

    this.gemCollection = new GemCollection(this.gl, this.basicShader, NUM_GEMS);

    this.snakeCollection = new SnakeCollection(this, NUM_SNAKES);

    this.collectibleGemCollection = new CollectibleGemCollection(this,
      NUM_GEMS);
    this.collectibleHeartCollection = new CollectibleHeartCollection(this,
      NUM_HEARTS);

    this.lightCone = new LightCone(this.gl);

    this.fogOfWar = new FogOfWar(this.gl, this.map.width, this.map.height);

    this.postProcessor = new PostProcessor(this.gl, this.canvas.width,
      this.canvas.height);
    this.guiPostProcessor = new PostProcessor(this.gl, this.canvas.width,
      this.canvas.height);

    this.particleSystem = new ParticleSystem(this.gl);

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

    this.snakeCollection.update(deltaTime, this);
    this.collectibleGemCollection.update(this);
    this.collectibleHeartCollection.update(this);

    this.heartCollection.update(this.player);

    this.particleSystem.update(deltaTime);

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
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fogOfWar.framebuffer);
    this.gl.viewport(0, 0, this.fogOfWar.width, this.fogOfWar.height);
    this.lightCone.draw(this.gl, this.fogOfWar.projection, this.fogOfWar.view,
      true);

    this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,
      this.postProcessor.framebuffer);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection, this.view, true);

    this.basicShader.use(this.gl);

    this.gl.uniformMatrix4fv(this.basicShader.projection, false,
      this.projection);
    this.gl.uniformMatrix4fv(this.basicShader.view, false, this.view);

    this.snakeCollection.draw(this);
    this.collectibleGemCollection.draw(this);
    this.collectibleHeartCollection.draw(this);
    this.player.draw(this.gl, this.basicShader);

    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.particleSystem.draw(this.gl, this.projection, this.view);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,
      this.guiPostProcessor.framebuffer);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.heartCollection.draw(this.gl, this.basicShader, this.player);
    this.gemCollection.draw(this.gl, this.basicShader, this.player);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.map.draw(this.gl, this.projection, this.view, false);
    this.lightCone.draw(this.gl, this.projection, this.view, false);
    this.postProcessor.draw(this.gl);
    this.gl.blendFunc(this.gl.ZERO, this.gl.SRC_ALPHA);
    this.fogOfWar.draw(this.gl, this.projection, this.view);

    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.guiPostProcessor.draw(this.gl);
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
    event.preventDefault();
    break;
  case 40: case 83: case 74:
    game.input.press(game.input.DOWN);
    event.preventDefault();
    break;
  case 37: case 65: case 72:
    game.input.press(game.input.LEFT);
    event.preventDefault();
    break;
  case 39: case 68: case 76:
    game.input.press(game.input.RIGHT);
    event.preventDefault();
    break;
  case 32: case 88: case 70:
    game.input.press(game.input.ACTION);
    event.preventDefault();
    break;
  }
});

addEventListener('keyup', event => {
  switch (event.keyCode) {
  case 38: case 87: case 75:
    game.input.release(game.input.UP);
    event.preventDefault();
    break;
  case 40: case 83: case 74:
    game.input.release(game.input.DOWN);
    event.preventDefault();
    break;
  case 37: case 65: case 72:
    game.input.release(game.input.LEFT);
    event.preventDefault();
    break;
  case 39: case 68: case 76:
    game.input.release(game.input.RIGHT);
    event.preventDefault();
    break;
  case 32: case 88: case 70:
    game.input.release(game.input.ACTION);
    event.preventDefault();
    break;
  }
});

requestAnimationFrame(updateGame);

}());
