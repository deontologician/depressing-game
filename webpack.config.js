const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/game.ts',
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      {
        test: /src\/.*\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s?css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" },
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Depressing Game',
    })
  ],
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  },
  output: {
    filename: 'depressing_game.js',
    path: path.resolve(__dirname, 'dist'),
  }
}
