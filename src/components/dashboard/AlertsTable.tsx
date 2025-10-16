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
import { Eye } from "lucide-react";

interface AlertsTableProps {
  limit?: number;
}

const mockAlerts = [
  {
    id: 1,
    type: "Port Scan",
    severity: "high",
    sourceIp: "192.168.1.45",
    targetPort: "Multiple",
    timestamp: "2025-10-15 14:23:15",
    status: "active",
  },
  {
    id: 2,
    type: "Brute Force",
    severity: "critical",
    sourceIp: "203.0.113.89",
    targetPort: "22",
    timestamp: "2025-10-15 14:18:42",
    status: "active",
  },
  {
    id: 3,
    type: "SQL Injection",
    severity: "high",
    sourceIp: "198.51.100.34",
    targetPort: "80",
    timestamp: "2025-10-15 13:55:21",
    status: "investigating",
  },
  {
    id: 4,
    type: "DDoS Attempt",
    severity: "critical",
    sourceIp: "Multiple",
    targetPort: "443",
    timestamp: "2025-10-15 13:12:08",
    status: "mitigated",
  },
  {
    id: 5,
    type: "Anomalous Traffic",
    severity: "medium",
    sourceIp: "172.16.0.102",
    targetPort: "8080",
    timestamp: "2025-10-15 12:45:33",
    status: "active",
  },
  {
    id: 6,
    type: "XSS Attempt",
    severity: "medium",
    sourceIp: "10.0.0.56",
    targetPort: "443",
    timestamp: "2025-10-15 11:30:19",
    status: "resolved",
  },
];

const severityColors = {
  critical: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

const statusColors = {
  active: "destructive",
  investigating: "default",
  mitigated: "secondary",
  resolved: "outline",
} as const;

export const AlertsTable = ({ limit }: AlertsTableProps) => {
  const alerts = limit ? mockAlerts.slice(0, limit) : mockAlerts;

  return (
    <div className="rounded-md border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead>Tipo de Ataque</TableHead>
            <TableHead>Severidade</TableHead>
            <TableHead>IP de Origem</TableHead>
            <TableHead>Porta</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow key={alert.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">{alert.type}</TableCell>
              <TableCell>
                <Badge variant={severityColors[alert.severity as keyof typeof severityColors]}>
                  {alert.severity}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">{alert.sourceIp}</TableCell>
              <TableCell>{alert.targetPort}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {alert.timestamp}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[alert.status as keyof typeof statusColors]}>
                  {alert.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
