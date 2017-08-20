uniform mediump mat4 projection;
uniform mediump mat4 view;

attribute vec2 vertexPosition;

void main() {
  gl_Position = projection * view * vec4(vertexPosition, 0.0, 1.0);
}
