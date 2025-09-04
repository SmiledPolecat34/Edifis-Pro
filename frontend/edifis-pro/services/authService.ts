import axios, { AxiosError } from "axios";
import { LoginData } from "../model/Auth";

const env = import.meta.env;

// Normalize base URL to ensure it contains "/api"
const rawBase = env?.VITE_API_URL || "http://localhost:5000/api";
const normalizedBase = (() => {
    const trimmed = rawBase.replace(/\/$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
})();

const api = axios.create({
    baseURL: normalizedBase,
});


export interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        role: string;
    };
}

export default {
    login: async (data: LoginData): Promise<LoginResponse> => {
        try {
            const res = await api.post<LoginResponse>("/auth/login", data);
            return res.data;
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            const msg =
                axiosErr.response?.data?.message ??
                axiosErr.response?.statusText ??
                "Une erreur est survenue";
            throw new Error(msg);
        }
    },
};
