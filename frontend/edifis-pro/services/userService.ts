import apiService from './apiService';
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
  createdAt?: Date;
  updatedAt?: Date;
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

export interface UpdateUserPayload {
  firstname?: string;
  lastname?: string;
  email?: string;
  numberphone?: string;
  role?: RoleType | string;
  competences?: number[];
}

const userService = {
  getAllWorkers: async (): Promise<User[]> => {
    return await apiService.get<User[]>('/users/getallworkers');
  },

  getAllUsers: async (): Promise<User[]> => {
    return await apiService.get<User[]>('/users/all');
  },

  getAllManagers: async (): Promise<User[]> => {
    return await apiService.get<User[]>('/users/all/manager');
  },

  getAllProjectChiefs: async (): Promise<User[]> => {
    return await apiService.get<User[]>('/users/project-chiefs');
  },

  getDirectory: async (): Promise<User[]> => {
    return await apiService.get<User[]>('/users/list');
  },

  getAssignableUsers: async (): Promise<User[]> => {
    return await apiService.get<User[]>('/users/assignable-to-task');
  },

  getById: async (id: number) => {
    return await apiService.get(`/users/${id}`);
  },

  update: async (id: number, data: Partial<User>) => {
    return await apiService.put<User>(`/users/${id}`, data);
  },

  updateUser: async (id: number, data: Partial<User>) => {
    return await apiService.put<User>(`/users/${id}`, data);
  },

  createUser: async (payload: CreateUserPayload): Promise<CreateUserResponse> => {
    return await apiService.post<CreateUserResponse>('/users', payload);
  },

  delete: async (id: number): Promise<void> => {
    return await apiService.delete(`/users/${id}`);
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return await apiService.post<{ message: string }>('/users/change-password', payload);
  },

  updatePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return await apiService.post<{ message: string }>('/users/update-password', payload);
  },

  uploadProfilePicture: async (file: File): Promise<{ profile_picture: string }> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return await apiService.postForm<{ profile_picture: string }>(
      '/users/upload-profile',
      formData,
    );
  },

  suggestEmail: async (firstname: string, lastname: string): Promise<{ email: string }> => {
    const params = new URLSearchParams({ firstname, lastname });
    return await apiService.get<{ email: string }>(`/users/suggest-email?${params.toString()}`);
  },
};

export default userService;
