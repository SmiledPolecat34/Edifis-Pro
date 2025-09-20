import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import constructionSiteService from '../../../services/constructionSiteService';
import userService, { User } from '../../../services/userService';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('fr', fr);
setDefaultLocale('fr');

export default function AddConstruction() {
  const navigate = useNavigate();
  const [projectChiefs, setProjectChiefs] = useState<User[]>([]);

  // On déclare un état pour tous nos champs
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adresse: '',
    chef_de_projet_id: '',
    state: 'En cours', // Valeur par défaut
    start_date: '',
    end_date: '',
  });

  // Image sélectionnée
  const [image, setImage] = useState<File | null>(null);

  // Au chargement, on récupère tous les chefs de projet
  useEffect(() => {
    const fetchProjectChiefs = async () => {
      try {
        const projectChiefsData = await userService.getAllProjectChiefs();
        console.log('Chefs de projet récupérés :', projectChiefsData);
        setProjectChiefs(projectChiefsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des chefs de projet :', error);
      }
    };
    fetchProjectChiefs();
  }, []);

  // Gestion des champs "text", "select", etc.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    let { name, value } = e.target;

    if (name === 'name') {
      // Autorise lettres, chiffres, espaces, tiret, underscore
      value = value.replace(/[^a-zA-Z0-9\s\-_]/g, '');
    }
    if (name === 'description') {
      // Retire < et >
      value = value.replace(/[<>]/g, '');
    }
    if (name === 'adresse') {
      // Autorise lettres, chiffres, espaces, virgule
      value = value.replace(/[^a-zA-Z0-9\s,]/g, '');
    }

    // On met à jour l'état
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion du fichier image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Vérifie l’extension
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && allowedExtensions.includes(extension)) {
        setImage(file);
      } else {
        alert('Extension non autorisée. Veuillez sélectionner un fichier JPG, JPEG, ou PNG.');
      }
    }
  };

  // Envoi du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.end_date &&
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      alert('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

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
      formDataToSend.append('image', image);
    }

    // Juste pour debug, affiche le contenu de FormData dans la console
    console.log('FormData envoyé :', Object.fromEntries(formDataToSend));

    try {
      // Appel du service (multipart/form-data)
      await constructionSiteService.create(formDataToSend);
      console.log('Chantier ajouté avec succès');
      navigate('/construction');
    } catch (error) {
      console.error("Erreur lors de l'ajout du chantier :", error);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm mr-4  cursor-pointer"
          >
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Ajouter un chantier</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Nom du chantier</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                required
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Chef de projet</label>
              <select
                name="chef_de_projet_id"
                value={formData.chef_de_projet_id}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">
                  {projectChiefs.length
                    ? 'Sélectionner un chef de projet'
                    : 'Aucun chef de projet disponible'}
                </option>
                {projectChiefs.map(chief => (
                  <option key={chief.user_id} value={chief.user_id}>
                    {chief.firstname} {chief.lastname}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Statut</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="En cours">En cours</option>
                <option value="Prévu">Prévu</option>
                <option value="Terminé">Terminé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Date de début</label>
              <DatePicker
                selected={formData.start_date ? new Date(formData.start_date) : null}
                onChange={(date: Date) =>
                  setFormData(prev => ({ ...prev, start_date: date.toISOString().split('T')[0] }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                minDate={new Date()}
                locale="fr"
                dateFormat="P"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date de fin</label>
              <DatePicker
                selected={formData.end_date ? new Date(formData.end_date) : null}
                onChange={(date: Date) =>
                  setFormData(prev => ({ ...prev, end_date: date.toISOString().split('T')[0] }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                minDate={formData.start_date ? new Date(formData.start_date) : new Date()}
                locale="fr"
                dateFormat="P"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Image du chantier</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>

          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
            >
              Ajouter le chantier
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
