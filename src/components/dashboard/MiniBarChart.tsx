import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

interface MiniBarChartProps {
  data: { value: number }[];
  color: string;
  highlightLast?: boolean;
}

export const MiniBarChart = ({ data, color, highlightLast = true }: MiniBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <BarChart data={data} barSize={8}>
        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
          {data.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={highlightLast && index === data.length - 1 ? color : `${color}60`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
