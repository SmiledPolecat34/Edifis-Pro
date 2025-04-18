import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <main className="flex justify-center items-center flex-col h-dvh pattern overflow-hidden">
            <h1 className="text-6xl font-medium mb-2">Page introuvable</h1>
            <p className='text-slate-500'>Désolé, la page que vous recherchez n'existe pas.</p>
            <Link to='/' className="absolute top-8 left-8 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-1 outline-offset-4 disabled:pointer-events-none disabled:opacity-50 bg-slate-200 text-slate-950 hover:bg-slate-300 h-9 py-2 pl-3.5 pr-4">
                <ChevronLeft size={16} className='text-slate-950 mr-2' />
                Retour
            </Link>
        </main>
    )
}