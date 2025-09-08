import { DataTypes } from "sequelize";
import UserCompetence from "../../models/UserCompetence";
import { sequelize } from "../../config/sequelize";

describe("UserCompetence Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Recreate table for each test suite
  });

  afterEach(async () => {
    await UserCompetence.destroy({ truncate: true }); // Clear data after each test
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("devrait avoir les attributs corrects et une clé primaire composite", () => {
    const attributes = UserCompetence.rawAttributes;

    expect(attributes).toHaveProperty("user_id");
    expect(attributes.user_id.primaryKey).toBe(true);
    expect(attributes.user_id.type.key).toEqual(DataTypes.INTEGER.key);

    expect(attributes).toHaveProperty("competence_id");
    expect(attributes.competence_id.primaryKey).toBe(true);
    expect(attributes.competence_id.type.key).toEqual(DataTypes.INTEGER.key);

    expect(attributes).toHaveProperty("createdAt");
    expect(attributes).toHaveProperty("updatedAt");
  });

  it("devrait créer une association utilisateur-compétence", async () => {
    const userCompetence = await UserCompetence.create({
      user_id: 1,
      competence_id: 101,
    });
    expect(userCompetence.user_id).toBe(1);
    expect(userCompetence.competence_id).toBe(101);
    expect(userCompetence.createdAt).toBeDefined();
    expect(userCompetence.updatedAt).toBeDefined();
  });

  it("ne devrait pas créer une association en double", async () => {
    await UserCompetence.create({
      user_id: 2,
      competence_id: 201,
    });

    await expect(
      UserCompetence.create({
        user_id: 2,
        competence_id: 201,
      })
    ).rejects.toThrow();
  });

  it("devrait supprimer une association utilisateur-compétence", async () => {
    await UserCompetence.create({
      user_id: 3,
      competence_id: 301,
    });

    const deletedRows = await UserCompetence.destroy({
      where: {
        user_id: 3,
        competence_id: 301,
      },
    });
    expect(deletedRows).toBe(1);

    const found = await UserCompetence.findOne({
      where: {
        user_id: 3,
        competence_id: 301,
      },
    });
    expect(found).toBeNull();
  });
});
