uniform mediump float maxAlpha;

varying mediump vec4 color;

void main() {
  gl_FragColor = vec4(color.rgb, 1.0) * (1.0 - step(maxAlpha, color.a));
}
