import WidenShader from './shaders/WidenShader';
import BlurShader from './shaders/BlurShader';
import TextureShader from './shaders/TextureShader';
import ThresholdShader from './shaders/ThresholdShader';

export default class PostProcessor {
  constructor(gl, width, height) {
    this.WIDEN = 0;
    this.BLUR = 1;
    this.TEXTURE = 2;
    this.THRESHOLD = 3;

    this.BUFFER_A = 0;
    this.BUFFER_B = 1;
    this.SMALL_BUFFER_A = 2;
    this.SMALL_BUFFER_B = 3;

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

    this.textureA = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textureA);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.framebufferA = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferA);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, this.textureA, 0);

    this.textureB = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textureB);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.framebufferB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, this.textureB, 0);

    this.smallTextureA = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.smallTextureA);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width / 4, this.height / 4, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.smallFramebufferA = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.smallFramebufferA);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, this.smallTextureA, 0);

    this.smallTextureB = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.smallTextureB);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width / 4, this.height / 4, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.smallFramebufferB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.smallFramebufferB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, this.smallTextureB, 0);

    this.widenShader = new WidenShader(gl);
    this.blurShader = new BlurShader(gl);
    this.textureShader = new TextureShader(gl);
    this.thresholdShader = new ThresholdShader(gl);

    gl.bindTexture(gl.TEXTURE_2D, null);

    this.projection = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);
  }

  draw(gl, buffer, shader, verticalBlur, blurRadius) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    switch (shader) {
    case this.BLUR:
      this.blurShader.use(gl);

      gl.uniform1i(this.blurShader.sampler, 0);
      gl.uniform2f(this.blurShader.texSize, this.width, this.height);

      if (verticalBlur) {
        gl.uniform2f(this.blurShader.direction, 0.0, 1.0);
      } else {
        gl.uniform2f(this.blurShader.direction, 1.0, 0.0);
      }

      gl.uniform1f(this.blurShader.radius, blurRadius);

      break;
    case this.WIDEN:
      this.widenShader.use(gl);

      gl.uniform1i(this.widenShader.sampler, 0);
      gl.uniform2f(this.widenShader.texSize, this.width, this.height);

      break;
    case this.TEXTURE:
      this.textureShader.use(gl);

      gl.uniformMatrix4fv(this.textureShader.projection, false,
        this.projection);
      gl.uniformMatrix4fv(this.textureShader.view, false, this.view);

      gl.uniform1i(this.textureShader.sampler, 0);

      break;
    case this.THRESHOLD:
      this.thresholdShader.use(gl);

      gl.uniformMatrix4fv(this.thresholdShader.projection, false,
        this.projection);
      gl.uniformMatrix4fv(this.thresholdShader.view, false, this.view);

      gl.uniform1i(this.thresholdShader.sampler, 0);

      break;
    }

    switch (buffer) {
    case this.BUFFER_A:
      gl.bindTexture(gl.TEXTURE_2D, this.textureA);
      break;
    case this.BUFFER_B:
      gl.bindTexture(gl.TEXTURE_2D, this.textureB);
      break;
    case this.SMALL_BUFFER_A:
      gl.bindTexture(gl.TEXTURE_2D, this.smallTextureA);
      break;
    case this.SMALL_BUFFER_B:
      gl.bindTexture(gl.TEXTURE_2D, this.smallTextureB);
      break;
    }

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
}
