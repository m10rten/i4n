import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: ["./src/**/*.{ts,tsx}"],
  clean: !opts.watch,
}));
