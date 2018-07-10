import vertexShaderSource from '../../shaders/map.vert';
import fragmentShaderSource from '../../shaders/map.frag';
import Shader from '../Shader';
import MapNode from './MapNode';

const TILE_SIZE = 10;
const CORRIDOR_SIZE = 5;

export default class Map {
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

    this.shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
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
      gl.uniform4f(this.shader.roomColor, 0.07, 0.07, 0.07, 1.0);
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
