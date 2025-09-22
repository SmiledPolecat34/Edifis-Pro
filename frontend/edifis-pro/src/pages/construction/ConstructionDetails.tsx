import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import constructionSiteService, {
  ConstructionSite,
} from '../../../services/constructionSiteService';
import userService, { User } from '../../../services/userService';
import taskService, { Task } from '../../../services/taskService';
import Loading from '../../components/loading/Loading';
import Badge from '../../components/badge/Badge';

export default function ConstructionDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [construction, setConstruction] = useState<ConstructionSite | null>(null);
  const [initialConstruction, setInitialConstruction] = useState<ConstructionSite | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [manager, setManager] = useState<User | null>(null);
  const [managerError, setManagerError] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [managerInput, setManagerInput] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const canEdit =
    user &&
    user.role &&
    ['Admin', 'HR', 'Manager'].includes(user.role.name) &&
    construction &&
    !['Annulé', 'Terminé'].includes(construction.state || '');
  const canDelete = user && user.role && ['Admin', 'HR'].includes(user.role.name);

  useEffect(() => {
    async function fetchConstruction() {
      try {
        const data = await constructionSiteService.getById(Number(id));
        setConstruction(data);
        setInitialConstruction(data);

        if (data.chef_de_projet_id) {
          const m = await userService.getById(data.chef_de_projet_id);
          setManager(m as User);
          setManagerInput(
            `${(m as User).user_id} - ${(m as User).firstname} ${(m as User).lastname} (${(m as User).email})`,
          );
        }

        const tasksData = await taskService.getByConstructionSiteId(Number(id));
        setTasks(tasksData);
      } catch (err) {
        setError('Erreur lors du chargement du chantier.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchConstruction();
  }, [id]);

  useEffect(() => {
    if (!isEditing) return;
    async function fetchUsers() {
      try {
        const users = await userService.getAllProjectChiefs();
        setAllUsers(users);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs :', err);
      }
    }
    fetchUsers();
  }, [isEditing]);

  useEffect(() => {
    async function fetchManager() {
      if (!construction?.chef_de_projet_id) {
        setManager(null);
        return;
      }
      try {
        const userData = await userService.getById(construction.chef_de_projet_id);
        setManager(userData as User);
      } catch (err) {
        console.error(err);
        setManagerError('Impossible de charger les infos du chef de projet.');
      }
    }
    fetchManager();
  }, [construction?.chef_de_projet_id]);

  const handleCancel = () => {
    if (initialConstruction) {
      setConstruction(initialConstruction);
      if (initialConstruction.chef_de_projet_id) {
        userService
          .getById(initialConstruction.chef_de_projet_id)
          .then(m => {
            setManager(m as User);
            const managerUser = m as User;
            setManagerInput(
              `${managerUser.user_id} - ${managerUser.firstname} ${managerUser.lastname} (${managerUser.email})`,
            );
          })
          .catch(() => {
            setManager(null);
            setManagerInput('');
          });
      } else {
        setManager(null);
        setManagerInput('');
      }
    }
    setIsEditing(false);
    setManagerError(null);
  };

  const handleSave = async () => {
    if (!construction) return;
    try {
      setLoading(true);
      await constructionSiteService.update(Number(id), construction);
      setInitialConstruction(construction);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour du chantier.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProject = async () => {
    if (!construction) return;
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce chantier ?')) {
      try {
        setLoading(true);
        const updatedConstruction = { ...construction, state: 'Annulé' as const };
        await constructionSiteService.update(Number(id), updatedConstruction);
        setConstruction(updatedConstruction);
        setInitialConstruction(updatedConstruction);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de l'annulation du chantier.");
      } finally {
        setLoading(false);
      }
    }
  };

  const onManagerInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManagerInput(value);
    const q = value.trim().toLowerCase();

    const idMatch = q.match(/^(\d+)/);
    if (idMatch) {
      const idNum = Number(idMatch[1]);
      setConstruction(prev => (prev ? { ...prev, chef_de_projet_id: idNum } : prev));
      setFilteredUsers([]);
      return;
    }

    if (q.length > 0) {
      setFilteredUsers(
        allUsers.filter(u => {
          const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();
          const email = u.email.toLowerCase();
          return fullName.includes(q) || email.includes(q);
        }),
      );
    } else {
      setFilteredUsers([]);
    }
  };

  const onManagerBlur = () => {
    setTimeout(() => setFilteredUsers([]), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-65px)] w-full p-8">
        <Loading />
      </div>
    );
  }
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }
  if (!construction) {
    return <p className="text-center text-slate-500">Chantier non trouvé</p>;
  }

  const rawState = construction.state ?? 'Prévu';
  const mappedState =
    rawState === 'Prévu' ? 'Prévu' : (rawState as 'En cours' | 'Terminé' | 'Annulé' | 'Prévu');

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between md:items-start mb-6 gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm mt-1 cursor-pointer"
            >
              Retour
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={construction.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setConstruction({ ...construction, name: e.target.value })
                    }
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-3xl font-bold"
                  />
                ) : (
                  construction.name
                )}
              </h1>
              <Badge status={mappedState} />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 w-full md:w-auto shadow-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-dark hover:bg-orange-600 w-full md:w-auto shadow-sm"
                >
                  Sauvegarder
                </button>
              </>
            ) : (
              <>
                {canDelete && (
                  <button
                    onClick={handleCancelProject}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-yellow-500 text-yellow-900 hover:bg-yellow-600 w-full md:w-auto shadow-sm cursor-pointer"
                  >
                    Annuler le projet
                  </button>
                )}
                {canEdit && (
                  <Link
                    to={`/construction/edit/${id}`}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 w-full md:w-auto shadow-sm"
                  >
                    Modifier
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* --- Main Content --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          {/* --- Description --- */}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            {isEditing ? (
              <textarea
                name="description"
                value={construction.description ?? ''}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setConstruction({ ...construction, description: e.target.value })
                }
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              />
            ) : (
              <p className="text-base text-gray-800 mt-1">
                {construction.description || 'Aucune description.'}
              </p>
            )}
          </div>

          <div className="border-t border-gray-200"></div>

          {/* --- Details Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Adresse</label>
              {isEditing ? (
                <input
                  type="text"
                  name="adresse"
                  value={construction.adresse ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConstruction({ ...construction, adresse: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                />
              ) : (
                <p className="text-base text-gray-800 mt-1">
                  {construction.adresse || 'Non spécifiée'}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Chef de projet</label>
              {isEditing ? (
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={managerInput}
                    onChange={onManagerInputChange}
                    onBlur={onManagerBlur}
                    placeholder="Rechercher un chef de projet..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                  {filteredUsers.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                      {filteredUsers.map(u => (
                        <li
                          key={u.user_id}
                          className="cursor-pointer p-2 hover:bg-gray-100"
                          onClick={() => {
                            if (construction) {
                              setConstruction({ ...construction, chef_de_projet_id: u.user_id });
                              setManager(u);
                              setManagerInput(
                                `${u.user_id} - ${u.firstname} ${u.lastname} (${u.email})`,
                              );
                              setFilteredUsers([]);
                            }
                          }}
                        >
                          {u.firstname} {u.lastname} ({u.email})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : manager ? (
                <p className="text-base text-gray-800 mt-1">
                  {manager.firstname} {manager.lastname}
                </p>
              ) : (
                <p className="text-base text-gray-500 italic mt-1">
                  {construction.chef_de_projet_id ? 'Chargement...' : 'Aucun'}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date de début</label>
              {isEditing ? (
                <input
                  type="date"
                  name="start_date"
                  value={construction.start_date ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConstruction({ ...construction, start_date: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                />
              ) : (
                <p className="text-base text-gray-800 mt-1">
                  {construction.start_date
                    ? new Date(construction.start_date).toLocaleDateString()
                    : 'Non spécifiée'}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date de fin</label>
              {isEditing ? (
                <input
                  type="date"
                  name="end_date"
                  value={construction.end_date ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConstruction({ ...construction, end_date: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                />
              ) : (
                <p className="text-base text-gray-800 mt-1">
                  {construction.end_date
                    ? new Date(construction.end_date).toLocaleDateString()
                    : 'Non spécifiée'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- Tasks Section --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Missions du chantier</h2>
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.task_id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center flex-wrap mb-2 gap-2">
                    <h3 className="font-semibold text-gray-900">{task.name}</h3>
                    {task.status && (
                      <Badge
                        status={
                          task.status === 'En attente de validation'
                            ? 'Prévu'
                            : (task.status as 'En cours' | 'Terminé' | 'Annulé' | 'Prévu')
                        }
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center pt-10">
              Aucune mission pour ce chantier.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
