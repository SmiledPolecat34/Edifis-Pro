import { useEffect, useState } from "react";
import taskService from "../../../services/taskService";
import userService from "../../../services/userService";
import constructionService from "../../../services/constructionSiteService"; // Service pour récupérer les chantiers
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CreateTask() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Prévu");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedConstruction, setSelectedConstruction] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [constructions, setConstructions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState(""); // State for user search

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [constructionsData, usersData] = await Promise.all([
            constructionService.getAll(),
            userService.getAssignableUsers()
        ]);
        setConstructions(constructionsData);
        setUsers(usersData);
      } catch (err) {
        setError("Erreur lors du chargement des données.");
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => 
        prev.includes(userId) 
            ? prev.filter(id => id !== userId) 
            : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(u => {
      const query = userSearchQuery.toLowerCase();
      const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();
      const role = (u.role?.name || '').toLowerCase();
      const competences = (u.competences?.map(c => c.name).join(' ') || '').toLowerCase();
      return fullName.includes(query) || role.includes(query) || competences.includes(query);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedConstruction) {
      setError("Veuillez sélectionner un chantier.");
      setLoading(false);
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        setError("La date de début doit être avant la date de fin.");
        setLoading(false);
        return;
    }

    try {
      const newTask = await taskService.create({
        name,
        description,
        status,
        start_date: startDate,
        end_date: endDate,
        construction_site_id: selectedConstruction,
      });

      if (selectedUsers.length > 0) {
        await taskService.assignUsers(newTask.task_id, selectedUsers);
      }

      navigate("/missions");
    } catch (err) {
      setError("Erreur lors de la création de la mission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm mr-4">
                    Retour
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Créer une Mission</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                {/* --- Section 1: Infos & Statut --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Nom de la mission</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Statut</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                            <option value="Prévu">Prévu</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                            <option value="Annulé">Annulé</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"></textarea>
                </div>

                {/* --- Section 2: Chantier & Dates --- */}
                <div className="border-t border-gray-200 pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Chantier</label>
                            <select value={selectedConstruction || ""} onChange={(e) => setSelectedConstruction(Number(e.target.value))} required className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                                <option value="" disabled>Sélectionnez un chantier</option>
                                {constructions.map((c) => <option key={c.construction_site_id} value={c.construction_site_id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Date de début</label>
                            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Date de fin</label>
                            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                    </div>
                </div>

                {/* --- Section 3: Assignation --- */}
                <div className="border-t border-gray-200 pt-6">
                    <label className="text-lg font-semibold text-gray-800 mb-2 block">Affecter des employés</label>
                    <input 
                        type="search"
                        value={userSearchQuery}
                        onChange={e => setUserSearchQuery(e.target.value)}
                        placeholder="Rechercher par nom, poste, compétence..."
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500 mb-4"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto border border-gray-300 p-4 rounded-lg">
                        {filteredUsers.map((u) => (
                            <label key={u.user_id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={selectedUsers.includes(u.user_id)} onChange={() => handleUserToggle(u.user_id)} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                <span>{u.firstname} {u.lastname}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* --- Actions --- */}
                <div className="border-t border-gray-200 pt-6 flex justify-end">
                    <button type="submit" disabled={loading} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 shadow-sm">
                        {loading ? "Création..." : "Créer la mission"}
                    </button>
                </div>
            </form>
        </div>
    </main>
  );
}
 
