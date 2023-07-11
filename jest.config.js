const { pathsToModuleNameMapper } = require('ts-jest');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['dist', 'temp'],
  testEnvironment: 'node',
  transform: {
    "^.+\\.ts?$": [
      "esbuild-jest",
      {
        "sourcemap": 'inline',
        "loaders": {
          ".spec.ts": "ts"
        }
      }
    ]
  },
  moduleNameMapper: pathsToModuleNameMapper({"src/*": ["src/*"]}),
  modulePaths: [
    '<rootDir>/src'
  ],
};
