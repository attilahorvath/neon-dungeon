precision highp float;

uniform sampler2D sampler;
uniform vec2 texSize;
uniform vec2 direction;
uniform float radius;

varying highp vec2 texCoord;

void main() {
  vec2 texStep = (1.0 / texSize) * direction * radius;

  vec4 color = vec4(0.0);
  color += texture2D(sampler, texCoord - 4.0 * texStep) * 0.05;
  color += texture2D(sampler, texCoord - 3.0 * texStep) * 0.09;
  color += texture2D(sampler, texCoord - 2.0 * texStep) * 0.12;
  color += texture2D(sampler, texCoord - 1.0 * texStep) * 0.15;
  color += texture2D(sampler, texCoord + 0.0 * texStep) * 0.16;
  color += texture2D(sampler, texCoord + 1.0 * texStep) * 0.15;
  color += texture2D(sampler, texCoord + 2.0 * texStep) * 0.12;
  color += texture2D(sampler, texCoord + 3.0 * texStep) * 0.09;
  color += texture2D(sampler, texCoord + 4.0 * texStep) * 0.05;

  gl_FragColor = color;
}
