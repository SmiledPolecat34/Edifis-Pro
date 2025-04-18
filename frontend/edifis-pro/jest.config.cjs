module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.spec.json"
    }
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/tests/**/*.test.(ts|tsx|js)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};
