uniform mediump mat4 projection;

attribute vec2 position;

void main() {
  gl_Position = projection * vec4(position, 0.0, 1.0);
}
