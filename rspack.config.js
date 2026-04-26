import { resolve } from "node:path";
import { defineConfig } from "@rspack/cli";
import { SwcJsMinimizerRspackPlugin } from "@rspack/core";

export default defineConfig({
  entry: {
    main: "./demo/main.ts",
  },
  output: {
    path: resolve(import.meta.dirname, "./demo"),
  },
  optimization: {
    minimizer: [
      new SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          mangle: {
            keep_classnames: true,
          },
        },
      }),
    ],
    minimize: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
              jsx: true,
            },
            transform: {
              react: {
                runtime: "automatic",
                importSource: "sinho",
              },
            },
          },
          env: {
            targets: "> 0.25%, not dead",
          },
        },
        type: "javascript/auto",
      },
    ],
  },
  devServer: {
    static: ["./demo"],
  },
});
