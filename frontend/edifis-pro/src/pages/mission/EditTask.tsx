import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import taskService, { Task } from "../../../services/taskService";
import userService, { User } from "../../../services/userService";

import constructionService, {
  ConstructionSite,
} from "../../../services/constructionSiteService";
import { useAuth } from "../../context/AuthContext";

export default function EditTask() {
  // L'ID provient des paramètres de l'URL et sera converti en nombre
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // États
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<string>("En attente");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  // Utilisation de number[] pour les IDs des utilisateurs assignés
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  // Pour le chantier, on utilise number | null (null si aucun chantier n'est sélectionné)
  const [selectedConstruction, setSelectedConstruction] = useState<
    number | null
  >(null);

  const [users, setUsers] = useState<User[]>([]);
  const [constructions, setConstructions] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const user = useAuth().user;
  console.log(user.role);
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const task: Task = await taskService.getById(Number(id));
        setName(task.name || "");
        setDescription(task.description || "");
        setStatus(task.status || "En attente");
        // Transformation des dates pour le format attendu par l'input date
        setStartDate(task.start_date ? task.start_date.split("T")[0] : "");
        setEndDate(task.end_date ? task.end_date.split("T")[0] : "");
        setSelectedConstruction(task.task_id || null);
        // On suppose que task.users est un tableau d'objets User
        setSelectedUsers(task.users.map((user: User) => user.user_id));
      } catch {
        setError("Erreur lors du chargement de la mission.");
      }
    };

    const fetchUsersAndConstructions = async () => {
      try {
        const [usersData, constructionsData] = await Promise.all([
          user.role === "Admin" ? userService.getAllUsers() : userService.getAllWorkers(),
          constructionService.getAll(),
        ]);
        setUsers(usersData);
        setConstructions(constructionsData);
      } catch {
        setError("Erreur lors du chargement des données.");
      }
    };

    fetchTask();
    fetchUsersAndConstructions();
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!selectedConstruction) {
        setError("Veuillez sélectionner un chantier.");
        setLoading(false);
        return;
      }

      await taskService.update(Number(id), {
        name,
        description,
        status,
        start_date: startDate,
        end_date: endDate,
        task_id: selectedConstruction,
      });

      if (selectedUsers.length > 0) {
        await taskService.assignUsers(Number(id), selectedUsers);
      }

      navigate("/missions");
    } catch {
      setError("Erreur lors de la mise à jour de la mission.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, (opt) =>
      Number(opt.value)
    );
    setSelectedUsers(values);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Modifier la Mission
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-lg rounded-lg"
      >
        <div className="mb-4">
          <label className="block text-gray-700">Nom :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Statut :</label>
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

        <div className="mb-4">
          <label className="block text-gray-700">Chantier :</label>
          <select
            value={selectedConstruction || ""}
            onChange={(e) => setSelectedConstruction(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Sélectionnez un chantier</option>
            {constructions.map((construction) => (
              <option
                key={construction.construction_site_id}
                value={construction.construction_site_id}
              >
                {construction.name} - {construction.adresse}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Date de début :</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Date de fin :</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">
            Assigner des utilisateurs :
          </label>
          <select
            multiple
            value={selectedUsers}
            onChange={handleUserChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.firstname} {user.lastname}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Mise à jour..." : "Modifier la mission"}
        </button>
      </form>
    </main>
  );
}
