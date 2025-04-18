import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import constructionSiteService from "../../../services/constructionSiteService";
import userService, { User } from "../../../services/userService";

export default function AddConstruction() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState<User[]>([]);

  // On déclare un état pour tous nos champs
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    adresse: "",
    chef_de_projet_id: "",
    state: "En cours", // Valeur par défaut
    start_date: "",
    end_date: "",
  });

  // Image sélectionnée
  const [image, setImage] = useState<File | null>(null);

  // Au chargement, on récupère tous les managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const managersData = await userService.getAllManagers();
        setManagers(managersData);
      } catch (error) {
        console.error("Erreur lors de la récupération des managers :", error);
      }
    };
    fetchManagers();
  }, []);

  // Gestion des champs "text", "select", etc.
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    let { name, value } = e.target;

    if (name === "name") {
      // Autorise lettres, chiffres, espaces, tiret, underscore
      value = value.replace(/[^a-zA-Z0-9\s\-_]/g, "");
    }
    if (name === "description") {
      // Retire < et >
      value = value.replace(/[<>]/g, "");
    }
    if (name === "adresse") {
      // Autorise lettres, chiffres, espaces, virgule
      value = value.replace(/[^a-zA-Z0-9\s,]/g, "");
    }

    // On met à jour l'état
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion du fichier image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Vérifie l’extension
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension && allowedExtensions.includes(extension)) {
        setImage(file);
      } else {
        alert("Extension non autorisée. Veuillez sélectionner un fichier JPG, JPEG, ou PNG.");
      }
    }
  };

  // Envoi du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // On va créer un objet FormData qui contient toutes les infos
    const formDataToSend = new FormData();

    // On convertit chef_de_projet_id en nombre s’il est renseigné
    // (sinon, on laisse vide -> NULL)
    const data = {
      ...formData,
      chef_de_projet_id: formData.chef_de_projet_id
        ? parseInt(formData.chef_de_projet_id, 10)
        : undefined,
    };

    // On parcourt l'objet "data" et on ajoute chaque champ à FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataToSend.append(key, String(value));
      }
    });

    // Si on a sélectionné un fichier image, on l’ajoute
    if (image) {
      formDataToSend.append("image", image);
    }

    // Juste pour debug, affiche le contenu de FormData dans la console
    console.log("FormData envoyé :", Object.fromEntries(formDataToSend));

    try {
      // Appel du service (multipart/form-data)
      await constructionSiteService.create(formDataToSend);
      console.log("Chantier ajouté avec succès");
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de l'ajout du chantier :", error);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-65px)] p-8 bg-gray-100 flex justify-center">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Ajouter un chantier
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nom du chantier"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />

          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            value={formData.adresse}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />

          <select
            name="chef_de_projet_id"
            value={formData.chef_de_projet_id}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          >
            <option value="">Sélectionner un chef de chantier</option>
            {managers.map((manager) => (
              <option key={manager.user_id} value={manager.user_id}>
                {manager.firstname} {manager.lastname}
              </option>
            ))}
          </select>

          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          >
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
            <option value="Prevu">Prévu</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            />
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            />
          </div>

          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="w-full p-3 border rounded"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            Ajouter
          </button>
        </form>
      </div>
    </main>
  );
}
