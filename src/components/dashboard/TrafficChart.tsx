import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "00:00", packets: 4000 },
  { time: "04:00", packets: 3000 },
  { time: "08:00", packets: 5000 },
  { time: "12:00", packets: 7800 },
  { time: "16:00", packets: 8900 },
  { time: "20:00", packets: 6500 },
  { time: "23:59", packets: 5200 },
];

export const TrafficChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Line
          type="monotone"
          dataKey="packets"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
