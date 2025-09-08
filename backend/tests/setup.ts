import { Sequelize } from "sequelize";

// Mock the database configuration to use in-memory SQLite
jest.mock("../config/database", () => {
  const mockSequelize = new Sequelize("sqlite::memory:", { logging: false });
  mockSequelize.authenticate = jest.fn().mockResolvedValue(undefined);
  mockSequelize.sync = jest.fn().mockResolvedValue(undefined);
  mockSequelize.close = jest.fn().mockResolvedValue(undefined);
  return mockSequelize;
});

// Mock the sequelize instance itself if needed by models directly
jest.mock("../config/sequelize", () => {
  const { Sequelize } = require("sequelize");
  const mockSequelize = new Sequelize("sqlite::memory:", { logging: false });
  mockSequelize.authenticate = jest.fn().mockResolvedValue(undefined);
  mockSequelize.sync = jest.fn().mockResolvedValue(undefined);
  mockSequelize.close = jest.fn().mockResolvedValue(undefined);
  return mockSequelize; // Export as default
});
