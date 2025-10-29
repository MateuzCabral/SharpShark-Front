// src/componentes/dashboard/TrafficChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle } from "lucide-react"; // Para mensagem de "sem dados"

// Interface para os pontos de dados esperados
interface TrafficDataPoint {
  time: string; // Formato "HH:00"
  packets: number;
}

// Propriedade esperada pelo componente
interface TrafficChartProps {
  data: TrafficDataPoint[];
}

export const TrafficChart = ({ data }: TrafficChartProps) => {
  // Verifica se há dados para exibir
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/30 rounded-md">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Não há dados de tráfego disponíveis nas últimas 24h.</p>
      </div>
    );
  }

  return (
    // Usa ResponsiveContainer para ajustar ao tamanho do Card
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -15, bottom: 5 }} // Ajuste margens para melhor visualização dos eixos
      >
        {/* Grid de fundo */}
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />

        {/* Eixo X (Tempo) */}
        <XAxis
          dataKey="time" // Usa a chave 'time' dos dados
          stroke="hsl(var(--muted-foreground))"
          fontSize={10} // Fonte menor para caber mais labels
          tickLine={false} // Remove pequenas linhas do eixo X
          axisLine={false} // Remove linha principal do eixo X
          interval="preserveStartEnd" // Garante que o primeiro e último label apareçam
          // Tenta mostrar menos labels se houver muitos pontos (ex: a cada 4 horas)
          // tickCount={7} // Alternativa: definir número fixo de ticks
          // Ou filtrar os ticks:
           ticks={data.filter((_, index) => index % 4 === 0).map(d => d.time)} // Mostra a cada 4h
        />

        {/* Eixo Y (Pacotes) */}
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          // Formata números grandes (ex: 1000 -> 1k, 1500000 -> 1.5M)
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value.toString();
          }}
          width={40} // Aumenta espaço para labels formatados (ex: 1.5M)
        />

        {/* Tooltip customizado */}
        <Tooltip
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} // Linha vertical tracejada ao passar o mouse
          contentStyle={{
            backgroundColor: "hsl(var(--card) / 0.9)", // Fundo do card com transparência
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)", // Usa variável CSS do tema
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // Sombra padrão tailwind
            padding: "8px 12px", // Ajusta padding interno
          }}
          labelStyle={{ marginBottom: '4px', color: "hsl(var(--muted-foreground))", fontSize: '12px' }} // Estilo do label (hora)
          itemStyle={{ color: "hsl(var(--primary))", fontWeight: '500' }}   // Estilo do valor (packets)
          // Formata o conteúdo do tooltip
          formatter={(value: number, name: string, props: any) => [`${value.toLocaleString()}`, `Pacotes às ${props.payload.time}`]}
          // Não precisa mostrar o label (hora) de novo, já está no formatter
          labelFormatter={() => ''}
        />

        {/* Linha do gráfico */}
        <Line
          type="monotone" // Curva suave
          dataKey="packets" // Usa a chave 'packets'
          name="Pacotes" // Nome que aparece no tooltip (antes do formatter)
          stroke="hsl(var(--primary))" // Cor da linha
          strokeWidth={2} // Espessura da linha
          dot={{ fill: "hsl(var(--primary))", r: 2, strokeWidth: 0 }} // Pontos nos dados (pequenos)
          activeDot={{ r: 5, strokeWidth: 1, stroke: 'hsl(var(--background))', fill: 'hsl(var(--primary))' }} // Ponto ativo maior com borda
        />
      </LineChart>
    </ResponsiveContainer>
  );
};