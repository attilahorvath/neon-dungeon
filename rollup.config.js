import eslint from 'rollup-plugin-eslint';
import glsl from 'rollup-plugin-glsl';

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
    })
  ]
};
