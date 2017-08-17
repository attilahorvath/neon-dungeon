import glsl from 'rollup-plugin-glsl';

export default {
  entry: 'src/index.js',
  dest: 'build/index.js',
  format: 'iife',
  plugins: [
    glsl({
      include: 'shaders/**/*.glsl'
    })
  ]
};
