import { CalendarClock, Loader2, Check, Ban  } from "lucide-react";

interface BadgeProps {
    status: "Prévu" | "En cours" | "Annulé" | "Terminé";
}

export default function Badge({ status }: BadgeProps) {
    const statusConfig = {
        "Prévu": {
            text: "Prévu",
            icon: <CalendarClock size={12} />,
            colorClass: "text-blue-900 bg-blue-100",
        },
        "En cours": {
            text: "En cours",
            icon: <Loader2 size={12} className="animate-spin" />,
            colorClass: "text-yellow-900 bg-yellow-100",
        },
        "Annulé": {
            text: "Annulé",
            icon: <Ban size={12} />,
            colorClass: "text-red-900 bg-red-100",
        },
        "Terminé": {
            text: "Terminé",
            icon: <Check size={12} />,
            colorClass: "text-green-900 bg-green-100",
        },
    };

    const { text, icon, colorClass } = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 h-6 text-xs font-semibold whitespace-nowrap px-2 rounded-md border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${colorClass}`}
        >
            {icon}
            {text}
        </span>
    );
}