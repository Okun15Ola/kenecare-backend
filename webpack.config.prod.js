const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const webpack = require("webpack");

const CURRENT_WORKING_DIR = process.cwd();

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
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     { from: "./src/logs", to: "logs" },
    //     { from: "./src/public", to: "public" },
    //   ],
    // }),
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
