uniform mediump mat4 projection;
uniform mediump mat4 view;
uniform mediump mat4 model;
uniform mediump vec3 color;

attribute vec2 vertexPosition;
attribute float vertexAlpha;

varying mediump vec4 vertexColor;

void main() {
  gl_Position = projection * view * model * vec4(vertexPosition, 0.0, 1.0);
  vertexColor = vec4(color, vertexAlpha);
}
