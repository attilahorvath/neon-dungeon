precision highp float;

const float tolerance = 0.1;

uniform sampler2D sampler;

varying highp vec2 texCoord;

void main() {
  gl_FragColor = step(tolerance, texture2D(sampler, texCoord));
}
