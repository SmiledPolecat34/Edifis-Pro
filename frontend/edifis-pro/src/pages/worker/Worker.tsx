import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import userService, { User } from "../../../services/userService";
import { useAuth } from "../../context/AuthContext.tsx";

import Loading from "../../components/loading/Loading";

// URL d'image par défaut pour les ouvriers
const DEFAULT_IMAGE = "https://www.capcampus.com/img/u/1/job-etudiant-batiment.jpg";

export default function Workers() {
    const { user } = useAuth();
    const [workers, setWorkers] = useState<User[]>([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Exemple : si Admin tu prends tous, sinon seulement les ouvriers
      const data =
        user?.role === "Admin"
          ? await userService.getAllUsers()
          : await userService.getAllWorkers();
      setWorkers(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des employés.");
    } finally {
      setLoading(false);
    }
  };
  fetchWorkers();
}, [user?.role]);



    const filteredWorkers = workers.filter(
        (worker) =>
            filter === "all" ||
            (filter === "ouvrier" && worker.role === "Worker") ||
            (filter === "chef" && worker.role === "Manager")
    );

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-[calc(100dvh-65px)] w-full p-8">
                <Loading />
            </div>
        );
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <main className="min-h-[calc(100dvh-65px)] p-8 bg-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900">Employés</h1>
                <div className="flex space-x-2">
                    <Link
                        to="/AddWorker"
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        + Employé
                    </Link>
                </div>
            </div>

            <div className="mb-4">
                <select
                    className="border px-3 py-2 rounded-md"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">Tous</option>
                    <option value="ouvrier">Ouvrier</option>
                    <option value="chef">Chef de projet</option>
                </select>
            </div>

            {filteredWorkers.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    <p>Aucun travailleur trouvé.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {filteredWorkers.map((worker) => (
                        <Link
                            to={`/worker/${worker.user_id}`}
                            key={worker.user_id}
                            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center hover:scale-105 transition"
                        >
                            <img
                                src={worker.profile_picture || DEFAULT_IMAGE}
                                alt={worker.firstname}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            <h2 className="text-lg font-semibold text-gray-900">
                                {worker.firstname} {worker.lastname}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {worker.competences && worker.competences.length > 0
                                    ? worker.competences.map((comp) => comp.name).join(", ")
                                    : "Compétences non renseignées"}
                            </p>

                            <p className="text-sm text-slate-500">{worker.numberphone}</p>
                            <p className="text-sm text-slate-500">{worker.email}</p>
                            <span
                                className={`mt-2 px-3 py-1 rounded-md text-sm ${worker.role === "Worker"
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-green-200 text-green-800"
                                    }`}
                            >
                                {worker.role === "Worker" ? "Ouvrier" : "Chef de projet"}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
