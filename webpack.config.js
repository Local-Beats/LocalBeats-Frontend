const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
const { GenerateSW } = require('workbox-webpack-plugin')
require("dotenv").config();

module.exports = {
  mode: "development",
  entry: "./src/App.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    publicPath: "/", // needed for React Router
  },
  devtool: "source-map",
  plugins: [
    new webpack.EnvironmentPlugin({
      API_URL: "http://127.0.0.1:8080",
      REACT_APP_AUTH0_DOMAIN: "",
      REACT_APP_AUTH0_CLIENT_ID: "",
      REACT_APP_AUTH0_AUDIENCE: "",
      REACT_APP_GOOGLE_MAPS_API_KEY: "",
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[hash][ext][query]",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    historyApiFallback: true,
    port: 3000,
    host: "127.0.0.1",
    open: true,         // Auto-open browser
  },
};
