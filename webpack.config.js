const path = require("path");
const webpack = require("webpack");
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
      API_URL: "http://localhost:8080",
      REACT_APP_AUTH0_DOMAIN: "",
      REACT_APP_AUTH0_CLIENT_ID: "",
      REACT_APP_AUTH0_AUDIENCE: "",
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
    host: "127.0.0.1",  // Serve at 127.0.0.1
    open: true,         // Auto-open browser
  },
};
