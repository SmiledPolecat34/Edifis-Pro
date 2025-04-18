import authService from "../../services/authService";
import apiService from "../../services/apiService";
import { LoginData, AuthResponse } from "../../model/Auth";

// On simule le module apiService
jest.mock("../../services/apiService");

describe("authService", () => {
  it("devrait appeler apiService.post avec le bon endpoint et renvoyer la réponse", async () => {
    const loginData: LoginData = { email: "test@example.com", password: "secret" };
    const fakeResponse: AuthResponse = {
        token: "fake-token",
        user: { id: "1", email: "test@example.com" }
      };
      

    // On simule que apiService.post renvoie fakeResponse
    (apiService.post as jest.Mock).mockResolvedValue(fakeResponse);

    const response = await authService.login(loginData);

    // Vérifier que l'endpoint et les données ont bien été passés
    expect(apiService.post).toHaveBeenCalledWith("/users/login", loginData);
    // Vérifier que la réponse est celle attendue
    expect(response).toEqual(fakeResponse);
  });
});
