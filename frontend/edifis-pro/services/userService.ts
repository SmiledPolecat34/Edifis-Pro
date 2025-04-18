import apiService from "./apiService";
import { Competence } from "./competenceService";

// Interface principale User
export interface User {
  user_id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  numberphone: string;
  role: "Admin" | "Worker" | "Manager";
  profile_picture?: string;

  competences?: Competence[];
  createdAt?: string;
  updatedAt?: string;
}

const userService = {
  // Créer un user (registre)
  createUser: async (data: User): Promise<User> => {
    return await apiService.post<User>("/users/register", data);
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
};

export default userService;
