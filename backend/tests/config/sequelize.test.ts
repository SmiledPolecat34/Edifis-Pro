// Déclarer dummyModelFactory AVANT de mocker le module
const dummyModelFactory = () => ({
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  belongsToMany: jest.fn(),
});

jest.mock("../../config/database", () => ({
  authenticate: jest.fn().mockResolvedValue(undefined),
  sync: jest.fn().mockResolvedValue(undefined),
  // La fonction "define" renvoie un nouveau dummy modèle pour chaque appel
  define: jest.fn().mockImplementation(() => dummyModelFactory()),
}));

const initDB = require("../../config/sequelize");
const sequelize = require("../../config/database");

describe("Initialisation de la BDD dans sequelize.js", () => {
  let consoleLogSpy: jest.SpyInstance<void, any[]>;
  let consoleErrorSpy: jest.SpyInstance<void, any[]>;
  let processExitSpy: jest.SpyInstance<never, [(string | number | null | undefined)?]>;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(
      ((code?: string | number | null | undefined): never => {
        throw new Error("process.exit was called");
      }) as any
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("devrait authentifier et synchroniser la base de données avec succès", async () => {
    await initDB();
    expect(sequelize.authenticate).toHaveBeenCalled();
    // Mise à jour : on attend { alter: true } car c'est ce que fait votre code de production
    expect(sequelize.sync).toHaveBeenCalledWith({ alter: true });
    expect(consoleLogSpy).toHaveBeenCalledWith(" Connexion à la base de données réussie !");
    expect(consoleLogSpy).toHaveBeenCalledWith("Synchronisation des modèles Sequelize réussie !");
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("devrait enregistrer l'erreur et appeler process.exit en cas d'échec de l'authentification", async () => {
    (sequelize.authenticate as jest.Mock).mockRejectedValue(new Error("Auth error"));
    await expect(initDB()).rejects.toThrow("process.exit was called");
    expect(consoleErrorSpy).toHaveBeenCalledWith(" Erreur de connexion à la base de données :", expect.any(Error));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
