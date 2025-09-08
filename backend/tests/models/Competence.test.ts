import { DataTypes } from "sequelize";
import Competence from "../../models/Competence";
import { sequelize } from "../../config/sequelize";

describe("Competence Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Recreate table for each test suite
  });

  afterEach(async () => {
    await Competence.destroy({ truncate: true }); // Clear data after each test
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("devrait avoir les attributs corrects", () => {
    const attributes = Competence.rawAttributes;

    expect(attributes).toHaveProperty("competence_id");
    expect(attributes.competence_id.primaryKey).toBe(true);
    expect(attributes.competence_id.autoIncrement).toBe(true);

    expect(attributes).toHaveProperty("name");
    expect(attributes.name.allowNull).toBe(false);
    expect(attributes.name.unique).toBe(true);

    expect(attributes).toHaveProperty("description");
    expect(attributes.description.allowNull).toBe(true);

    expect(attributes).toHaveProperty("isDeleted");
    expect(attributes.isDeleted.defaultValue).toBe(false);
    expect(attributes.isDeleted.allowNull).toBe(false);

    expect(attributes).toHaveProperty("deletedAt");
    expect(attributes.deletedAt.allowNull).toBe(true);

    expect(attributes).toHaveProperty("createdAt");
    expect(attributes).toHaveProperty("updatedAt");
  });

  it("devrait créer une compétence", async () => {
    const competence = await Competence.create({
      name: "JavaScript",
      description: "Programming language",
    });
    expect(competence.competence_id).toBeDefined();
    expect(competence.name).toBe("JavaScript");
    expect(competence.description).toBe("Programming language");
    expect(competence.isDeleted).toBe(false);
    expect(competence.deletedAt).toBeNull();
    expect(competence.createdAt).toBeDefined();
    expect(competence.updatedAt).toBeDefined();
  });

  it("ne devrait pas créer une compétence avec un nom en double", async () => {
    await Competence.create({ name: "Node.js" });
    await expect(Competence.create({ name: "Node.js" })).rejects.toThrow();
  });

  it("devrait soft-supprimer une compétence", async () => {
    const competence = await Competence.create({ name: "Python" });
    await competence.update({ isDeleted: true, deletedAt: new Date() });

    const foundCompetence = await Competence.findByPk(competence.competence_id);
    expect(foundCompetence.isDeleted).toBe(true);
    expect(foundCompetence.deletedAt).toBeDefined();
  });

  it("devrait récupérer uniquement les compétences non supprimées par défaut", async () => {
    await Competence.create({ name: "Active Competence 1" });
    const deletedCompetence = await Competence.create({ name: "Deleted Competence" });
    await deletedCompetence.update({ isDeleted: true, deletedAt: new Date() });
    await Competence.create({ name: "Active Competence 2" });

    const activeCompetences = await Competence.findAll({ where: { isDeleted: false } });
    expect(activeCompetences.length).toBe(2);
    expect(activeCompetences.map((c: any) => c.name)).toEqual(expect.arrayContaining(["Active Competence 1", "Active Competence 2"]));
  });
});