import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

const mockAnalyses = [
  {
    id: 1,
    filename: "capture_2025_10_15_14h23m.pcapng",
    packets: 45678,
    size: "23.4 MB",
    alerts: 8,
    status: "completed",
    timestamp: "2025-10-15 14:25:00",
  },
  {
    id: 2,
    filename: "network_traffic_morning.pcapng",
    packets: 89012,
    size: "45.1 MB",
    alerts: 3,
    status: "completed",
    timestamp: "2025-10-15 09:15:00",
  },
  {
    id: 3,
    filename: "security_scan_20251015.pcapng",
    packets: 12345,
    size: "8.9 MB",
    alerts: 15,
    status: "completed",
    timestamp: "2025-10-15 08:30:00",
  },
  {
    id: 4,
    filename: "live_capture_ongoing.pcapng",
    packets: 5678,
    size: "3.2 MB",
    alerts: 0,
    status: "processing",
    timestamp: "2025-10-15 14:30:00",
  },
  {
    id: 5,
    filename: "daily_traffic_analysis.pcapng",
    packets: 156789,
    size: "78.5 MB",
    alerts: 12,
    status: "completed",
    timestamp: "2025-10-14 23:45:00",
  },
];

const statusConfig = {
  completed: { variant: "default" as const, label: "Concluída" },
  processing: { variant: "secondary" as const, label: "Processando" },
  error: { variant: "destructive" as const, label: "Erro" },
};

export const AnalysesTable = () => {
  return (
    <div className="rounded-md border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead>Arquivo</TableHead>
            <TableHead>Pacotes</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Alertas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAnalyses.map((analysis) => (
            <TableRow key={analysis.id} className="hover:bg-muted/30">
              <TableCell className="font-medium max-w-[200px] truncate">
                {analysis.filename}
              </TableCell>
              <TableCell>{analysis.packets.toLocaleString()}</TableCell>
              <TableCell>{analysis.size}</TableCell>
              <TableCell>
                {analysis.alerts > 0 ? (
                  <Badge variant="destructive">{analysis.alerts}</Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[analysis.status as keyof typeof statusConfig].variant}>
                  {statusConfig[analysis.status as keyof typeof statusConfig].label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {analysis.timestamp}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
