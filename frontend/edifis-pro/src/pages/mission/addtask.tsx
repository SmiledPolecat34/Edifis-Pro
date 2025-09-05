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
  const [selectedConstruction, setSelectedConstruction] = useState<
    number | null
  >(null);

  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // For manager and admin
  const [constructions, setConstructions] = useState([]);
  const [minStartDate, setMinStartDate] = useState<string>("");
  const [maxEndDate, setMaxEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userFilter, setUserFilter] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const constructionsData = await constructionService.getAll();
        setConstructions(constructionsData);

        if (user && (user.role.name === 'Manager' || user.role.name === 'Admin')) {
            const allUsersData = await userService.getAllUsers();
            setAllUsers(allUsersData);
            setUsers(allUsersData); // Initially, show all users for manager/admin
        }
      } catch (err) {
        setError("Erreur lors du chargement des données initiales.");
        console.error("Erreur lors du chargement des données initiales:", err);
      }
    };

    if (user) {
        fetchInitialData();
    }
  }, [user]);

  // Fonction pour s'assurer que les dates respectent le format "YYYY-MM-DDTHH:MM"
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return `${dateString}T00:00`;
  };

  const handleConstructionChange = async (e) => {
    const selectedId = Number(e.target.value);
    setSelectedConstruction(selectedId);
    const selectedConstructionData = constructions.find(
      (c) => c.construction_site_id === selectedId
    );
    if (selectedConstructionData) {
      // Transformation pour que les dates respectent le format requis
      setMinStartDate(formatDateForInput(selectedConstructionData.start_date));
      setMaxEndDate(formatDateForInput(selectedConstructionData.end_date));
      // Réinitialisation des dates de la mission
      setStartDate(formatDateForInput(selectedConstructionData.start_date));
      setEndDate(formatDateForInput(selectedConstructionData.end_date));

      if (user && (user.role.name !== 'Manager' && user.role.name !== 'Admin')) {
        // For "chef de chantier", fetch users of the selected construction site.
        try {
          const usersData = await constructionService.getUsersOfConstructionSite(selectedId);
          setUsers(usersData);
        } catch (err) {
          setError("Erreur lors du chargement des utilisateurs du chantier.");
        }
      }
    }
  };

  // Fonction pour vérifier la disponibilité d'un utilisateur
  const isUserAvailable = (user) => {
    if (!startDate || !endDate) return true; // Pas de vérification si les dates ne sont pas renseignées
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    // Si l'utilisateur n'a pas de missions, il est disponible
    if (!user.Tasks || user.Tasks.length === 0) return true;
    // Vérifier qu'aucune mission ne chevauche la nouvelle plage de dates
    return user.Tasks.every((task) => {
      const taskStart = new Date(task.start_date);
      const taskEnd = new Date(task.end_date);
      // Condition sans chevauchement : la nouvelle fin est avant le début de la mission ou le nouveau début est après la fin de la mission
      return newEnd <= taskStart || newStart >= taskEnd;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedConstruction) {
      setError("Veuillez sélectionner un chantier.");
      setLoading(false);
      return;
    }

    // Vérification des dates
    if (startDate < minStartDate) {
      setError(`La date de début ne peut pas être avant ${minStartDate}`);
      setLoading(false);
      return;
    }
    if (endDate > maxEndDate) {
      setError(`La date de fin ne peut pas être après ${maxEndDate}`);
      setLoading(false);
      return;
    }
    if (startDate > endDate) {
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
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Créer une Mission
      </h1>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 text-center"
      >
        Retour
      </button>
      {error && <p className="text-red-500">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-lg rounded-lg"
      >
        {/* Informations de base */}
        <div className="mb-4">
          <label className="block text-gray-700">Nom de la mission :</label>
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
            <option value="En cours">En cours</option>
            <option value="Prévu">Prévu</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
          </select>
        </div>

        {/* Sélection du chantier */}
        <div className="mb-4">
          <label className="block text-gray-700">Chantier :</label>
          <select
            value={selectedConstruction || ""}
            onChange={handleConstructionChange}
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

        {/* Dates de la mission */}
        <div className="mb-4">
          <label className="block text-gray-700">
            Date et heure de début :
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            min={minStartDate}
            max={maxEndDate}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Date et heure de fin :</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            min={startDate}
            max={maxEndDate}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Sélection des utilisateurs */}
        <div className="mb-4">
          <label className="block text-gray-700">
            Affecter des employés :
          </label>
          <input
            type="text"
            placeholder="Filtrer par nom ou compétence"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mb-2"
          />
          <select
            multiple
            value={selectedUsers}
            onChange={(e) =>
              setSelectedUsers(
                Array.from(e.target.selectedOptions, (opt) => Number(opt.value))
              )
            }
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {users
              .filter(userToDisplay => {
                if (!user || !user.role || !userToDisplay.role) {
                    return false;
                }
                const currentUserRole = user.role.name;
                const userToDisplayRole = userToDisplay.role.name;

                let isVisible = false;
                if (currentUserRole === 'Admin') {
                    isVisible = true;
                } else if (currentUserRole === 'Manager') {
                    isVisible = ['Worker', 'Project_Chief', 'HR'].includes(userToDisplayRole);
                } else if (currentUserRole === 'Project_Chief') {
                    isVisible = userToDisplayRole === 'Worker';
                }

                if (!isVisible) {
                    return false;
                }

                // Filtrage basé sur le nom et les compétences
                const fullName = `${userToDisplay.firstname} ${userToDisplay.lastname}`.toLowerCase();
                const filterText = userFilter.toLowerCase();
                const competenceText = userToDisplay.competences
                  ? userToDisplay.competences.map((c) => c.name.toLowerCase()).join(" ")
                  : "";
                return (
                  fullName.includes(filterText) ||
                  competenceText.includes(filterText)
                );
              })
              .map((userToDisplay) => {
                const available = isUserAvailable(userToDisplay);
                return (
                  <option
                    key={userToDisplay.user_id}
                    value={userToDisplay.user_id}
                    disabled={!available}
                  >
                    {userToDisplay.firstname} {userToDisplay.lastname} - {userToDisplay.role.name}{" "}
                    {!available && " (Non disponible)"}
                  </option>
                );
              })}
          </select>
        </div>

        <div className="flex items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Création..." : "Créer la mission"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 ml-2"
          >
            Retour
          </button>
        </div>
      </form>
    </main>
  );
}
 
