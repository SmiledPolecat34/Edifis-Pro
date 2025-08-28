import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

import Loading from "../loading/Loading";

interface ProtectedRouteProps {
    requiredRoles?: string[]; // Liste des rôles autorisés
}

const ProtectedRoute = ({ requiredRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <Loading />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles && user?.role) {
        const roleName =
            typeof user.role === "string" ? user.role : user.role.name;
        
        const normalizedRole = roleName?.toLowerCase();
        const normalizedRequired = requiredRoles.map(r => r.toLowerCase());
        
        if (!normalizedRequired.includes(normalizedRole)) {
            return <Navigate to="/" replace />;
        }
    }



    return <Outlet />;
};

export default ProtectedRoute;