uniform mediump mat4 projection;
uniform mediump mat4 view;
uniform mediump mat4 model;

attribute vec2 vertexPosition;

void main() {
  gl_Position = projection * view * model * vec4(vertexPosition, 0.0, 1.0);
}
