precision highp float;

const float tolerance = 0.2;

uniform sampler2D sampler;
uniform mediump vec4 wallColor;
uniform mediump vec4 roomColor;
uniform mediump vec2 quadSize;

varying highp vec2 texCoord;

void main() {
  vec2 quadStep = 1.0 / quadSize;

  float neighbors = 0.0;
  neighbors += 1.0 - step(tolerance,
    texture2D(sampler, vec2(texCoord.x - quadStep.x, texCoord.y)).a);
  neighbors += 1.0 - step(tolerance,
    texture2D(sampler, vec2(texCoord.x + quadStep.x, texCoord.y)).a);
  neighbors += 1.0 - step(tolerance,
    texture2D(sampler, vec2(texCoord.x, texCoord.y - quadStep.y)).a);
  neighbors += 1.0 - step(tolerance,
    texture2D(sampler, vec2(texCoord.x, texCoord.y + quadStep.y)).a);

  float current = step(tolerance,
    texture2D(sampler, vec2(texCoord.x, texCoord.y)).a);

  float wall = neighbors * current;

  gl_FragColor = wallColor * wall + roomColor * current;
}
