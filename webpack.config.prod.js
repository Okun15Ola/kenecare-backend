const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const CURRENT_WORKING_DIR = process.cwd();

module.exports = {
  name: "server",
  mode: "production",
  target: "node",
  externals: [nodeExternals()],
  entry: [path.join(CURRENT_WORKING_DIR, "./src/server.js")],
  output: {
    path: path.join(CURRENT_WORKING_DIR, "./dist"),
    filename: "server.bundle.js",
    publicPath: "/dist/",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Use Babel for transpiling
          options: {
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
    // new CopyWebpackPlugin({
    //   patterns: [
    //     { from: "./src/logs", to: "logs" },
    //     { from: "./src/public", to: "public" },
    //   ],
    // }),
  ],

  optimization: {
    minimize: false, // Disable code minimization for readability (enable in production if needed)
  },
  stats: "minimal", // Control the build output stats
};
