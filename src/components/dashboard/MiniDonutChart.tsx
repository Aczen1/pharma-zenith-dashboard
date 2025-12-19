import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MiniDonutChartProps {
  value: number;
  total: number;
  color: string;
}

export const MiniDonutChart = ({ value, total, color }: MiniDonutChartProps) => {
  const data = [
    { name: "filled", value },
    { name: "empty", value: total - value },
  ];

  return (
    <ResponsiveContainer width="100%" height={70}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={20}
          outerRadius={30}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="rgba(255,255,255,0.2)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};
