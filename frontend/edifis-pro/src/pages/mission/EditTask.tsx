import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import taskService, { Task } from "../../../services/taskService";
import userService, { User } from "../../../services/userService";
import constructionService, {
  ConstructionSite,
} from "../../../services/constructionSiteService";
import { useAuth } from "../../context/AuthContext";

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("En attente");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedConstruction, setSelectedConstruction] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [constructions, setConstructions] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      // 1) Charger la mission
      try {
        const task: Task = await taskService.getById(Number(id));
        setName(task.name ?? "");
        setDescription(task.description ?? "");
        setStatus(task.status ?? "En attente");
        setStartDate(task.start_date?.split("T")[0] ?? "");
        setEndDate(task.end_date?.split("T")[0] ?? "");
        setSelectedConstruction(task.construction_site_id ?? null);
        setSelectedUsers(task.users?.map((u) => u.user_id) ?? []);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données.");
        return;
      }

      // 2) Charger les assignables selon le rôle
      try {
        if (user?.role === "Admin") {
          const [workers, managers] = await Promise.all([
            userService.getAllWorkers(),
            userService.getAllManagers(),
          ]);
          setUsers([...workers, ...managers]);
        } else {
          const workers = await userService.getAllWorkers();
          setUsers(workers);
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des utilisateurs.");
      }

      // 3) Charger les chantiers
      try {
        const cs = await constructionService.getAll();
        setConstructions(cs);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des chantiers.");
      }
    }
    fetchData();
  }, [id, user?.role]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!selectedConstruction) {
      setError("Veuillez sélectionner un chantier.");
      setLoading(false);
      return;
    }
    try {
      await taskService.update(Number(id), {
        name,
        description,
        status,
        start_date: startDate,
        end_date: endDate,
        construction_site_id: selectedConstruction,
      });
      if (selectedUsers.length) {
        await taskService.assignUsers(Number(id), selectedUsers);
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour de la mission.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const vals = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
    setSelectedUsers(vals);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md"
      >
        ← Retour
      </button>

      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Modifier la mission #{id}
      </h1>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-lg space-y-6">
        {/* Nom, Description, Statut */}
        <div>
          <label className="block text-gray-700 mb-1">Nom :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Statut :</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="Prévu">Prévu</option>
            <option value="En cours">En cours</option>
            <option value="Annulé">Annulé</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>

        {/* Chantier */}
        <div>
          <label className="block text-gray-700 mb-1">Chantier :</label>
          <select
            value={selectedConstruction ?? ""}
            onChange={(e) => setSelectedConstruction(Number(e.target.value))}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Sélectionnez un chantier</option>
            {constructions.map((c) => (
              <option
                key={c.construction_site_id}
                value={c.construction_site_id}
              >
                {c.name} — {c.adresse}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Date de début :</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Date de fin :</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Utilisateurs assignés */}
        <div>
          <label className="block text-gray-700 mb-1">Assigner des utilisateurs :</label>
          <select
            multiple
            value={selectedUsers}
            onChange={handleUserChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.firstname} {u.lastname}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Mise à jour…" : "Modifier la mission"}
        </button>
      </form>
    </main>
  );
}
