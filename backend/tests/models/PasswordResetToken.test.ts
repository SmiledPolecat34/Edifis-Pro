const { DataTypes } = require("sequelize");
const PasswordResetToken = require("../../models/PasswordResetToken");

// Mock the database configuration to use in-memory SQLite
jest.mock("../../config/database", () => {
  const { Sequelize } = require("sequelize");
  return new Sequelize("sqlite::memory:", { logging: false });
});

const sequelize = require("../../config/database");

describe("PasswordResetToken Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Recreate table for each test suite
  });

  afterEach(async () => {
    await PasswordResetToken.destroy({ truncate: true }); // Clear data after each test
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("devrait avoir les attributs corrects", () => {
    const attributes = PasswordResetToken.rawAttributes;

    expect(attributes).toHaveProperty("id");
    expect(attributes.id.primaryKey).toBe(true);
    expect(attributes.id.autoIncrement).toBe(true);

    expect(attributes).toHaveProperty("user_id");
    expect(attributes.user_id.allowNull).toBe(false);

    expect(attributes).toHaveProperty("token_hash");
    expect(attributes.token_hash.allowNull).toBe(false);
    expect(attributes.token_hash.unique).toBe(true);
    expect(attributes.token_hash.type).toEqual(DataTypes.STRING(64));

    expect(attributes).toHaveProperty("expires_at");
    expect(attributes.expires_at.allowNull).toBe(false);

    expect(attributes).toHaveProperty("used_at");
    expect(attributes.used_at.allowNull).toBe(true);

    expect(attributes).toHaveProperty("ip");
    expect(attributes.ip.allowNull).toBe(true);

    expect(attributes).toHaveProperty("user_agent");
    expect(attributes.user_agent.allowNull).toBe(true);
  });

  it("devrait créer un jeton de réinitialisation de mot de passe", async () => {
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    const token = await PasswordResetToken.create({
      user_id: 1,
      token_hash: "some_unique_hash_1234567890123456789012345678901234567890",
      expires_at: expiresAt,
      ip: "192.168.1.1",
      user_agent: "Mozilla/5.0",
    });

    expect(token.id).toBeDefined();
    expect(token.user_id).toBe(1);
    expect(token.token_hash).toBe("some_unique_hash_1234567890123456789012345678901234567890");
    expect(token.expires_at.getTime()).toBe(expiresAt.getTime());
    expect(token.used_at).toBeNull();
    expect(token.ip).toBe("192.168.1.1");
    expect(token.user_agent).toBe("Mozilla/5.0");
  });

  it("ne devrait pas créer un jeton avec un token_hash en double", async () => {
    const expiresAt = new Date(Date.now() + 3600000);
    await PasswordResetToken.create({
      user_id: 1,
      token_hash: "duplicate_hash_1234567890123456789012345678901234567890",
      expires_at: expiresAt,
    });

    await expect(
      PasswordResetToken.create({
        user_id: 2,
        token_hash: "duplicate_hash_1234567890123456789012345678901234567890",
        expires_at: expiresAt,
      })
    ).rejects.toThrow();
  });

  it("devrait marquer un jeton comme utilisé", async () => {
    const expiresAt = new Date(Date.now() + 3600000);
    const token = await PasswordResetToken.create({
      user_id: 1,
      token_hash: "mark_used_hash_1234567890123456789012345678901234567890",
      expires_at: expiresAt,
    });

    const usedDate = new Date();
    await token.update({ used_at: usedDate });

    const foundToken = await PasswordResetToken.findByPk(token.id);
    expect(foundToken.used_at.getTime()).toBeGreaterThanOrEqual(usedDate.getTime() - 1000); // Allow for slight time difference
  });

  it("devrait vérifier si un jeton est expiré", async () => {
    const expiredToken = await PasswordResetToken.create({
      user_id: 1,
      token_hash: "expired_hash_1234567890123456789012345678901234567890",
      expires_at: new Date(Date.now() - 1000), // 1 second ago
    });

    const activeToken = await PasswordResetToken.create({
      user_id: 2,
      token_hash: "active_hash_1234567890123456789012345678901234567890",
      expires_at: new Date(Date.now() + 1000), // 1 second from now
    });

    // This check would typically be done in a service or controller, but we can test the date logic here
    expect(new Date(expiredToken.expires_at).getTime()).toBeLessThan(Date.now());
    expect(new Date(activeToken.expires_at).getTime()).toBeGreaterThan(Date.now());
  });
});
