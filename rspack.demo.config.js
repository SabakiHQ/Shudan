import { resolve } from "node:path";
import { defineConfig } from "@rspack/cli";
import { SwcJsMinimizerRspackPlugin } from "@rspack/core";

export default defineConfig({
  extends: "./rspack.config.js",
  entry: {
    main: "./demo/main.ts",
  },
  output: {
    path: resolve(import.meta.dirname, "./demo"),
    filename: "main.js",
  },
  optimization: {
    minimize: false,
  },
  devServer: {
    static: ["./demo"],
  },
});
