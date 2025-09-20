import apiService from './apiService';
import { ConstructionSite } from './constructionSiteService';

export type TaskStatus = 'Prévu' | 'En cours' | 'Annulé' | 'Terminé' | 'En attente de validation';
export interface TaskUser {
  user_id: number;
  firstname: string;
  lastname: string;
  email: string;
  profile_picture?: string;
}

export interface Task {
  task_id: number;
  name: string;
  description: string;
  status: TaskStatus;
  start_date?: string;
  end_date?: string;
  users: TaskUser[];
  construction_site?: ConstructionSite;
}

const taskService = {
  // Récupérer toutes les tâches
  getAll: async (): Promise<Task[]> => {
    const res = await apiService.get<Task[]>('/tasks');
    return res as Task[]; // <- cast explicite pour éviter le "unknown"
  },

  // Récupérer une tâche par ID
  getById: async (id: number): Promise<Task> => {
    const res = await apiService.get<Task>(`/tasks/${id}`);
    return res as Task;
  },

  // Mettre à jour une tâche
  update: async (id: number, data: Partial<Task>): Promise<Task> => {
    const res = await apiService.put<Task>(`/tasks/${id}`, data);
    return res as Task;
  },

  // Créer une tâche
  create: async (data: Partial<Task>): Promise<Task> => {
    const res = await apiService.post<Task>('/tasks', data);
    return res as Task;
  },

  // Assigner des utilisateurs à une tâche
  assignUsers: async (taskId: number, userIds: number[]): Promise<void> => {
    await apiService.post<void>(`/tasks/assign`, { taskId, userIds });
  },

  // Supprimer une tâche
  delete: async (id: number): Promise<void> => {
    await apiService.delete<void>(`/tasks/${id}`);
  },

  // Récupérer les tâches assignées à un utilisateur spécifique
  getByUserId: async (userId: number): Promise<Task[]> => {
    const res = await apiService.get<Task[]>(`/tasks/user/${userId}`);
    return res as Task[];
  },

  getByConstructionSiteId: async (siteId: number): Promise<Task[]> => {
    const res = await apiService.get<Task[]>(`/tasks/site/${siteId}`);
    return res as Task[];
  },
};

export default taskService;
