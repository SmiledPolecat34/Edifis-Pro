module.exports = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
    "^.+\\.js$": ["ts-jest", { useESM: true }]
  },
  testMatch: ["**/tests/**/*.test.(ts|js)"]
};
