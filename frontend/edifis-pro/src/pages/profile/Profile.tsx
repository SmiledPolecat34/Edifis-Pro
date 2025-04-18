import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LineChart from "../../components/lineChart/LineChart";
import userService from "../../../services/userService";

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

    // Gestion des changements des inputs texte
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
    };

    // Gestion du changement d'image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSave = async () => {
        try {
            let profilePictureUrl = user.profile_picture;
    
            // Si une nouvelle image est sélectionnée, on l'upload
            if (selectedFile) {
                const uploadResponse = await userService.uploadProfilePicture(selectedFile);
                profilePictureUrl = uploadResponse.profile_picture;
            }
    
            // Mise à jour des informations utilisateur avec la nouvelle image
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
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-zinc-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            ) : (
                                user.lastname
                            )}
                        </h1>
                        <p className="text-slate-500 text-base">
                            {user.role === "Admin"
                                ? "Responsable"
                                : user.role === "Worker"
                                ? "Ouvrier"
                                : user.role === "Manager"
                                ? "Chef de projet"
                                : user.role}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isEditing && (
                            <button
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-red-200 text-red-950 hover:bg-red-300 h-9 px-4 py-2 cursor-pointer"
                                onClick={handleCancel}
                            >
                                Annuler
                            </button>
                        )}
                        <button
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2 cursor-pointer"
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
                            className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <input
                            type="tel"
                            name="numberphone"
                            value={updatedUser.numberphone}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </form>
                </div>
            </div>

            {isEditing && (
                <div className="mt-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block file:h-9 file:px-4 file:py-2 w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors file:focus-visible:outline-1 file:outline-offset-4 file:disabled:pointer-events-none file:disabled:opacity-50 file:cursor-pointer"
                    />
                </div>
            )}

            <div className="h-96 w-full py-8">
                <LineChart />
            </div>
        </main>
    );
}
