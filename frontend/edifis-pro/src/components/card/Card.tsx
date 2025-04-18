import Badge from "../../components/badge/Badge";

interface CardProps {
    data: Record<string, any>;
}

export default function Card({ data }: CardProps) {
    const extraEntries = Object.entries(data).filter(
        ([key]) => !["id", "title", "description", "dateStart", "dateEnd", "status"].includes(key)
    );

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center flex-wrap mb-2">
                <h3 className="font-semibold text-slate-900 mr-2">{data.title}</h3>
                {data.status && <Badge status={data.status} />}
            </div>

            <p className="text-sm text-slate-700 mb-2">{data.description}</p>

            {data.dateStart && data.dateEnd && (
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500">
                        Début → {new Date(data.dateStart).toLocaleDateString()} - {new Date(data.dateStart).toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-slate-500">
                        Fin → {new Date(data.dateEnd).toLocaleDateString()} à {new Date(data.dateEnd).toLocaleTimeString()}
                    </span>
                </div>
            )}

            {extraEntries.length > 0 && <div className="my-2 border-b border-slate-200" />}

            {extraEntries.map(([key, value]) => (
                <p key={key} className="text-sm text-slate-700">
                    <strong className="capitalize">{key} :</strong> {value}
                </p>
            ))}
        </div>
    );
}