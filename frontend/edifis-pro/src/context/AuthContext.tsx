import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import userService from '../../services/userService';
import apiService from '../../services/apiService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  isMaintenance: boolean; // Add maintenance state
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: any) => Promise<void>;
  toggleMaintenance: () => Promise<void>; // Add toggle function
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false); // Add maintenance state
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Trouve le statut de maintenance au chargement initial
    apiService
      .get<{ maintenance_mode: boolean }>('/status')
      .then(response => setIsMaintenance(response.maintenance_mode))
      .catch(() => setIsMaintenance(false)); // En cas d'erreur, suppose que le mode maintenance est désactivé

    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        const expirationTime = decoded.exp * 1000;

        if (expirationTime > Date.now()) {
          const uid = decoded.id || decoded.userId || decoded.user_id || decoded.sub;
          if (uid) {
            userService
              .getById(uid)
              .then(setUser)
              .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
              })
              .finally(() => setIsLoading(false));
          } else {
            localStorage.removeItem('token');
            setUser(null);
            setIsLoading(false);
          }
        } else {
          localStorage.removeItem('token');
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoading(false);
        console.log(error);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (token: string) => {
    try {
      localStorage.setItem('token', token);

      const decoded = jwtDecode<any>(token);
      const uid = decoded.id || decoded.userId || decoded.user_id || decoded.sub;

      if (uid) {
        const fetchedUser = await userService.getById(uid);
        setUser(fetchedUser);
      } else {
        throw new Error('User ID not found in token');
      }
    } catch (err) {
      console.error('Failed to log in:', err);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !!user;

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(
        () => {
          if (isAuthenticated) {
            logout();
          }
        },
        40 * 60 * 1000,
      ); // 40 minutes
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];

    if (isAuthenticated) {
      activityEvents.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
      resetTimer();
    }

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);

  const updateUser = async (updatedUser: any) => {
    try {
      const userIdToUpdate = updatedUser.user_id || (user && user.user_id);
      if (!userIdToUpdate) {
        console.error('User ID not found for update');
        return;
      }
      const response = await userService.updateUser(userIdToUpdate, updatedUser);
      if (response) {
        const refreshedUser = await userService.getById(userIdToUpdate);
        setUser(refreshedUser);
        console.log('Profil mis à jour avec succès');
      } else {
        console.error('Erreur: réponse inattendue lors de la mise à jour', response);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
    }
  };

  const toggleMaintenance = async () => {
    try {
      const response = await apiService.post<{ maintenance_mode: boolean }>('/status/toggle', {});
      setIsMaintenance(response.maintenance_mode);
      alert(`Mode maintenance ${response.maintenance_mode ? 'activé' : 'désactivé'}`);
    } catch (err) {
      alert('Erreur lors du changement de mode de maintenance.');
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        isMaintenance,
        login,
        logout,
        updateUser,
        toggleMaintenance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
