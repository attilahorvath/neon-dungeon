import eslint from 'rollup-plugin-eslint';
import glsl from 'rollup-plugin-glsl';

export default {
  entry: 'src/index.js',
  dest: 'build/index.js',
  format: 'iife',
  plugins: [
    eslint({
      exclude: 'shaders/**/*'
    }),
    glsl({
      include: 'shaders/**/*'
    })
  ]
};
