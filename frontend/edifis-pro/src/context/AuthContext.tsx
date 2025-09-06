import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import userService from "../../services/userService";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean; // <-- Ajout de l'état de chargement
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: any) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // <-- Ajout de l'état de chargement
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        const expirationTime = decoded.exp * 1000;

        if (expirationTime > Date.now()) {
          const uid = decoded.id || decoded.userId || decoded.user_id || decoded.sub;
          if (uid) {
            userService.getById(uid)
              .then(setUser)
              .catch(() => {
                localStorage.removeItem("token");
                setUser(null);
              })
              .finally(() => setIsLoading(false));
          } else {
             localStorage.removeItem("token");
             setUser(null);
             setIsLoading(false);
          }
        } else {
          localStorage.removeItem("token");
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false); // Pas de token, le chargement est terminé
    }
  }, []);

  const login = async (token: string) => {
    try {
      localStorage.setItem("token", token);
      const decoded = jwtDecode<any>(token);
      const uid = decoded.id || decoded.userId || decoded.user_id || decoded.sub;
      
      if (uid) {
        const fetchedUser = await userService.getById(uid);
        setUser(fetchedUser);
      } else {
        throw new Error("User ID not found in token");
      }
    } catch (err) {
      console.error("Failed to log in:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const updateUser = async (updatedUser: any) => {
    try {
      const userIdToUpdate = updatedUser.user_id || (user && user.user_id);
      if (!userIdToUpdate) {
          console.error("User ID not found for update");
          return;
      }
      const response = await userService.update(userIdToUpdate, updatedUser);
      if (response) {
        // Refetch user to get the most up-to-date data from server
        const refreshedUser = await userService.getById(userIdToUpdate);
        setUser(refreshedUser);
        console.log("Profil mis à jour avec succès");
      } else {
        console.error("Erreur: réponse inattendue lors de la mise à jour", response);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };