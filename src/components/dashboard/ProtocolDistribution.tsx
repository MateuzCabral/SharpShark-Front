import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertCircle } from "lucide-react";

interface ProtocolDataPoint {
  name: string;
  value: number;
}

interface ProtocolDistributionProps {
  data: ProtocolDataPoint[];
}

const COLORS = [
  "#3b82f6", // Azul (Primary-like)
  "#10b981", // Verde Esmeralda
  "#f97316", // Laranja
  "#ec4899", // Rosa
  "#8b5cf6", // Roxo
  "#a1a1aa", // Cinza (para 'Outros' ou sexta cor)
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius = 0, outerRadius = 0, percent, name }: any) => {
  const radius = outerRadius * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent * 100).toFixed(0);

  if (percent < 0.05) return null;

  return (
    <text
       x={x}
       y={y}
       fill="hsl(var(--primary-foreground))"
       textAnchor={x > cx ? 'start' : 'end'}
       dominantBaseline="central"
       fontSize={10}
       fontWeight={500}
    >
      {`${name.length > 10 ? '' : name + ' '}${percentage}%`}
    </text>
  );
};


export const ProtocolDistribution = ({ data }: ProtocolDistributionProps) => {

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/30 rounded-md">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Não há dados de protocolo disponíveis.</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => {
      if (a.name === 'Outros') return 1;
      if (b.name === 'Outros') return -1;
      return b.value - a.value;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sortedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={110}
          fill="#8884d8" 
          dataKey="value"
          paddingAngle={1}
        >
          {sortedData.map((entry, index) => (
            <Cell
               key={`cell-${index}-${entry.name}`}
               fill={COLORS[index % COLORS.length]}
               stroke={"hsl(var(--card))"}
               strokeWidth={1}
            />
          ))}
        </Pie>

        <Tooltip
          cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
          contentStyle={{
            backgroundColor: "hsl(var(--card) / 0.95)",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            padding: "8px 12px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
          itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
          formatter={(value: number, name: string) => {
              const total = sortedData.reduce((acc, curr) => acc + curr.value, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return [`${value.toLocaleString()} (${percentage}%)`, name];
          }}
        />

        <Legend
           iconType="circle" 
           iconSize={8}
           wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

