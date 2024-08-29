import glsl from 'rollup-plugin-glsl';
import terser from '@rollup/plugin-terser';

const release = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: {
    file: 'build/index.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    glsl({
      include: 'shaders/**/*'
    }),
    release && terser()
  ]
};
