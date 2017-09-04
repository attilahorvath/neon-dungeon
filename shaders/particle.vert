uniform mediump mat4 projection;
uniform mediump mat4 view;
uniform mediump float elapsedTime;

attribute vec2 particlePosition;
attribute vec2 particleVelocity;
attribute float particleEmitted;
attribute vec3 particleColor;

varying mediump vec4 color;

void main() {
  vec2 position = particlePosition + particleVelocity *
    (elapsedTime - particleEmitted);
  gl_Position = projection * view * vec4(position, 0.0, 1.0);
  color = vec4(particleColor, (1000.0 - (elapsedTime - particleEmitted)) /
    1000.0);
  gl_PointSize = 3.0;
}
