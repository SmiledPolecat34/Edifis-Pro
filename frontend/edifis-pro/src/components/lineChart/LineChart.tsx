import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TooltipProps {
  active?: boolean;
  payload?: any;
}

const data = [
  { name: "12:00", value: 120 },
  { name: "12:30", value: 150 },
  { name: "13:00", value: 130 },
  { name: "13:30", value: 170 },
  { name: "14:00", value: 160 },
  { name: "14:30", value: 180 },
  { name: "15:00", value: 190 },
];

export default function Chart() {
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const { name } = payload[0].payload;
      return (
        <div className="custom-tooltip bg-slate-200 px-3 py-1 rounded-md border border-slate-200 shadow-md">
          <p className="text-slate-950 text-sm">{name}</p>
        </div>
      );
    }
    return null;
  };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{
                    top: 10,
                    right: 30,
                    left: -10,
                    bottom: 0,
                }}
            >
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6900" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF6900" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    fontSize={12}
                    axisLine={false}
                    interval={50}
                />
                <YAxis fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FF6900"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: -10,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" fontSize={12} axisLine={false} interval={50} />
        <YAxis fontSize={12} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
