import apiService from "./apiService";
import { Competence } from "./competenceService";

type RoleType = "Admin" | "Worker" | "Manager";
// Interface principale User
export interface User {
  user_id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  numberphone: string;
  role: RoleType;
  profile_picture?: string;
  competences?: Competence[];
  createdAt?: string;
  updatedAt?: string;
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
  tempPassword?: string; // <- renvoyé par le back
}

const userService = {
  // Créer un user (registre)
  createUser: async (payload: CreateUserPayload): Promise<CreateUserResponse> => {
    return await apiService.post<CreateUserResponse>("/users/register", payload);
  },

  // Récupérer tous les users
  getAllUsers: async (): Promise<User[]> => {
    return await apiService.get<User[]>("/users/all");
  },

  // Récupérer tous les managers
  getAllManagers: async (): Promise<User[]> => {
    return await apiService.get<User[]>("/users/all/manager");
  },

  // Récupérer tous les workers
  getAllWorkers: async (): Promise<User[]> => {
    return await apiService.get<User[]>("/users/getallworkers");
  },

  // Récupérer un user par ID
  getById: async (id: number): Promise<User> => {
    return await apiService.get<User>(`/users/${id}`);
  },

  // Supprimer un user
  delete: async (id: number): Promise<void> => {
    return await apiService.delete(`/users/${id}`);
  },

  // Mettre à jour un user (PUT /users/:id)
  update: async (id: number, data: Partial<User>): Promise<User> => {
    return await apiService.put<User>(`/users/${id}`, data);
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string; }): Promise<{ message: string }> => {
    return await apiService.post<{ message: string }>("/users/change-password", payload);
  },

  updatePassword: async (payload: { currentPassword: string; newPassword: string; }): Promise<{ message: string }> => {
    return await apiService.post<{ message: string }>("/users/update-password", payload);
  },

  // Upload d’une photo de profil
  uploadProfilePicture: async (
    file: File
  ): Promise<{ profile_picture: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    return await apiService.postForm<{ profile_picture: string }>(
      "/users/upload-profile",
      formData
    );
  },
  suggestEmail: async (firstname: string, lastname: string): Promise<{ email: string }> => {
    const params = new URLSearchParams({ firstname, lastname });
    return await apiService.get<{ email: string }>(`/users/suggest-email?${params.toString()}`);
  },
};

export default userService;
