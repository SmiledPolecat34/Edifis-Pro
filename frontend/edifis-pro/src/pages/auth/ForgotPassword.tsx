import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/images/logo.svg";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Une erreur est survenue");
            }

            setSuccess(true);
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

    if (success) {
        return (
            <main className="h-dvh md:p-8 w-full">
                <div className="relative grid h-full flex-col items-center justify-center lg:max-w-none lg:px-0">
                    <div className="p-4 lg:p-8">
                        <div className="mx-auto flex max-w-[450px] w-full flex-col justify-center gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <img src={logo} alt="Edifis Pro" className="h-8 w-8" />
                                <h1 className="text-2xl font-semibold text-slate-950">Email envoyé !</h1>
                            </div>
                            <div className="text-center space-y-4">
                                <p className="text-sm text-slate-600">
                                    Si un compte existe avec l'adresse email {email}, vous recevrez un lien pour réinitialiser votre mot de passe.
                                </p>
                                <p className="text-sm text-slate-600">
                                    Vérifiez votre boîte de réception et vos spams.
                                </p>
                                <Link 
                                    to="/login" 
                                    className="inline-block text-sm text-slate-950 underline underline-offset-4 hover:text-slate-700 transition-colors"
                                >
                                    Retour à la connexion
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
                            <h1 className="text-xl font-semibold text-slate-950">Mot de passe oublié</h1>
                            <p className="text-sm text-slate-500 text-center">
                                Entrez votre adresse email pour recevoir un lien de réinitialisation
                            </p>
                        </div>
                        <div className="grid gap-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium" htmlFor="email">
                                            Adresse email
                                        </label>
                                        <input 
                                            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            id="email" 
                                            placeholder="votre@email.com" 
                                            type="email" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <button 
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-all focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 cursor-pointer disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2"
                                        disabled={loading || !email}
                                        type="submit"
                                    >
                                        {loading ? "Envoi en cours..." : "Envoyer le lien"}
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
