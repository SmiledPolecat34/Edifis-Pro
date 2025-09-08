import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService, { User } from '../../../services/userService';
import competenceService, { Competence } from '../../../services/competenceService';
import Loading from '../../components/loading/Loading';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_IMAGE = 'https://www.capcampus.com/img/u/1/job-etudiant-batiment.jpg';

// Table de correspondance pour afficher les rôles
const roleLabels: Record<string, string> = {
  Worker: 'Ouvrier',
  Manager: 'Chef de projet',
  Admin: 'Responsable',
  HR: 'RH',
};

export default function WorkerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [modalData, setModalData] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // State pour l'employé
  const [worker, setWorker] = useState<User | null>(null);

  // State pour la liste complète des compétences récupérées depuis l'API
  const [allSkills, setAllSkills] = useState<Competence[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = currentUser && ['Admin', 'HR', 'Manager'].includes(currentUser.role.name);
  const canDelete = currentUser && ['Admin', 'HR'].includes(currentUser.role.name);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const raw = await userService.getById(Number(id));
        const normalized = {
          ...(typeof raw === 'object' && raw !== null ? raw : {}),
          role:
            (raw as { role?: { name?: string } }).role?.name ??
            (raw as { role?: string }).role ??
            'Worker',
          competences: (raw as { competences?: Competence[] }).competences ?? [],
        } as User;

        const skills = await competenceService.getAllCompetences();

        setWorker(normalized);
        setAllSkills(skills);
      } catch (err) {
        setError('Impossible de charger les données.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setWorker(prevWorker => {
      if (!prevWorker) return null;
      const { name, value } = e.target;
      let newValue = value;
      // Filtrage du champ firstname
      if (name === 'firstname') {
        newValue = newValue.replace(/[^a-zA-ZÀ-ÖÙ-öù-ÿ-]/g, '');
      } else if (name === 'lastname') {
        // Filtrage du champ lastname
        newValue = newValue.replace(/[^a-zA-ZÀ-ÖÙ-öù-ÿ-]/g, '').toUpperCase();
      } else if (name === 'numberphone') {
        newValue = newValue.replace(/[^0-9]/g, '');
      }
      return { ...prevWorker, [name]: newValue };
    });
  };

  const handleSkillChange = (skillId: number) => {
    if (!worker) return;

    const currentSkills = worker.competences || [];
    const exists = currentSkills.some(c => c.competence_id === skillId);
    let updatedSkills;

    if (exists) {
      updatedSkills = currentSkills.filter(c => c.competence_id !== skillId);
    } else {
      const skillName = allSkills.find(s => s.competence_id === skillId)?.name || '';
      updatedSkills = [...currentSkills, { competence_id: skillId, name: skillName }];
    }

    setWorker(prev => (prev ? { ...prev, competences: updatedSkills } : null));
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        if (worker && worker.user_id !== undefined) {
          await userService.delete(worker.user_id);
          navigate('/workers');
        }
      } catch (err) {
        console.error('Erreur lors de la suppression :', err);
      }
    }
  };

  const handleSave = async () => {
    if (!worker || worker.user_id == null) return;
    try {
      const { ...updateData } = worker;

      const competences: Competence[] = (updateData.competences ?? [])
        .filter((c: Competence) => typeof c.competence_id === 'number')
        .map((c: Competence) => ({
          competence_id: c.competence_id,
          name: c.name,
          description: c.description,
        }));

      await userService.update(worker.user_id, {
        ...updateData,
        competences,
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde :', err);
      setError('Erreur lors de la sauvegarde.');
    }
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

  if (!worker) {
    return <p className="text-center text-slate-500">Employé non trouvé</p>;
  }

  return (
    <main className="min-h-[calc(100dvh-65px)] p-8 bg-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 text-center"
      >
        Retour
      </button>
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Détails de l'employé</h1>
        <div className="flex items-center mb-4">
          <img
            src={worker.profile_picture || DEFAULT_IMAGE}
            alt={worker.firstname}
            className="w-24 h-24 object-cover rounded-full mr-4"
          />
          <div className="flex flex-col">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="firstname"
                  value={worker.firstname}
                  onChange={handleChange}
                  className="text-xl font-semibold text-gray-900 mb-2 border-b border-gray-300"
                />
                <input
                  type="text"
                  name="lastname"
                  value={worker.lastname}
                  onChange={handleChange}
                  className="text-xl font-semibold text-gray-900 mb-2 border-b border-gray-300"
                />
              </>
            ) : (
              <h2 className="text-xl font-semibold text-gray-900">
                {worker.firstname} {worker.lastname}
              </h2>
            )}
          </div>
        </div>

        <p>
          <strong>Email : </strong>
          {isEditing ? (
            <input
              type="text"
              name="email"
              value={worker.email}
              onChange={handleChange}
              className="border border-gray-300 rounded p-1"
            />
          ) : (
            <a href={`mailto:${worker.email}`} className="text-blue-600 hover:underline">
              {worker.email}
            </a>
          )}
        </p>
        <p>
          <strong>Téléphone : </strong>
          {isEditing ? (
            <input
              type="text"
              name="numberphone"
              value={worker.numberphone}
              onChange={handleChange}
              className="border border-gray-300 rounded p-1"
            />
          ) : worker.numberphone ? (
            <a href={`tel:${worker.numberphone}`} className="text-blue-600 hover:underline">
              {worker.numberphone}
            </a>
          ) : (
            'Non renseigné'
          )}
        </p>
        <p>
          <strong>Rôle : </strong>
          {isEditing ? (
            <select
              name="role"
              value={typeof worker.role === 'string' ? worker.role : worker.role?.name}
              onChange={e => setWorker(prev => (prev ? { ...prev, role: e.target.value } : prev))}
              className="border border-gray-300 rounded p-1"
            >
              <option value="Worker">Ouvrier</option>
              <option value="Manager">Chef de projet</option>
              <option value="Admin">Responsable</option>
              <option value="HR">RH</option>
            </select>
          ) : (
            roleLabels[typeof worker.role === 'string' ? worker.role : worker.role?.name || ''] ||
            'Non défini'
          )}
        </p>

        {!isEditing && (
          <>
            <p>
              <strong>
                <Link to="/competences" className="underline hover:text-blue-600">
                  Compétences
                </Link>
                :
              </strong>
            </p>
            <div className="flex flex-wrap gap-2">
              {worker.competences && worker.competences.length > 0 ? (
                worker.competences.map(c => (
                  <div key={c.competence_id} className="flex items-center space-x-1">
                    <span>{c.name}</span>
                    <button
                      onClick={() =>
                        setModalData({
                          title: c.name,
                          description: c.description ?? 'Pas de description',
                        })
                      }
                      className="text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ?
                    </button>
                  </div>
                ))
              ) : (
                <span>Non spécifié</span>
              )}
            </div>
          </>
        )}

        {isEditing && (
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {allSkills.map(skill => {
              const assigned = worker?.competences?.some(
                c => c.competence_id === skill.competence_id,
              );
              return (
                <label key={skill.competence_id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!assigned}
                    onChange={() => handleSkillChange(skill.competence_id)}
                  />
                  {skill.name}
                </label>
              );
            })}
          </div>
        )}

        {modalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              <h2 className="text-xl font-bold mb-2">{modalData.title}</h2>
              <p className="mb-4">{modalData.description}</p>
              <button
                onClick={() => setModalData(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {canEdit && (
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                }
                setIsEditing(!isEditing);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {isEditing ? 'Enregistrer' : 'Modifier'}
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
