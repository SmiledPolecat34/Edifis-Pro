import apiService from "./apiService";

// Interface pour une tâche
export interface Task {
  task_id: number;
  name: string;
  description: string;
  status: string;
  start_date?: string;
  end_date?: string;
  users: {
    user_id: number;
    firstname: string;
    lastname: string;
    email: string;
    profile_picture?: string;
  }[];
}

// Service pour gérer les tâches
const taskService = {
  // Récupérer toutes les tâches
  getAll: async (): Promise<Task[]> => {
    return await apiService.get<Task[]>("/tasks");
  },

  // Récupérer une tâche par ID
  getById: async (id: number): Promise<Task> => {
    return await apiService.get<Task>(`/tasks/${id}`);
  },

  // Mettre à jour une tâche
  update: async (id: number, data: Partial<Task>): Promise<Task> => {
    return await apiService.put<Task>(`/tasks/${id}`, data);
  },

  // Créer une tâche
  create: async (data: Partial<Task>): Promise<Task> => {
    return await apiService.post<Task>("/tasks", data);
  },

  // Assigner des utilisateurs à une tâche
  assignUsers: async (taskId: number, userIds: number[]): Promise<void> => {
    return await apiService.post<void>(`/tasks/assign`, { taskId, userIds });
  },

  // Supprimer une tâche
  delete: async (id: number): Promise<void> => {
    return await apiService.delete<void>(`/tasks/${id}`);
  },

  // Récupérer les tâches assignées à un utilisateur spécifique
  getByUserId: async (userId: number) => {
    return apiService.get(`/tasks/user/${userId}`);
  },
};

export default taskService;
