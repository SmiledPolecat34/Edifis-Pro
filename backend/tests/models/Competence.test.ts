import { DataTypes } from "sequelize";
import Competence from "../../models/Competence";

describe("Competence Model", () => {
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
  });

  it("devrait créer une compétence", async () => {
    const competence = await Competence.create({
      name: "JavaScript",
      description: "Programming language",
    });
    expect((competence as any).competence_id).toBeDefined();
    expect((competence as any).name).toBe("JavaScript");
    expect((competence as any).description).toBe("Programming language");
  });

  it("ne devrait pas créer une compétence avec un nom en double", async () => {
    await Competence.create({ name: "Node.js" });
    await expect(Competence.create({ name: "Node.js" })).rejects.toThrow();
  });

  it("devrait supprimer une compétence", async () => {
    const competence = await Competence.create({ name: "Python" });
    await (competence as any).destroy();

    const foundCompetence = await Competence.findByPk((competence as any).competence_id);
    expect(foundCompetence).toBeNull();
  });
});
