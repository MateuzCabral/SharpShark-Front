import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "HTTP/HTTPS", value: 45 },
  { name: "TCP", value: 25 },
  { name: "UDP", value: 15 },
  { name: "DNS", value: 10 },
  { name: "Outros", value: 5 },
];

const COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(199, 89%, 58%)",
  "hsl(199, 89%, 38%)",
  "hsl(199, 89%, 68%)",
  "hsl(217, 32%, 30%)",
];

export const ProtocolDistribution = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
