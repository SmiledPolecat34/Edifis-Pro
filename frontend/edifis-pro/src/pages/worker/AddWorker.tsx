import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import competenceService, { Competence } from "../../../services/competenceService";
import userService from "../../../services/userService";

type RoleType = "Admin" | "Worker" | "Manager";

export default function AddWorker() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    numberphone: "",
    password: "",
    role: "Worker" as RoleType,
    competences: [] as number[],
  });
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [newCompetence, setNewCompetence] = useState({ name: "", description: "" });
  const [addingCompetence, setAddingCompetence] = useState(false);

  useEffect(() => {
    const fetchCompetences = async () => {
        try {
          const data = await competenceService.getAllCompetences();
          console.log("Compétences récupérées :", data);
          setCompetences(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des compétences :", error);
        }
      };
      
    fetchCompetences();
  }, []);

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

  const handleAddCompetence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddingCompetence(true);
      await competenceService.addCompetence(newCompetence);
      const data = await competenceService.getAllCompetences();
      setCompetences(data);
      setNewCompetence({ name: "", description: "" });
      setAddingCompetence(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la compétence :", error);
      setAddingCompetence(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await userService.createUser(formData);
      console.log("Utilisateur créé avec succès :", newUser);
      navigate("/worker");
    } catch (error) {
      console.error("Erreur lors de la création de l'employé :", error);
    }
  };

  const handleCompetenceToggle = (compId: number) => {
    setFormData((prev) => ({
      ...prev,
      competences: prev.competences.includes(compId)
        ? prev.competences.filter((id) => id !== compId)
        : [...prev.competences, compId],
    }));
  };
  
  
  

  return (
    <main className="min-h-[calc(100dvh-65px)] p-4 bg-gray-100">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Formulaire d'ajout d'employé */}
        <div className="bg-white p-8 rounded-lg shadow-lg md:w-2/3">
          <h1 className="text-3xl font-bold text-slate-950 text-center">Ajouter un employé</h1>
          <p className="text-sm text-slate-500 mb-4 text-center">Remplissez les informations ci-dessous</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
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
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
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
              <label className="block text-sm font-medium">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
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
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mr-2"
                        />
                        <span>{comp.name}</span>
                      </div>
                    );
                  })}
                </div>
            </div>
            <button
              type="submit"
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Ajouter
            </button>
          </form>
        </div>
        {/* Formulaire d'ajout d'une compétence */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-md md:w-1/3">

  <h2 className="text-xl font-semibold text-slate-800 mb-2">Ajouter une compétence</h2>
  <div style={{ display: "flex", flexDirection: "column", gap: "18rem" }}>
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
    <div className="mb-2 p-2 border rounded bg-blue-50">
      <strong>Compétences sélectionnées :</strong>{" "}
      {competences
        .filter((comp) => formData.competences.includes(comp.competence_id))
        .map((comp) => comp.name)
        .join(", ")}
    </div>
    )}
  </div>
</div>

      </div>
    </main>
  );
}
