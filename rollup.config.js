import typescript from 'rollup-plugin-typescript2';
import glsl from 'rollup-plugin-glsl';
import uglify from 'rollup-plugin-uglify-es';

export default {
  input: 'src/index.ts',
  output: {
    file: 'build/index.js',
    format: 'iife'
  },
  plugins: [
    typescript(),
    glsl({
      include: 'shaders/**/*'
    }),
    uglify()
  ]
};
