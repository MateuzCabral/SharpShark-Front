// src/componentes/dashboard/ProtocolDistribution.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertCircle } from "lucide-react";

// Interface para os pontos de dados esperados
interface ProtocolDataPoint {
  name: string; // Nome do protocolo (ex: "TCP")
  value: number; // Contagem ou porcentagem
}

// Propriedade esperada pelo componente
interface ProtocolDistributionProps {
  data: ProtocolDataPoint[];
}

// --- Novas Cores para as fatias da pizza ---
// Usando cores hexadecimais para maior variedade.
// Escolhidas para bom contraste em tema escuro.
const COLORS = [
  "#3b82f6", // Azul (Primary-like)
  "#10b981", // Verde Esmeralda
  "#f97316", // Laranja
  "#ec4899", // Rosa
  "#8b5cf6", // Roxo
  "#a1a1aa", // Cinza (para 'Outros' ou sexta cor)
];

// Componente customizado para o label da pizza
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius = 0, outerRadius = 0, percent, name }: any) => {
  const radius = outerRadius * 0.6; // Posição a 60% do raio externo
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent * 100).toFixed(0);

  if (percent < 0.05) return null; // Não mostra label para fatias muito pequenas

  return (
    <text
       x={x}
       y={y}
       fill="hsl(var(--primary-foreground))" // Cor do texto clara (do tema)
       textAnchor={x > cx ? 'start' : 'end'}
       dominantBaseline="central"
       fontSize={10}
       fontWeight={500}
    >
      {/* Omitir nome se for muito longo para caber bem */}
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

  // Garante que 'Outros' fique por último na legenda e no tooltip
  const sortedData = [...data].sort((a, b) => {
      if (a.name === 'Outros') return 1;
      if (b.name === 'Outros') return -1;
      // Ordena o restante pelo valor (maior primeiro)
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
          fill="#8884d8" // Cor padrão fallback (sobrescrita por Cell)
          dataKey="value"
          paddingAngle={1} // Espaço entre fatias
        >
          {/* Mapeia os dados para criar as Células coloridas */}
          {sortedData.map((entry, index) => (
            <Cell
               key={`cell-${index}-${entry.name}`}
               fill={COLORS[index % COLORS.length]} // Usa a nova paleta de cores
               stroke={"hsl(var(--card))"} // Borda sutil da cor do card
               strokeWidth={1}
            />
          ))}
        </Pie>

        <Tooltip
          cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} // Efeito de hover na fatia
          contentStyle={{
            backgroundColor: "hsl(var(--card) / 0.95)", // Fundo do card (pouca transparência)
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // Sombra
            padding: "8px 12px",
            fontSize: "12px",
          }}
          // Estilos para o texto do tooltip (garantir cor clara)
          labelStyle={{ color: "hsl(var(--muted-foreground))" }} // Label (nome do protocolo)
          itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }} // Valor (porcentagem)
          formatter={(value: number, name: string) => {
              // Calcula a porcentagem baseada nos dados ordenados
              const total = sortedData.reduce((acc, curr) => acc + curr.value, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              // Retorna [Valor formatado (Porcentagem), Nome do Protocolo]
              return [`${value.toLocaleString()} (${percentage}%)`, name];
          }}
        />

        <Legend
           iconType="circle" // Formato do ícone da legenda
           iconSize={8}       // Tamanho do ícone
           wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} // Espaçamento e fonte da legenda
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

