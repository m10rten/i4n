import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
