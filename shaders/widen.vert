attribute vec2 vertexPosition;
attribute vec2 vertexTexCoord;

varying highp vec2 texCoord;

void main() {
  gl_Position = vec4(vertexPosition, 0.0, 1.0);
  texCoord = vertexTexCoord;
}
