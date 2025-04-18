import apiService from "./apiService";

export interface ConstructionSite {
  construction_site_id?: number;
  name: string;
  description?: string;
  adresse?: string;
  state?: "En cours" | "Terminé" | "Annulé" | "Prevu";
  start_date?: string; // stockées en "YYYY-MM-DD"
  end_date?: string;
  image_url?: string;
  chef_de_projet_id?: number; // manager
}

// Service pour gérer les chantiers
const constructionSiteService = {
  // Ajouter un chantier (avec image) via multipart/form-data
  create: async (formData: FormData): Promise<ConstructionSite> => {
    // ICI on utilise la méthode postForm (multipart), pas un JSON classique
    return await apiService.postForm<ConstructionSite>(
      "/construction-sites",
      formData
    );
  },

  // Mettre à jour un chantier (JSON, si tu as besoin)
  update: async (
    id: number,
    data: Partial<ConstructionSite>
  ): Promise<ConstructionSite> => {
    return await apiService.put<ConstructionSite>(`/construction-sites/${id}`, data);
  },

  // Supprimer un chantier
  delete: async (id: number): Promise<void> => {
    return await apiService.delete<void>(`/construction-sites/${id}`);
  },

  // Récupérer tous les chantiers
  getAll: async (): Promise<ConstructionSite[]> => {
    return await apiService.get<ConstructionSite[]>("/construction-sites");
  },

  // Récupérer un chantier par ID
  getById: async (id: number): Promise<ConstructionSite> => {
    return await apiService.get<ConstructionSite>(`/construction-sites/${id}`);
  },
};

export default constructionSiteService;
