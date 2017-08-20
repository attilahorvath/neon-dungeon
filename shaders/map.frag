precision highp float;

const float tolerance = 0.2;

uniform sampler2D sampler;
uniform mediump vec4 color;
uniform mediump vec2 quadSize;

varying highp vec2 texCoord;

void main() {
  float left = step(tolerance,
    texture2D(sampler, vec2(texCoord.x - 1.0 / quadSize.x, texCoord.y)).a);
  float right = step(tolerance,
    texture2D(sampler, vec2(texCoord.x + 1.0 / quadSize.x, texCoord.y)).a);
  float top = step(tolerance,
    texture2D(sampler, vec2(texCoord.x, texCoord.y - 1.0 / quadSize.y)).a);
  float bottom = step(tolerance,
    texture2D(sampler, vec2(texCoord.x, texCoord.y + 1.0 / quadSize.y)).a);
  float current = step(tolerance,
    texture2D(sampler, vec2(texCoord.x, texCoord.y)).a);

  float p = ((1.0 - left) + (1.0 - right) + (1.0 - top) + (1.0 - bottom)) *
    current;

  gl_FragColor = color * p;
}
