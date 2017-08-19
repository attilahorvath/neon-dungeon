import MapNode from './MapNode';
import MapShader from './MapShader';

const TILE_SIZE = 10;
const MAP_WIDTH = 640 / TILE_SIZE;
const MAP_HEIGHT = 480 / TILE_SIZE;

export default class Map {
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
          this.grid[y * MAP_WIDTH + x] = 255;
        }
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
