import apiService from "./apiService";
import { LoginData, AuthResponse } from "../model/Auth";


const authService = {
    login: async (data: LoginData): Promise<AuthResponse> => {
        return await apiService.post<AuthResponse>("/users/login", data);
    },
};

export default authService;