import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import taskService, { Task } from "../../../services/taskService";
import userService, { User } from "../../../services/userService";
import Loading from "../../components/loading/Loading";
import { useAuth } from "../../context/AuthContext";

const roleHierarchy = {
    'Admin': 3,
    'HR': 2,
    'Manager': 1,
    'Worker': 0
};

export default function EditMission() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [mission, setMission] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const missionData = await taskService.getById(Number(id));
        const usersData = await userService.getAllUsers();
        setMission(missionData);
        setUsers(usersData);

        // Simplified permission logic
        if (currentUser && missionData) {
            const isAdmin = currentUser.role.name === 'Admin';
            // Fallback to creator ID from task if creator object is not fully populated
            const creatorId = missionData.creator ? missionData.creator.user_id : missionData.createdBy;
            const isCreator = creatorId === currentUser.user_id;
            setCanEdit(isAdmin || isCreator);
        }

      } catch (err) {
        setError("Erreur lors du chargement de la mission.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

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
    if (!mission || !canEdit) return;
    try {
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
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Modifier la mission</h1>
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 w-full md:w-auto shadow-sm"
            >
                Retour
            </button>
        </div>

        {!canEdit && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
                <p className="font-bold">Accès non autorisé</p>
                <p>Vous ne pouvez pas modifier cette tâche.</p>
            </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            {mission.creator && (
                <div className="text-sm text-gray-500">
                    <p><strong>Créé par:</strong> {mission.creator.firstname} {mission.creator.lastname} ({mission.creator.role.name})</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-700">Nom de la mission</label>
                    <input
                    type="text"
                    name="name"
                    value={mission.name}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                    disabled={!canEdit}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">Statut</label>
                    <select
                    name="status"
                    value={mission.status}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                    disabled={!canEdit}
                    >
                    <option value="En cours">En cours</option>
                    <option value="Prévu">Prévu</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Annulé">Annulé</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                name="description"
                value={mission.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                disabled={!canEdit}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-700">Date de début</label>
                    <input
                        type="datetime-local"
                        name="start_date"
                        value={mission.start_date ? new Date(mission.start_date).toISOString().slice(0, 16) : ""}
                        onChange={handleChange}
                        className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                        disabled={!canEdit}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Date de fin</label>
                    <input
                        type="datetime-local"
                        name="end_date"
                        value={mission.end_date ? new Date(mission.end_date).toISOString().slice(0, 16) : ""}
                        onChange={handleChange}
                        className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                        disabled={!canEdit}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Affecter des employés</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto border border-gray-300 p-4 rounded-lg">
                    {users.map((u) => {
                    const assigned = mission.users.some((usr) => usr.user_id === u.user_id);
                    return (
                        <label key={u.user_id} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={assigned}
                            onChange={() => handleUserAssign(u.user_id)}
                            disabled={!canEdit}
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        {u.firstname} {u.lastname}
                        </label>
                    );
                    })}
                </div>
            </div>

            <div className="flex gap-4 mt-6 border-t border-gray-200 pt-6">
                <button
                    onClick={handleSave}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 shadow-sm ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!canEdit}
                >
                    Sauvegarder les changements
                </button>
            </div>
        </div>
      </div>
    </main>
  );
}