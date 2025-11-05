import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle } from "lucide-react";

interface TrafficDataPoint {
  time: string;
  packets: number;
}

interface TrafficChartProps {
  data: TrafficDataPoint[];
}

export const TrafficChart = ({ data }: TrafficChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/30 rounded-md">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Não há dados de tráfego disponíveis nas últimas 24h.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -15, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />

        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
           ticks={data.filter((_, index) => index % 4 === 0).map(d => d.time)}
        />

        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value.toString();
          }}
          width={40}
        />

        <Tooltip
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: "hsl(var(--card) / 0.9)",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            padding: "8px 12px",
          }}
          labelStyle={{ marginBottom: '4px', color: "hsl(var(--muted-foreground))", fontSize: '12px' }}
          itemStyle={{ color: "hsl(var(--primary))", fontWeight: '500' }}
          formatter={(value: number, name: string, props: any) => [`${value.toLocaleString()}`, `Pacotes às ${props.payload.time}`]}
          labelFormatter={() => ''}
        />

        <Line
          type="monotone"
          dataKey="packets"
          name="Pacotes"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 2, strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 1, stroke: 'hsl(var(--background))', fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};