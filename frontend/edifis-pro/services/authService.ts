import axios, { AxiosError } from "axios";
import { LoginData } from "../model/Auth";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

export interface LoginResponse {
    token: string;
}

export default {
    login: async (data: LoginData): Promise<LoginResponse> => {
        try {
            const res = await api.post<LoginResponse>("/users/login", data);
            return res.data;
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;

            /*  On remonte un message propre :
                - s’il existe dans la réponse backend  : axiosErr.response.data.message
                - sinon un fallback générique.                                            */
            const msg =
                axiosErr.response?.data?.message ??
                axiosErr.response?.statusText ??
                "Une erreur est survenue";

            throw new Error(msg);
        }
    },
};
