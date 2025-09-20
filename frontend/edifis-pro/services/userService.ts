import api from './api';
import { Competence } from './competenceService';

type RoleType = 'Admin' | 'Worker' | 'Manager' | 'HR' | 'Project_Chief';

export interface User {
  user_id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  numberphone: string;
  role: RoleType | string | { name: string };
  profile_picture?: string;
  competences?: Competence[];
}

export interface CreateUserPayload {
  firstname: string;
  lastname: string;
  email: string;
  numberphone: string;
  role: RoleType;
  competences: Competence[];
}

export interface CreateUserResponse {
  message: string;
  user: {
    user_id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: RoleType;
    numberphone: string;
  };
  tempPassword?: string;
}

const userService = {
  getAllWorkers: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users/getallworkers');
    return res.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users/all');
    return res.data;
  },

  getAllManagers: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users/all/manager');
    return res.data;
  },

  getAllProjectChiefs: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users/project-chiefs');
    return res.data;
  },

  getDirectory: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users/list');
    return res.data;
  },

  getAssignableUsers: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users/assignable-to-task');
    return res.data;
  },

  getById: async (id: number): Promise<User> => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const res = await api.put<User>(`/users/${id}`, data);
    return res.data;
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const res = await api.put<User>(`/users/${id}`, data);
    return res.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<CreateUserResponse> => {
    const res = await api.post<CreateUserResponse>('/users', payload);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/users/change-password', payload);
    return res.data;
  },

  updatePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/users/update-password', payload);
    return res.data;
  },

  uploadProfilePicture: async (file: File): Promise<{ profile_picture: string }> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const res = await api.post<{ profile_picture: string }>('/users/upload-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  suggestEmail: async (firstname: string, lastname: string): Promise<{ email: string }> => {
    const params = new URLSearchParams({ firstname, lastname });
    const res = await api.get<{ email: string }>(`/users/suggest-email?${params.toString()}`);
    return res.data;
  },
};

export default userService;
