import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LineChart from "../../components/lineChart/LineChart";
import userService from "../../../services/userService";

const roleLabels: Record<string, string> = {
  Admin: "Responsable",
  Worker: "Ouvrier",
  Manager: "Manager",
  Project_Manager: "Chef de projet",
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ ...user });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(
    user.profile_picture
      ? `http://localhost:5000/uploads/profile_pictures/${user.profile_picture}`
      : "https://i.pinimg.com/736x/ab/32/b1/ab32b1c5a8fabc0b9ae72250ce3c90c2.jpg"
  );

  // Champs mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwOk, setPwOk] = useState("");
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
      console.error("Erreur lors de la mise à jour du profil :", error);
    }
  };

  const handleCancel = () => {
    setUpdatedUser({ ...user });
    setPreviewImage(
      user.profile_picture
        ? `http://localhost:5000/uploads/profile_pictures/${user.profile_picture}`
        : "https://i.pinimg.com/736x/ab/32/b1/ab32b1c5a8fabc0b9ae72250ce3c90c2.jpg"
    );
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwOk("");

    if (newPassword !== confirm) {
      setPwError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      setPwLoading(true);
      await userService.updatePassword(currentPassword, newPassword);
      setPwOk("Mot de passe mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err: any) {
      setPwError(err?.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-65px)] md:p-8 p-4 bg-gray-100">
      <div className="flex h-48 w-48 overflow-hidden rounded-xl mb-4">
        <img
          className="object-cover h-full w-full"
          src={previewImage}
          alt="Photo de profil"
        />
      </div>

      <div className="w-full">
        <div className="flex justify-between flex-wrap mb-5">
          <div>
            <h1 className="text-3xl font-semibold space-y-2">
              {isEditing ? (
                <input
                  type="text"
                  name="firstname"
                  value={updatedUser.firstname}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-1"
                />
              ) : (
                user.firstname
              )}{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="lastname"
                  value={updatedUser.lastname}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-1"
                />
              ) : (
                user.lastname
              )}
            </h1>
            <p className="text-slate-500 text-base">
              {roleLabels[user.role?.name || ""] || "Non défini"}
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <button
                className="bg-red-200 text-red-950 hover:bg-red-300 h-9 px-4 py-2 rounded-md"
                onClick={handleCancel}
              >
                Annuler
              </button>
            )}
            <button
              className="bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 rounded-md"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? "Sauvegarder" : "Modifier"}
            </button>
          </div>
        </div>

        <div>
          <h2>Informations</h2>
          <form className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              onChange={handleChange}
              readOnly={!isEditing}
              className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm"
            />
            <input
              type="tel"
              name="numberphone"
              value={updatedUser.numberphone}
              onChange={handleChange}
              readOnly={!isEditing}
              className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm"
            />
          </form>
        </div>
      </div>

      {isEditing && (
        <>
          <div className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block file:h-9 file:px-4 file:py-2 w-full text-sm text-slate-500"
            />
          </div>

          <section className="border-t border-slate-200 pt-6 mt-6">
            <h2 className="font-semibold mb-3">Changer mon mot de passe</h2>
            <form
              onSubmit={handleChangePassword}
              className="grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
              <div>
                <label className="block text-sm font-medium">Mot de passe actuel</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Nouveau mot de passe</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded-md"
                  required
                  minLength={8}
                />
              </div>

              <div className="lg:col-span-2 space-y-2">
                {pwError && <p className="text-sm text-red-600">{pwError}</p>}
                {pwOk && <p className="text-sm text-green-600">{pwOk}</p>}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full lg:w-auto text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-md text-sm px-5 py-2.5"
                >
                  {pwLoading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                </button>
              </div>
            </form>
          </section>
        </>
      )}

      <div className="h-96 w-full py-8">
        <LineChart />
      </div>
    </main>
  );
}
