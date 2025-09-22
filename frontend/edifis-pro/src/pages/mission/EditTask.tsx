import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import taskService, { Task } from '../../../services/taskService';
import userService, { User } from '../../../services/userService';
import Loading from '../../components/loading/Loading';
import { useAuth } from '../../context/AuthContext';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('fr', fr);
setDefaultLocale('fr');

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
      } catch (err) {
        setError('Erreur lors du chargement de la mission.');
        console.error('Erreur fetch mission:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    if (!mission) return;
    setMission({ ...mission, [e.target.name]: e.target.value });
  };

  const handleUserAssign = (userId: number) => {
    if (!mission) return;
    const alreadyAssigned = mission.users.some(u => u.user_id === userId);
    let updatedUsers;
    if (alreadyAssigned) {
      updatedUsers = mission.users.filter(u => u.user_id !== userId);
    } else {
      const user = users.find(u => u.user_id === userId);
      if (!user || user.user_id === undefined) return;
      // Map User to TaskUser type
      const newTaskUser = {
        user_id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      };
      updatedUsers = [...mission.users, newTaskUser];
    }
    setMission({ ...mission, users: updatedUsers });
  };

  const handleSave = async () => {
    if (!mission || !canEdit) return;

    if (
      mission.end_date &&
      mission.start_date &&
      new Date(mission.end_date) < new Date(mission.start_date)
    ) {
      alert('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    try {
      await taskService.update(mission.task_id, {
        ...mission,
        users: mission.users,
      });
      alert('Mission mise à jour avec succès !');
      navigate('/missions');
    } catch (err) {
      console.error('Erreur update mission:', err);
      alert('Erreur lors de la mise à jour de la mission.');
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
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg"
            role="alert"
          >
            <p className="font-bold">Accès non autorisé</p>
            <p>Vous ne pouvez pas modifier cette tâche.</p>
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
              <option value="Prévu">Prévue</option>
              <option value="Terminé">Terminée</option>
              <option value="Annulé">Annulée</option>
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
            <DatePicker
              selected={mission.start_date ? new Date(mission.start_date) : null}
              onChange={(date: Date) => setMission({ ...mission, start_date: date.toISOString() })}
              showTimeSelect
              dateFormat="Pp"
              className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              disabled={!canEdit}
              minDate={new Date()}
              locale="fr"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date de fin</label>
            <DatePicker
              selected={mission.end_date ? new Date(mission.end_date) : null}
              onChange={(date: Date) => setMission({ ...mission, end_date: date.toISOString() })}
              showTimeSelect
              minDate={mission.start_date ? new Date(mission.start_date) : new Date()}
              dateFormat="Pp"
              className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              disabled={!canEdit}
              locale="fr"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Affecter des employés</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto border border-gray-300 p-4 rounded-lg">
            {users.map(u => {
              const assigned = mission.users.some(usr => usr.user_id === u.user_id);
              return (
                <label key={u.user_id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={assigned}
                    onChange={() => {
                      if (u.user_id !== undefined) handleUserAssign(u.user_id);
                    }}
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
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-dark hover:bg-orange-600 shadow-sm ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canEdit}
          >
            Sauvegarder les changements
          </button>
        </div>
      </div>
    </main>
  );
}
