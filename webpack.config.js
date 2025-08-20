
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
const { GenerateSW } = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
require("dotenv").config();

<<<<<<< HEAD
module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    watch: false,
    mode: argv.mode || "development",
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
      ...(isProduction
        ? [
            new GenerateSW({
              clientsClaim: true,
              skipWaiting: true,
              maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // allow files up to 5MB
            })
          ]
        : []),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public/manifest.json', to: 'manifest.json' },
          { from: 'public/icons', to: 'icons' },
          { from: 'public/screenshots', to: 'screenshots' }
        ]
      })
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
=======

const isProduction = process.env.NODE_ENV === 'production';
const useHttps = process.env.USE_HTTPS === 'true';

module.exports = {
  watch: false,
  mode: isProduction ? "production" : "development",
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
    ...(isProduction
      ? [
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          // Add a cache version
          runtimeCaching: [
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources-v2', // <- bump this to bust cache
              },
            },
          ],
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html', // <-- key line for React Router!
          exclude: [/index\.html/],         // Don't precache index.html manually
        })
      ]
      : []),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/icons', to: 'icons' },
        { from: 'public/screenshots', to: 'screenshots' }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: { safari: "13" },
                  useBuiltIns: "entry",
                  corejs: 3,
                },
              ],
              "@babel/preset-react",
            ],
>>>>>>> origin/main
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[hash][ext][query]",
          },
        },
<<<<<<< HEAD
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
      host: "127.0.0.1",
      port: 3000,
      allowedHosts: "all",
      historyApiFallback: true,
    },
  };
=======
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
    host: "127.0.0.1",
    port: 3000,
    allowedHosts: "all",
    historyApiFallback: true,
    server: useHttps ? "https" : "http",
    hot: true,
  },
>>>>>>> origin/main
};
