const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      { test: /\.(j|t)s$/, use: { loader: 'awesome-typescript-loader' } },
      { test: /\.(vert|frag)$/, use: { loader: 'ts-shader-loader' } }
    ]
  }
}
