// frontend\edifis-pro\src\pages\worker\WorkerDetails.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import userService, { User } from "../../../services/userService";
import competenceService, { Competence } from "../../../services/competenceService";
import Loading from "../../components/loading/Loading";

const DEFAULT_IMAGE = "https://www.capcampus.com/img/u/1/job-etudiant-batiment.jpg";

export default function WorkerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State pour l'employé
  const [worker, setWorker] = useState<User | null>(null);

  // State pour la liste complète des compétences récupérées depuis l'API
  const [allSkills, setAllSkills] = useState<Competence[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupère les infos du worker
        const data = await userService.getById(Number(id));
        if (!data.competences) {
          data.competences = [];
        }

        // Récupère TOUTES les compétences
        const skills = await competenceService.getAllCompetences();

        // Mets à jour les 2 states
        setWorker(data);
        setAllSkills(skills);
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setWorker((prevWorker) => {
      if (!prevWorker) return null;
      const { name, value } = e.target;
      let newValue = value;
      // Filtrage du champ firstname
      if (name === "firstname") {
        newValue = newValue.replace(/[^a-zA-ZÀ-ÖÙ-öù-ÿ-]/g, "");
      } else if (name === "lastname") {
        // Filtrage du champ lastname
        newValue = newValue.replace(/[^a-zA-ZÀ-ÖÙ-öù-ÿ-]/g, "").toUpperCase();
      }
      return { ...prevWorker, [name]: newValue };
    });
  };

  const handleSkillChange = (skillId: number) => {
    if (!worker) return;

    const currentSkills = worker.competences || [];
    const exists = currentSkills.some((c) => c.competence_id === skillId);
    let updatedSkills;

    if (exists) {
      // Supprime la compétence
      updatedSkills = currentSkills.filter((c) => c.competence_id !== skillId);
    } else {
      // Ajoute la compétence
      const skillName = allSkills.find((s) => s.competence_id === skillId)?.name || "";
      updatedSkills = [...currentSkills, { competence_id: skillId, name: skillName }];
    }

    setWorker((prev) =>
      prev ? { ...prev, competences: updatedSkills } : null
    );
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      try {
        if (worker && worker.user_id !== undefined) {
          await userService.delete(worker.user_id);
          navigate("/worker");
        }
      } catch (err) {
        console.error("Erreur lors de la suppression :", err);
      }
    }
  };

  const handleSave = async () => {
    if (!worker || worker.user_id === undefined) return;
    try {
      console.log("Enregistrement des modifications pour le worker :", worker);
      // Mise à jour via userService.update
      await userService.update(worker.user_id, worker);
      setIsEditing(false);
      console.log("Mise à jour réussie !");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
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
            worker.email
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
          ) : (
            worker.numberphone || "Non renseigné"
          )}
        </p>
        <p>
          <strong>Rôle : </strong>
          {isEditing ? (
            <select
              name="role"
              value={worker.role}
              onChange={handleChange}
              className="border border-gray-300 rounded p-1"
            >
              <option value="Worker">Ouvrier</option>
              <option value="Manager">Chef de projet</option>
            </select>
          ) : worker.role === "Worker" ? (
            "Ouvrier"
          ) : (
            "Chef de projet"
          )}
        </p>
        <p>
          <strong>Compétences :</strong>
        </p>

        {isEditing ? (
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {allSkills.map((skill) => {
              const isSelected = worker.competences?.some(
                (c) => c.competence_id === skill.competence_id
              );
              return (
                <label
                  key={skill.competence_id}
                  onClick={() => handleSkillChange(skill.competence_id)}
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
                  <span>{skill.name}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p>
            {worker.competences && worker.competences.length > 0
              ? worker.competences.map((c) => c.name).join(", ")
              : "Non spécifié"}
          </p>
        )}

        <p>
          <strong>Date de création :</strong>{" "}
          {worker.createdAt || "Non spécifiée"}
        </p>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              }
              setIsEditing(!isEditing);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {isEditing ? "Enregistrer" : "Modifier"}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </main>
  );
}
