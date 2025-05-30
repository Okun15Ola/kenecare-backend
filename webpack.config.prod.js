const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const dotenv = require("dotenv");
const webpack = require("webpack");

const CURRENT_WORKING_DIR = process.cwd();

// Load environment variables from .env.production
const env =
  dotenv.config({ path: path.resolve(CURRENT_WORKING_DIR, ".env.production") })
    .parsed || {};

// Convert to format expected by DefinePlugin
const envKeys = Object.keys(env).reduce((prev, next) => {
  return {
    ...prev,
    [`process.env.${next}`]: JSON.stringify(env[next]),
  };
}, {});

module.exports = {
  name: "server",
  mode: "production",
  entry: [path.join(CURRENT_WORKING_DIR, "./src/server.js")],
  target: "node",

  output: {
    path: path.join(CURRENT_WORKING_DIR, "./dist/"),
    filename: "server.bundle.js",
    publicPath: "/dist/",
    clean: true,
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Use Babel for transpiling
          options: {
            cacheDirectory: true,
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".json"], // Resolve these extensions
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static", // Generates a static HTML report
      openAnalyzer: false, // Prevents opening the report automatically
      reportFilename: "bundle-report.html", // Name of the report file
    }),
    new webpack.DefinePlugin({
      ...envKeys,
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],

  optimization: {
    minimize: true, // Disable code minimization for readability (enable in production if needed)
    nodeEnv: "production",
  },
  performance: {
    hints: false,
  },
  stats: {
    all: false,
    errors: true,
    warnings: true,
  },
};
