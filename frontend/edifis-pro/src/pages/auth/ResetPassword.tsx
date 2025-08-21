import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/images/logo.svg";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmNewPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    newPassword: formData.newPassword,
                    confirmNewPassword: formData.confirmNewPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Une erreur est survenue");
            }

            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Une erreur est survenue");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <main className="h-dvh md:p-8 w-full">
                <div className="relative grid h-full flex-col items-center justify-center lg:max-w-none lg:px-0">
                    <div className="p-4 lg:p-8">
                        <div className="mx-auto flex max-w-[450px] w-full flex-col justify-center gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <img src={logo} alt="Edifis Pro" className="h-8 w-8" />
                                <h1 className="text-2xl font-semibold text-slate-950">Lien invalide</h1>
                            </div>
                            <div className="text-center space-y-4">
                                <p className="text-sm text-slate-600">
                                    Le lien de réinitialisation est invalide ou a expiré.
                                </p>
                                <Link 
                                    to="/forgot-password" 
                                    className="inline-block text-sm text-slate-950 underline underline-offset-4 hover:text-slate-700 transition-colors"
                                >
                                    Demander un nouveau lien
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (success) {
        return (
            <main className="h-dvh md:p-8 w-full">
                <div className="relative grid h-full flex-col items-center justify-center lg:max-w-none lg:px-0">
                    <div className="p-4 lg:p-8">
                        <div className="mx-auto flex max-w-[450px] w-full flex-col justify-center gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <img src={logo} alt="Edifis Pro" className="h-8 w-8" />
                                <h1 className="text-2xl font-semibold text-slate-950">Mot de passe réinitialisé !</h1>
                            </div>
                            <div className="text-center space-y-4">
                                <p className="text-sm text-slate-600">
                                    Votre mot de passe a été réinitialisé avec succès.
                                </p>
                                <p className="text-sm text-slate-600">
                                    Vous allez être redirigé vers la page de connexion...
                                </p>
                                <Link 
                                    to="/login" 
                                    className="inline-block text-sm text-slate-950 underline underline-offset-4 hover:text-slate-700 transition-colors"
                                >
                                    Se connecter maintenant
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="h-dvh md:p-8 w-full">
            <div className="relative grid h-full flex-col items-center justify-center lg:max-w-none lg:px-0">
                <div className="p-4 lg:p-8">
                    <div className="mx-auto flex max-w-[350px] w-full flex-col justify-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <img src={logo} alt="Edifis Pro" className="h-8 w-8" />
                            <Link to='/' className="flex justify-center items-center text-2xl font-semibold text-slate-950 uppercase">
                                Edifis <span className="font-light">Pro</span>
                            </Link>
                            <h1 className="text-xl font-semibold text-slate-950">Réinitialiser le mot de passe</h1>
                            <p className="text-sm text-slate-500 text-center">
                                Entrez votre nouveau mot de passe
                            </p>
                        </div>
                        <div className="grid gap-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium" htmlFor="newPassword">
                                            Nouveau mot de passe
                                        </label>
                                        <input 
                                            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            id="newPassword" 
                                            placeholder="••••••••" 
                                            type="password" 
                                            value={formData.newPassword} 
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium" htmlFor="confirmNewPassword">
                                            Confirmer le mot de passe
                                        </label>
                                        <input 
                                            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            id="confirmNewPassword" 
                                            placeholder="••••••••" 
                                            type="password" 
                                            value={formData.confirmNewPassword} 
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <button 
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-all focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 cursor-pointer disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2"
                                        disabled={loading || !formData.newPassword || !formData.confirmNewPassword}
                                        type="submit"
                                    >
                                        {loading ? "Réinitialisation..." : "Réinitialiser"}
                                    </button>
                                </div>
                            </form>
                            <div className="text-center">
                                <Link 
                                    to="/login" 
                                    className="text-sm text-slate-600 hover:text-slate-950 transition-colors"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
