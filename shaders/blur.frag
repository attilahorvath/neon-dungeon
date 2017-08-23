precision highp float;

uniform sampler2D sampler;
uniform vec2 texSize;

varying highp vec2 texCoord;

void main() {
  vec2 texStep = 1.0 / texSize;

  vec4 color = vec4(0.0);
  color += texture2D(sampler, vec2(texCoord.x, texCoord.y));
  color += texture2D(sampler, vec2(texCoord.x - texStep.x, texCoord.y));
  color += texture2D(sampler, vec2(texCoord.x + texStep.x, texCoord.y));
  color += texture2D(sampler, vec2(texCoord.x, texCoord.y - texStep.y));
  color += texture2D(sampler, vec2(texCoord.x, texCoord.y + texStep.y));

  gl_FragColor = color;
}
