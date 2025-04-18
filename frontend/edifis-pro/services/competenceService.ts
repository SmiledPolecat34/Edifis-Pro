import apiService from "./apiService";

export interface Competence {
  competence_id: number;
  name: string;
  description?: string;
}

const competenceService = {
  // Récupérer toutes les compétences
  getAllCompetences: async (): Promise<Competence[]> => {
    return await apiService.get<Competence[]>("/competences");
  },

  // Créer une compétence
  addCompetence: async (
    data: { name: string; description?: string }
  ): Promise<Competence> => {
    return await apiService.post<Competence>("/competences", data);
  },

  // Récupérer une compétence par ID
  getCompetenceById: async (id: number): Promise<Competence> => {
    return await apiService.get<Competence>(`/competences/${id}`);
  },

  // Mettre à jour une compétence (ici, on utilise PUT)
  updateCompetence: async (
    id: number,
    data: { name: string; description?: string }
  ): Promise<Competence> => {
    return await apiService.put<Competence>(`/competences/${id}`, data);
  },

  // Supprimer une compétence
  deleteCompetence: async (id: number): Promise<void> => {
    return await apiService.delete<void>(`/competences/${id}`);
  },
};

export default competenceService;
