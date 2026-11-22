import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: ["./src/**/*.{ts,tsx}"],
  target: "node22",
  clean: !opts.watch,
}));
