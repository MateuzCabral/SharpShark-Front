import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  variant?: "default" | "danger";
}

export const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) => {
  const isPositive = trend === "up";
  const isDanger = variant === "danger";

  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${isDanger ? "text-destructive" : ""}`}>
              {value}
            </p>
            {change && (
              <div className="flex items-center gap-1 text-xs">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={isPositive ? "text-green-500" : "text-red-500"}>
                  {change}
                </span>
                <span className="text-muted-foreground">vs. anterior</span>
              </div>
            )}
          </div>
          <div
            className={`p-3 rounded-lg ${
              isDanger
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
