const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = [
  {
    name: 'server',
    // mode: env.production ? 'production' : 'development',
    mode: 'production',
    target: 'node',
    entry: {
      main: './src/app.ts',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'shebang-loader',
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs2',
    },
    plugins: [new Dotenv()],
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  {
    name: 'client',
    // mode: env.production ? 'production' : 'development',
    mode: 'production',
    entry: {
      client: './src/client.ts',
      index: './src/index.html',
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
        {
          test: /\.(html)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name(resourcePath, resourceQuery) {
                  return '[name].[ext]';
                },
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [new Dotenv()],
    watchOptions: {
      ignored: /node_modules/,
    },
  },
];
