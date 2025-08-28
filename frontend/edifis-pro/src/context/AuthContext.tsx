import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import userService from "../../services/userService";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (updatedUser: any) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // Utilisateur connecté
  const [tokenId, setTokenId] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode<any>(token);
      console.log("[AuthContext] Token décodé au mount :", decoded);

      const expirationTime = decoded.exp * 1000;
      if (expirationTime > Date.now()) {
        const uid = decoded.userId || decoded.user_id || decoded.sub;
        console.log("[AuthContext] UID extrait au mount:", uid);

        if (uid) {
          setTokenId(uid);
          setIsAuthenticated(true);

          userService.getById(uid)
            .then((response) => {
              setUser(response);
              console.log("[AuthContext] user chargé au mount:", response);
            })
            .catch((err) => {
              console.error("[AuthContext] Erreur récupération user au mount:", err);
              logout();
            });
        }
      } else {
        setIsAuthenticated(false);
        setTokenId(null);
      }
    } catch (error) {
      console.error("[AuthContext] Erreur décodage token:", error);
      setIsAuthenticated(false);
      setTokenId(null);
    }
  }
}, []);


  const userData = async () => {
    if (tokenId) {
      try {
        const response = await userService.getById(tokenId);
        if (response && response.role) {
          setUser(response);
        } else {
          console.error(
            "La réponse de l'API ne correspond pas au format attendu :",
            response
          );
          logout();
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des informations utilisateur :",
          error
        );
        logout();
      }
    }
  };

  useEffect(() => {
    console.log("[AuthContext] tokenId:", tokenId);
  }, [tokenId]);

  useEffect(() => {
    console.log("[AuthContext] user mis à jour:", user);
  }, [user]);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
   const decoded = jwtDecode<any>(token);
    console.log("[AuthContext] Token décodé :", decoded);
      
    // 👇 essaye plusieurs clés possibles (sub, userId, user_id…)
    const uid = decoded.userId || decoded.user_id || decoded.sub;
    console.log("[AuthContext] UID extrait :", uid);
      
    setTokenId(uid);

    setIsAuthenticated(true);

    try {
      const response = await userService.getById(uid);
      setUser(response);
    } catch (err) {
      console.error("Erreur récupération user après login:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setTokenId(null);
    setUser(null); // Réinitialisation des données utilisateur lors de la déconnexion
    navigate("/login");
  };
  const updateUser = async (updatedUser: any) => {
    try {
      const response = await userService.update(
        updatedUser.user_id,
        updatedUser
      );
      if (response) {
        setUser((prevUser: any) => ({
          ...prevUser,
          ...updatedUser, // Mise à jour locale de l'utilisateur dans le contexte
        }));
        console.log("Profil mis à jour avec succès");
      } else {
        console.error(
          "Erreur: réponse inattendue lors de la mise à jour",
          response
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, updateUser }}
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
