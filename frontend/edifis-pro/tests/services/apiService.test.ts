import apiService from "../../services/apiService";

// On simule la fonction fetch globale
global.fetch = jest.fn();

describe("apiService", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("devrait retourner les données quand la réponse est ok", async () => {
    const mockData = { success: true };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const data = await apiService.post("/test", { foo: "bar" });
    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foo: "bar" }),
      })
    );
  });

  it("devrait lancer une erreur si la réponse n'est pas ok", async () => {
    const errorMessage = "Bad Request";
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    await expect(apiService.post("/test", { foo: "bar" })).rejects.toEqual(errorMessage);
  });

  it("devrait lancer une erreur de connexion si fetch échoue", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

    await expect(apiService.post("/test", { foo: "bar" })).rejects.toEqual("Network Error");
  });
});
