uniform sampler2D sampler;

varying highp vec2 texCoord;

void main() {
  gl_FragColor = texture2D(sampler, texCoord);
}
