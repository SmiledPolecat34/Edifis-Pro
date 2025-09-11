import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Site {
  name: string;
  taskCount: number;
}

interface SiteTaskChartProps {
  sites: Site[];
}

export default function SiteTaskChart({ sites }: SiteTaskChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sites} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="taskCount" fill="#fd8d3c" />
      </BarChart>
    </ResponsiveContainer>
  );
}
