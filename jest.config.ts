import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest/presets/default-esm", // ESM preset
  extensionsToTreatAsEsm: [".ts"], // Treat .ts as ESM
  moduleNameMapper: {
    "^(.+)\\.js$": "$1", // Allow .js imports to resolve .ts sources[9]
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["ts", "js"],
};

export default config;
