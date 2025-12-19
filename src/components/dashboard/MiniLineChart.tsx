import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniLineChartProps {
  data: { value: number }[];
  color: string;
}

export const MiniLineChart = ({ data, color }: MiniLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
