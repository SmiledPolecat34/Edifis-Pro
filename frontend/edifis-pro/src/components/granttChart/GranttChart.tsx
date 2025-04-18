import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

const tasks = [
    { worker: "Jean Dupont", task: "Maçonnerie", start: "2025-03-04T08:00:00", end: "2025-03-04T12:00:00" },
    { worker: "Jean Dupont", task: "Électricité", start: "2025-03-04T13:00:00", end: "2025-03-04T17:00:00" },
    { worker: "Alice Martin", task: "Peinture", start: "2025-03-04T09:00:00", end: "2025-03-04T11:00:00" },
    { worker: "Alice Martin", task: "Plomberie", start: "2025-03-04T14:00:00", end: "2025-03-04T18:00:00" }
];

const formattedData = tasks.map(task => ({
    x: new Date(task.start).getTime(),  // Date pour l'axe X (jour)
    z: new Date(task.end).getTime(),
    y: new Date(task.start).getHours(),  // Heure pour l'axe Y (basé sur l'heure de début)
    worker: task.worker,
    task: task.task
}));

const COLORS: Record<string, string> = {
    "Maçonnerie": "#7c4df5",
    "Électricité": "#f57c00",
    "Peinture": "#5d58d2",
    "Plomberie": "#CCCCCC"
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any }) => {
    if (active && payload && payload.length) {
        const { worker, task, x, z } = payload[0].payload;
        return (
            <div className="bg-white p-2 border rounded shadow">
                <p className="text-sm font-bold">{worker}</p>
                <p className="text-xs">{task}</p>
                <p className="text-xs">{new Date(x).toLocaleTimeString()} - {new Date(z).toLocaleTimeString()}</p>
            </div>
        );
    }
    return null;
};

export default function GanttChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
                margin={{ top: 5, right: 5, bottom: 40, left: 40 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    type="number"
                    dataKey="x"
                    domain={["auto", "auto"]}
                    tickFormatter={(time) => new Date(time).toLocaleDateString()}
                    label={{ value: "Jours", position: "insideBottom", offset: -20 }}
                />
                <YAxis
                    type="number"
                    dataKey="y"
                    domain={[0, 24]}
                    tickFormatter={(value) => `${value}:00`}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Scatter
                    name="Tâches"
                    data={formattedData}
                    fill="#8884d8"
                    shape={(props: any) => {
                        const { xAxis, payload } = props;
                        const width = xAxis.scale(payload.z) - xAxis.scale(payload.x);
                        return (
                            <rect
                                fill={COLORS[payload.task]}
                                x={props.cx}
                                y={props.cy - 5}
                                width={width}
                                height={10}
                            />
                        );
                    }}
                />
            </ScatterChart>
        </ResponsiveContainer>
    );
}