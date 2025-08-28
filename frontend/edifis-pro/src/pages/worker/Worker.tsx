import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import userService, { User } from "../../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/loading/Loading";

const DEFAULT_IMAGE = "https://www.capcampus.com/img/u/1/job-etudiant-batiment.jpg";

export default function Workers() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canCreate = ["Admin", "HR", "Manager"].includes(user?.role ?? "");

  useEffect(() => {
    let cancelled = false;
    async function fetchWorkers() {
      try {
        const data = await userService.getDirectory();
        if (!cancelled) setWorkers(data);
      } catch (err:any) {
        if (!cancelled) setError(err?.message || "Erreur lors du chargement des employés");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWorkers();
    return () => { cancelled = true; };
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    const fullName = `${worker.firstname} ${worker.lastname}`.toLowerCase();
    const competences = (worker.competences?.map((c: any) => c.name).join(", ") || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || competences.includes(query);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-65px)] w-full p-8">
        <Loading />
      </div>
    );
  }
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <main className="min-h-[calc(100dvh-65px)] p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Employés</h1>
        {canCreate && (
          <Link
            to="/workers/add"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Employé
          </Link>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, compétences..."
          className="border px-3 py-2 rounded-md w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>Aucun employé trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <Link
              to={`/workers/${worker.user_id}`}
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
                  ? worker.competences.map((c: any) => c.name).join(", ")
                  : "Compétences non renseignées"}
              </p>
              <p className="text-sm text-slate-500">{worker.numberphone}</p>
              <p className="text-sm text-slate-500">{worker.email}</p>
              <span
                className={`mt-2 px-3 py-1 rounded-md text-sm ${
                  worker.role === "Worker"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-green-200 text-green-800"
                }`}
              >
                {worker.role}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
