const API_BASE_URL = "http://localhost:5000/api";

const apiService = {
  get: async <T>(endpoint: string): Promise<T> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Une erreur est survenue");
    }
    return await response.json();
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Une erreur est survenue");
    }
    return await response.json();
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Une erreur est survenue");
    }
    return await response.json();
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Une erreur est survenue");
    }
    return await response.json();
  },

  postForm: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Une erreur est survenue");
    }
    return await response.json();
  },
};

export default apiService;
