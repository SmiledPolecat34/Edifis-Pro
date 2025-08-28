import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import taskService, { Task } from "../../../services/taskService";
import userService, { User } from "../../../services/userService";
import Loading from "../../components/loading/Loading";

export default function EditMission() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mission, setMission] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const missionData = await taskService.getById(Number(id));
        const usersData = await userService.getAll();
        setMission(missionData);
        setUsers(usersData);
      } catch (err) {
        setError("Erreur lors du chargement de la mission.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!mission) return;
    setMission({ ...mission, [e.target.name]: e.target.value });
  };

  const handleUserAssign = (userId: number) => {
    if (!mission) return;
    const alreadyAssigned = mission.users.some((u) => u.user_id === userId);
    let updatedUsers;
    if (alreadyAssigned) {
      updatedUsers = mission.users.filter((u) => u.user_id !== userId);
    } else {
      const user = users.find((u) => u.user_id === userId);
      if (!user) return;
      updatedUsers = [...mission.users, user];
    }
    setMission({ ...mission, users: updatedUsers });
  };

  const handleSave = async () => {
  if (!mission) return;
  try {
    // On envoie mission + users
    await taskService.update(mission.task_id, {
      ...mission,
      userIds: mission.users.map(u => u.user_id)
    });
    alert("Mission mise à jour avec succès !");
    navigate("/missions");
  } catch (err) {
    console.error("Erreur update mission:", err);
    alert("Erreur lors de la mise à jour de la mission.");
  }
};


  if (loading) return <Loading />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!mission) return <p className="text-gray-500">Mission introuvable</p>;

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Modifier la mission</h1>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input
          type="text"
          name="name"
          value={mission.name}
          onChange={handleChange}
          placeholder="Nom de la mission"
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          value={mission.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            name="start_date"
            value={mission.start_date ? new Date(mission.start_date).toISOString().slice(0, 16) : ""}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="datetime-local"
            name="end_date"
            value={mission.end_date ? new Date(mission.end_date).toISOString().slice(0, 16) : ""}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <select
          name="status"
          value={mission.status}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="En cours">En cours</option>
          <option value="Prévu">Prévu</option>
          <option value="Terminé">Terminé</option>
          <option value="Annulé">Annulé</option>
        </select>

        {/* Liste des utilisateurs assignés */}
        <div>
          <h2 className="text-lg font-semibold mb-2">👥 Assigner des utilisateurs</h2>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
            {users.map((u) => {
              const assigned = mission.users.some((usr) => usr.user_id === u.user_id);
              return (
                <label key={u.user_id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assigned}
                    onChange={() => handleUserAssign(u.user_id)}
                  />
                  {u.firstname} {u.lastname}
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sauvegarder
          </button>
          <button
            onClick={() => navigate("/missions")}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </main>
  );
}
