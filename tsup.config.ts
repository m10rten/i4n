import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: ["./src/index.ts"],
  target: "node22",
  clean: !opts.watch,
}));
