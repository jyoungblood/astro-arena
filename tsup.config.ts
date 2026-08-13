import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    api: "src/api.ts",
    index: "src/index.ts",
  },
  format: ["esm"],
  minify: false,
  sourcemap: true,
  splitting: false,
  target: "node20",
});
