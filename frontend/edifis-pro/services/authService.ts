import { AxiosError } from 'axios';
import { LoginData } from '../model/Auth';
import api from './api';

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
      const res = await api.post<LoginResponse>('/auth/login', data);
      return res.data;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg =
        axiosErr.response?.data?.message ??
        axiosErr.response?.statusText ??
        'Une erreur est survenue';
      throw new Error(msg);
    }
  },
};
