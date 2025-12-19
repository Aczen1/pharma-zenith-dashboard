import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface MiniAreaChartProps {
  data: { value: number }[];
  color: string;
  gradientId: string;
}

export const MiniAreaChart = ({ data, color, gradientId }: MiniAreaChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
