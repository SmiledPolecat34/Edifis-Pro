import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import constructionSiteService from '../../../services/constructionSiteService';
import userService, { User } from '../../../services/userService';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('fr', fr);
setDefaultLocale('fr');

export default function EditConstruction() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [projectChiefs, setProjectChiefs] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adresse: '',
    chef_de_projet_id: '',
    state: 'En cours',
    start_date: '',
    end_date: '',
  });

  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchConstructionSite = async () => {
      try {
        const siteData = await constructionSiteService.getById(Number(id));
        setFormData({
          name: siteData.name,
          description: siteData.description || '',
          adresse: siteData.adresse || '',
          chef_de_projet_id: siteData.chef_de_projet_id?.toString() || '',
          state: siteData.state || 'En cours',
          start_date: siteData.start_date || '',
          end_date: siteData.end_date || '',
        });
      } catch (error) {
        console.error('Erreur lors de la récupération du chantier :', error);
      }
    };

    const fetchProjectChiefs = async () => {
      try {
        const projectChiefsData = await userService.getAllProjectChiefs();
        setProjectChiefs(projectChiefsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des chefs de projet :', error);
      }
    };

    fetchConstructionSite();
    fetchProjectChiefs();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

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

    const formDataToSend = new FormData();

    const data = {
      ...formData,
      chef_de_projet_id: formData.chef_de_projet_id
        ? parseInt(formData.chef_de_projet_id, 10)
        : undefined,
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataToSend.append(key, String(value));
      }
    });

    if (image) {
      formDataToSend.append('image', image);
    }

    try {
      await constructionSiteService.update(Number(id), formDataToSend);
      navigate('/construction');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du chantier :', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Modifier le chantier</h1>
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
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
            />
          </div>

          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-5 py-2.5 bg-orange-500 text-dark hover:bg-orange-600 shadow-sm cursor-pointer"
            >
              Mettre à jour le chantier
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
