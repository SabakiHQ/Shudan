import { defineConfig } from "@rspack/cli";

export default defineConfig({
  entry: {
    main: "./src/main.ts",
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
