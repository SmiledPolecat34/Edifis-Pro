import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LineChart from '../../components/lineChart/LineChart';
import userService from '../../../services/userService';

const roleLabels: Record<string, string> = {
  Admin: 'Responsable',
  Worker: 'Ouvrier',
  Manager: 'Manager',
  Project_Manager: 'Chef de projet',
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ ...user });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(
    user.profile_picture
      ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/profile_pictures/${user.profile_picture}`
      : 'https://i.pinimg.com/736x/ab/32/b1/ab32b1c5a8fabc0b9ae72250ce3c90c2.jpg',
  );

  // Champs mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwOk, setPwOk] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    try {
      let profilePictureUrl = user.profile_picture;
      if (selectedFile) {
        const uploadResponse = await userService.uploadProfilePicture(selectedFile);
        profilePictureUrl = uploadResponse.profile_picture;
      }

      const userToUpdate = {
        ...updatedUser,
        profile_picture: profilePictureUrl,
      };

      await updateUser(userToUpdate);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
    }
  };

  const handleCancel = () => {
    setUpdatedUser({ ...user });
    setPreviewImage(
      user.profile_picture
        ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/profile_pictures/${user.profile_picture}`
        : 'https://i.pinimg.com/736x/ab/32/b1/ab32b1c5a8fabc0b9ae72250ce3c90c2.jpg',
    );
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwOk('');

    if (newPassword !== confirm) {
      setPwError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    try {
      setPwLoading(true);
      await userService.updatePassword({ currentPassword, newPassword });
      setPwOk('Mot de passe mis à jour avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err: any) {
      setPwError(err?.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden shadow-lg">
              <img
                className="object-cover h-full w-full"
                src={previewImage}
                alt="Photo de profil"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstname} {user.lastname}
              </h1>
              <p className="text-lg text-gray-600">
                {roleLabels[user.role?.name || ''] || 'Non défini'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {isEditing && (
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 w-full sm:w-auto shadow-sm"
                onClick={handleCancel}
              >
                Annuler
              </button>
            )}
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 w-full sm:w-auto shadow-sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? 'Sauvegarder' : 'Modifier le profil'}
            </button>
          </div>
        </div>

        {/* --- Main Content Section --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* --- Personal Info Form --- */}
          <div className={isEditing ? '' : 'pointer-events-none opacity-70'}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  name="firstname"
                  value={updatedUser.firstname}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  name="lastname"
                  value={updatedUser.lastname}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={updatedUser.email}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  name="numberphone"
                  value={updatedUser.numberphone}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Photo de profil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* --- Password Change Section --- */}
          {isEditing && (
            <section className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Changer mon mot de passe</h2>
              <form
                onSubmit={handleChangePassword}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-orange-500 focus:ring-orange-500"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirmer le nouveau
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-orange-500 focus:ring-orange-500"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  {pwError && <p className="text-sm text-red-600">{pwError}</p>}
                  {pwOk && <p className="text-sm text-green-600">{pwOk}</p>}
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 shadow-sm"
                  >
                    {pwLoading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {/* --- Stats/Chart Section --- */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques</h2>
          <div className="h-96 w-full">
            <LineChart />
          </div>
        </div>
      </div>
    </main>
  );
}
