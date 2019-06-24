import glsl from 'rollup-plugin-glsl';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'build/index.js',
    format: 'iife'
  },
  plugins: [
    glsl({
      include: 'shaders/**/*'
    }),
    terser()
  ]
};
