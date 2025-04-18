import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Task {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
}

interface TaskData {
    date: string;
    startHour: number;
    endHour: number;
    title: string;
    start_date: string;
    end_date: string;
    status: string;
}

const generateTaskData = (tasks: Task[]): TaskData[] => {
    const result: TaskData[] = [];
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    tasks.forEach(task => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);

        for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
            if (day >= today && day <= nextWeek) {
                const currentDayStr = day.toISOString().split('T')[0];
                const taskStartDayStr = startDate.toISOString().split('T')[0];
                const taskEndDayStr = endDate.toISOString().split('T')[0];

                result.push({
                    date: currentDayStr,
                    startHour: currentDayStr === taskStartDayStr ? startDate.getUTCHours() : 0,
                    endHour: currentDayStr === taskEndDayStr ? endDate.getUTCHours() : 24,
                    title: task.title,
                    start_date: task.start_date,
                    end_date: task.end_date,
                    status: task.status
                });
            }
        }
    });
    return result;
};

interface CustomTooltipProps {
    active: boolean;
    payload: { payload: TaskData }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const { title, start_date, end_date, status } = payload[0].payload;
        return (
            <div className="custom-tooltip bg-white p-3 rounded-md border border-slate-200 shadow-md">
                <p className="text-slate-950 text-sm font-bold">{title}</p>
                <p className="text-slate-950 text-xs">{`Date de début: ${new Date(start_date).toLocaleString()}`}</p>
                <p className="text-slate-950 text-xs">{`Date de fin: ${new Date(end_date).toLocaleString()}`}</p>
                <p className="text-slate-950 text-xs">{`Statut: ${status}`}</p>
            </div>
        );
    }
    return null;
};

interface TimelineChartProps {
    tasks: Task[];
}

export default function TimelineChart({ tasks }: TimelineChartProps) {
    const data = generateTaskData(tasks);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                width={500}
                height={300}
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#dddddd" />
                <XAxis dataKey="date" stroke="#333" />
                <Tooltip content={<CustomTooltip />} />

                <Bar dataKey="startHour" stackId="a" fill="transparent" />
                <Bar dataKey="endHour" stackId="a" fill="#fd8d3c" />
            </BarChart>
        </ResponsiveContainer>
    );
}
