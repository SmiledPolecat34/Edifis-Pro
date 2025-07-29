import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import taskService, { Task } from "../../../services/taskService";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/badge/Badge";

const statusPriority: Record<string, number> = {
  "En cours": 1,
  Prévu: 2,
  Terminé: 3,
  Annulé: 4,
};

export default function Missions() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(""); // "" = Tous
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        let data: Task[];
        if (user.role === "Admin") {
          data = await taskService.getAll();
        } else {
          data = await taskService.getByUserId(user.user_id);
        }
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des missions.");
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [user]);

  useEffect(() => {
    let results = tasks.filter((t) => {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
    if (filterStatus) {
      results = results.filter((t) => t.status === filterStatus);
    }
    results.sort(
      (a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99)
    );
    setFilteredTasks(results);
  }, [search, tasks, filterStatus]);

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold text-gray-900">Missions</h1>
        {(user.role === "Admin" || user.role === "Manager") && (
          <Link
            to="/addamission"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm"
          >
            Ajouter une mission
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher une mission..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="">Tous statuts</option>
          <option value="En cours">En cours</option>
          <option value="Prévu">Prévu</option>
          <option value="Terminé">Terminé</option>
          <option value="Annulé">Annulé</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500">Aucune mission trouvée.</p>
      ) : (
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
          {filteredTasks.map((task) => {
            const cs = task.construction_site;
            return (
              <div
                key={task.task_id}
                className="bg-white border border-gray-200 rounded-lg shadow-lg p-5 relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {task.name}
                  </h2>
                  {task.status && <Badge status={task.status} />}
                </div>
                <p className="text-gray-700">{task.description}</p>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>📅 Début :</strong>{" "}
                  {task.start_date
                    ? new Date(task.start_date).toLocaleString()
                    : "Non défini"}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>⏳ Fin :</strong>{" "}
                  {task.end_date
                    ? new Date(task.end_date).toLocaleString()
                    : "Non défini"}
                </p>

                <div className="mt-2">
                  <strong className="text-gray-800">👥 Assigné à :</strong>
                  {task.users.length === 0 ? (
                    <p className="text-gray-600">Aucun assigné</p>
                  ) : (
                    <ul className="text-gray-800">
                      {task.users.map((u) => (
                        <li key={u.user_id}>– {u.firstname} {u.lastname}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {cs && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Chantier
                    </h3>
                    <p className="text-gray-700">
                      <strong>Nom :</strong> {cs.name}
                    </p>
                    <p className="text-gray-700">
                      <strong>Début :</strong>{" "}
                      {cs.start_date
                        ? new Date(cs.start_date).toLocaleDateString()
                        : "Non défini"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Fin :</strong>{" "}
                      {cs.end_date
                        ? new Date(cs.end_date).toLocaleDateString()
                        : "Non défini"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Adresse :</strong> {cs.adresse}
                    </p>
                  </div>
                )}

                {(user.role === "Admin" || user.role === "Manager") && (
                  <Link
                    to={`/editmission/${task.task_id}`}
                    className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                  >
                    Modifier
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
