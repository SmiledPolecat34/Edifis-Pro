const API_BASE_URL =
  // configurable via Vite: define VITE_API_URL in a .env file at frontend/edifis-pro
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  // fallback (dev): backend exposed by docker-compose on port 5001
  "http://localhost:5001/api";

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

  post: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    let bodyText = "";
    try {
      bodyText = await res.text(); // on lit une seule fois
      const json = bodyText ? JSON.parse(bodyText) : {};
      if (!res.ok) {
        console.error("API POST error:", res.status, json);
        throw new Error(json.message || json.error || `HTTP ${res.status}`);
      }
      return json as T;
    } catch (e) {
      // si le body n’est pas du JSON
      if (!res.ok) {
        console.error("API POST error (raw):", res.status, bodyText);
        throw new Error(`HTTP ${res.status} - ${bodyText || "Erreur inconnue"}`);
      }
      throw e;
    }
  },

  put: async <T>(endpoint: string, data: unknown): Promise<T> => {
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
