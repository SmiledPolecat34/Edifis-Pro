import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import competenceService, { Competence } from '../../../services/competenceService';
import userService from '../../../services/userService';
import { HelpCircle } from 'lucide-react';

type RoleType = 'Admin' | 'Worker' | 'Manager' | 'Project_Chief' | 'HR';

// Interface User attendue par userService.updateUser
interface UserPayload {
  firstname: string;
  lastname: string;
  email: string;
  numberphone: string;
  role: RoleType;
  competences: Competence[]; // tableau d’objets Competence, pas seulement d’IDs
}

export default function EditWorker() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    numberphone: '',
    role: 'Worker' as RoleType,
    competences: [] as number[], // tableau d’IDs de compétences
  });

  const [competences, setCompetences] = useState<Competence[]>([]);
  const [competenceSearch, setCompetenceSearch] = useState(''); // State for competence search
  const [newCompetence, setNewCompetence] = useState({ name: '', description: '' });
  const [addingCompetence, setAddingCompetence] = useState(false);

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const workerData = await userService.getById(Number(id));
        // Type assertion to inform TypeScript about the expected structure
        const typedWorkerData = workerData as {
          firstname: string;
          lastname: string;
          email: string;
          numberphone: string;
          role: { name: RoleType };
          competences: { competence_id: number }[];
        };
        setFormData({
          firstname: typedWorkerData.firstname,
          lastname: typedWorkerData.lastname,
          email: typedWorkerData.email,
          numberphone: typedWorkerData.numberphone,
          role: typedWorkerData.role.name as RoleType,
          competences: typedWorkerData.competences.map(
            (c: { competence_id: number }) => c.competence_id,
          ),
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'employé :", error);
      }
    };

    const fetchCompetences = async () => {
      try {
        const data = await competenceService.getAllCompetences();
        setCompetences(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des compétences :', error);
      }
    };

    fetchWorkerData();
    fetchCompetences();
  }, [id]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompetenceFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewCompetence(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCompetence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddingCompetence(true);
      await competenceService.addCompetence(newCompetence);
      const data = await competenceService.getAllCompetences();
      setCompetences(data);
      setNewCompetence({ name: '', description: '' });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la compétence :", error);
    } finally {
      setAddingCompetence(false);
    }
  };

  const handleCompetenceToggle = (compId: number) => {
    setFormData(prev => ({
      ...prev,
      competences: prev.competences.includes(compId)
        ? prev.competences.filter(id => id !== compId)
        : [...prev.competences, compId],
    }));
  };

  const filteredCompetences = competences.filter(comp => {
    const query = competenceSearch.toLowerCase();
    return (
      comp.name.toLowerCase().includes(query) ||
      (comp.description || '').toLowerCase().includes(query)
    );
  });

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet employé ?')) return;

    try {
      await userService.delete(Number(id));
      alert('Employé supprimé avec succès.');
      navigate('/workers'); // retour à la liste
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Impossible de supprimer l’employé.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(null);

    const selectedCompetences: Competence[] = competences.filter(comp =>
      formData.competences.includes(comp.competence_id),
    );

    const updatedUser: UserPayload = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email.trim(),
      numberphone: formData.numberphone,
      role: formData.role,
      competences: selectedCompetences,
    };

    try {
      await userService.updateUser(Number(id), updatedUser);
      setSubmitOk('Utilisateur mis à jour avec succès.');
      navigate('/workers');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm mr-4  cursor-pointer"
          >
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Modifier l'employé</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Edit Form --- */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="text"
                    name="numberphone"
                    value={formData.numberphone}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                    required
                    maxLength={10}
                    pattern="\d{10}"
                    title="Le numéro de téléphone doit contenir 10 chiffres."
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Rôle</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                >
                  <option value="Worker">Ouvrier</option>
                  <option value="Project_Chief">Chef de projet</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">RH</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Compétences</label>
                <input
                  type="search"
                  placeholder="Rechercher une compétence..."
                  value={competenceSearch}
                  onChange={e => setCompetenceSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500 mb-2"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto border border-gray-300 p-4 rounded-lg">
                  {filteredCompetences.map(comp => (
                    <label
                      key={comp.competence_id}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.competences.includes(comp.competence_id)}
                        onChange={() => handleCompetenceToggle(comp.competence_id)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span>{comp.name}</span>
                      <span
                        title={comp.description}
                        aria-label={`Description de la compétence: ${comp.description}`}
                      >
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {submitError && <p className="text-red-600 text-sm">{submitError}</p>}
              {submitOk && <p className="text-green-600 text-sm">{submitOk}</p>}
              <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full md:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-orange-500 text-dark hover:bg-orange-600 disabled:opacity-60 shadow-sm cursor-pointer"
                >
                  {submitting ? 'Mise à jour...' : "Mettre à jour l'employé"}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full md:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-red-600 text-dark hover:bg-red-700 shadow-sm cursor-pointer"
                >
                  Supprimer l'employé
                </button>
              </div>
            </form>
          </div>

          {/* --- Add Competence Form --- */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer ">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ajouter une compétence</h2>
            <form onSubmit={handleAddCompetence} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom de la compétence"
                  value={newCompetence.name}
                  onChange={handleCompetenceFormChange}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  placeholder="Description (optionnel)"
                  value={newCompetence.description}
                  onChange={handleCompetenceFormChange}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-60 shadow-sm cursor-pointer"
                  disabled={addingCompetence}
                >
                  {addingCompetence ? 'Ajout...' : 'Ajouter la compétence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
