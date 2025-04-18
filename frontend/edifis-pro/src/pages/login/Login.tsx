import { Link } from "react-router-dom";
import { useState } from "react";
import authService from "../../../services/authService";
import { useNavigate } from "react-router-dom";
import { LoginData } from "../../../model/Auth";
import logo from "../../assets/images/logo.svg";

import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginData>({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const isDisabled = () => {
        return !formData.email || !formData.password || loading;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await authService.login(formData);
            login(response.token);
            navigate("/");
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="h-dvh md:p-8 w-full">
            <div className="relative grid h-full flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
                <div className="relative h-full flex-col lg:flex hidden p-8 rounded-xl overflow-hidden">
                    <Link to='/' className="relative flex items-center text-sm text-white sm:text-lg font-medium uppercase z-10">
                        <img src={logo} alt="Edifis Pro" className="h-4.5 w-4.5 mr-2" />
                        Edifis <span className="font-light">Pro</span>
                    </Link>
                    <h1 className="relative xl:text-7xl text-5xl font-bold uppercase text-white mt-auto z-10">
                        Construisons ensemble l'avenir, solide et durable.
                    </h1>
                    <img className="absolute inset-0 object-cover w-full h-full brightness-60"
                        src="https://images.unsplash.com/photo-1626885930974-4b69aa21bbf9?q=80&w=1946&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Chantier" />
                </div>
                <div className="p-4 lg:p-8">
                    <div className="mx-auto flex max-w-[350px] w-full flex-col justify-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <img src={logo} alt="Edifis Pro" className="h-8 w-8" />
                            <Link to='/' className="flex justify-center items-center text-2xl font-semibold text-slate-950 uppercase">
                                Edifis <span className="font-light">Pro</span>
                            </Link>
                            <p className="text-sm text-slate-500">Entrez vos identifiants pour vous connecter</p>
                        </div>
                        <div className="grid gap-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-2">
                                    <label className="sr-only" htmlFor="email">Email</label>
                                    <input className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        id="email" placeholder="Email" autoCapitalize="none" autoComplete="email" autoCorrect="off"
                                        type="email" value={formData.email} onChange={handleChange} />
                                    <label className="sr-only" htmlFor="password">Mot de passe</label>
                                    <input className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm text-slate-950 transition-colors placeholder:text-black/60 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        id="password" placeholder="Mot de passe" autoCapitalize="none" autoComplete="password" autoCorrect="off"
                                        type="password" value={formData.password} onChange={handleChange} />
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-all focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500 cursor-pointer disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 px-4 py-2"
                                        disabled={isDisabled()}>
                                        {loading ? "Connexion..." : "Se connecter"}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <p className="px-8 text-center text-sm text-slate-500 ">En cliquant "Se connecter", vous acceptez <a className="underline underline-offset-4 hover:text-slate-950 <<<<<< transition-colors" href="/terms">nos conditions d'utilisation</a> et <a className="underline underline-offset-4 hover:text-slate-950 transition-colors" href="/privacy">notre politique de confidentialité</a>.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
