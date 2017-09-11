import eslint from 'rollup-plugin-eslint';
import glsl from 'rollup-plugin-glsl';
import uglify from 'rollup-plugin-uglify-es';

export default {
  input: 'src/index.js',
  output: {
    file: 'build/index.js',
    format: 'iife'
  },
  plugins: [
    eslint({
      exclude: 'shaders/**/*'
    }),
    glsl({
      include: 'shaders/**/*'
    }),
    uglify()
  ]
};
