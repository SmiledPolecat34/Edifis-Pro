import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import competenceService, { Competence } from "../../../services/competenceService";
import userService from "../../../services/userService";

type RoleType = "Admin" | "Worker" | "Manager";

// Interface User attendue par userService.createUser
interface UserPayload {
  firstname: string;
  lastname: string;
  email: string;
  numberphone: string;
  role: RoleType;
  competences: Competence[]; // tableau d’objets Competence, pas seulement d’IDs
}

export default function AddWorker() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    numberphone: "",
    password: "",
    role: "Worker" as RoleType,
    competences: [] as number[], // tableau d’IDs de compétences
  });

  const [competences, setCompetences] = useState<Competence[]>([]);
  const [newCompetence, setNewCompetence] = useState({ name: "", description: "" });
  const [addingCompetence, setAddingCompetence] = useState(false);

  // Charger la liste des compétences au montage
  useEffect(() => {
    const fetchCompetences = async () => {
      try {
        const data = await competenceService.getAllCompetences();
        console.log("Compétences récupérées :", data);
        setCompetences(data.competences);
      } catch (error) {
        console.error("Erreur lors de la récupération des compétences :", error);
      }
    };
    fetchCompetences();
  }, []);

  useEffect(() => {
  // debounce: attend 350ms après la dernière frappe
  const t = setTimeout(async () => {
    const first = formData.firstname.trim();
    const last  = formData.lastname.trim();

    if (!first) {
      setFormData((prev) => ({ ...prev, email: "" }));
      return;
    }

    try {
      const { email } = await userService.suggestEmail(first, last);
      setFormData(prev => ({ ...prev, email }));
    } catch {
      const local = last ? `${first.toLowerCase()}.${last.toLowerCase()}` : first.toLowerCase();
      setFormData(prev => ({ ...prev, email: `${local}@edifis-pro.com` }));
    }
  }, 350);

  return () => clearTimeout(t);
}, [formData.firstname, formData.lastname]);

const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);
const [submitOk, setSubmitOk] = useState<string | null>(null); // pour afficher le mdp temporaire

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  let newValue = value;

  if (name === "lastname") {
    newValue = newValue.replace(/[^a-zA-ZÀ-ÖÙ-öù-ÿ-]/g, "").toUpperCase();
  } else if (name === "firstname") {
    newValue = newValue.replace(/[^a-zA-ZÀ-ÖÙ-öù-ÿ-]/g, "");
  }

  setFormData((prev) => ({ ...prev, [name]: newValue }));
};

  const handleCompetenceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCompetence((prev) => ({ ...prev, [name]: value }));
  };

  // Ajouter une nouvelle compétence à la base
  const handleAddCompetence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddingCompetence(true);
      await competenceService.addCompetence(newCompetence);
      const data = await competenceService.getAllCompetences();
      setCompetences(data);
      setNewCompetence({ name: "", description: "" });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la compétence :", error);
    } finally {
      setAddingCompetence(false);
    }
  };

  // Cocher/décocher une compétence (stocke l’ID dans formData.competences)
  const handleCompetenceToggle = (compId: number) => {
    setFormData((prev) => ({
      ...prev,
      competences: prev.competences.includes(compId)
        ? prev.competences.filter((id) => id !== compId)
        : [...prev.competences, compId],
    }));
  };

  // Soumettre le formulaire : on convertit d’abord les IDs en objets Competence[]
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setSubmitError(null);
  setSubmitOk(null);

  const selectedCompetences: Competence[] = competences.filter((comp) =>
    formData.competences.includes(comp.competence_id)
  );

  const newUser: UserPayload = {
    firstname: formData.firstname,
    lastname: formData.lastname,
    email: formData.email,
    numberphone: formData.numberphone,
    role: formData.role,
    competences: selectedCompetences,
  };

    try {
    console.log("payload envoyé:", newUser);
    const res = await userService.createUser(newUser);
    setSubmitOk(`Utilisateur créé. Mot de passe provisoire : ${res.tempPassword ?? "généré"}`);
    setTimeout(() => navigate("/workers"), 1200);
  } catch (err: any) {
  console.error("createUser error:", err); // va afficher Error: <message du serveur>
  setSubmitError(err?.message || "Erreur inconnue.");
} finally {
  setSubmitting(false);
}
};

  return (
    <main className="min-h-[calc(100dvh-65px)] p-4 bg-gray-100">
      <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 text-center"
          >
            Retour
          </button>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Formulaire d'ajout d'employé */}
        <div className="bg-white p-8 rounded-lg shadow-lg md:w-2/3">
          <h1 className="text-3xl font-bold text-slate-950 text-center">Ajouter un employé</h1>
          <p className="text-sm text-slate-500 mb-4 text-center">Remplissez les informations ci-dessous</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">Prénom</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Nom</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <div className="opacity-60 pointer-events-none">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Numéro de téléphone</label>
              <input
                type="text"
                name="numberphone"
                value={formData.numberphone}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <div className="opacity-60 pointer-events-none">
                <label className="block text-sm font-medium">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  value="edifispr@2025"
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Rôle</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md"
              >
                <option value="Admin">Admin</option>
                <option value="Worker">Worker</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Compétences</label>
              <div className="mt-1 flex flex-col gap-2 max-h-48 overflow-y-auto">
                {competences.map((comp) => {
                  const isSelected = formData.competences.includes(comp.competence_id);
                  return (
                    <div
                      key={comp.competence_id}
                      onClick={() => handleCompetenceToggle(comp.competence_id)}
                      className={`flex items-center p-2 border rounded-md cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-100 border-blue-400" : "bg-white"
                      }`}
                    >
                      <input type="checkbox" checked={isSelected} readOnly className="mr-2" />
                      <span>{comp.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {submitError && <p className="text-red-600 text-sm mb-2">{submitError}</p>}
            {submitOk && <p className="text-green-600 text-sm mb-2">{submitOk}</p>}
                          
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              {submitting ? "Création en cours…" : "Ajouter"}
            </button>
          </form>
        </div>

        {/* Formulaire d'ajout d'une compétence */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-md md:w-1/3">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Ajouter une compétence</h2>
          <form onSubmit={handleAddCompetence} className="space-y-2">
            <input
              type="text"
              name="name"
              placeholder="Nom de la compétence"
              value={newCompetence.name}
              onChange={handleCompetenceFormChange}
              className="w-full p-2 border rounded-md"
              required
            />
            <textarea
              name="description"
              placeholder="Description (optionnel)"
              value={newCompetence.description}
              onChange={handleCompetenceFormChange}
              className="w-full p-2 border rounded-md"
            />
            <button
              type="submit"
              className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
              disabled={addingCompetence}
            >
              {addingCompetence ? "Ajout en cours..." : "Ajouter la compétence"}
            </button>
          </form>

          {formData.competences.length > 0 && (
            <div className="mt-4 p-2 border rounded bg-blue-50">
              <strong>Compétences sélectionnées :</strong>{" "}
              {competences
                .filter((comp) => formData.competences.includes(comp.competence_id))
                .map((comp) => comp.name)
                .join(", ")}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
