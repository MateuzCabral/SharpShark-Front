import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Shield } from "lucide-react";

interface CustomRule {
  id: string;
  user_id: string;
  name: string;
  rule_type: "payload" | "port";
  value: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
}

const mockRules: CustomRule[] = [
  {
    id: "1",
    user_id: "admin-uuid",
    name: "Detecta Shell PHP",
    rule_type: "payload",
    value: "<?php",
    alert_type: "custom_php_shell",
    severity: "critical",
  },
  {
    id: "2",
    user_id: "admin-uuid",
    name: "Porta Suspeita 4444",
    rule_type: "port",
    value: "4444",
    alert_type: "custom_suspicious_port",
    severity: "high",
  },
];

export const CustomRules = () => {
  const [rules, setRules] = useState<CustomRule[]>(mockRules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rule_type: "payload" as "payload" | "port",
    value: "",
    alert_type: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
  });
  const { toast } = useToast();

  const handleCreate = () => {
    // TODO: Integrar com POST /rules/
    // Body: CustomRuleCreate { name, rule_type, value, alert_type, severity }
    // Response: CustomRuleRead (201 Created)
    
    const newRule: CustomRule = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: "current-admin-uuid",
      ...formData,
    };
    
    setRules([...rules, newRule]);
    setIsCreateOpen(false);
    setFormData({
      name: "",
      rule_type: "payload",
      value: "",
      alert_type: "",
      severity: "medium",
    });
    
    toast({
      title: "Regra criada",
      description: `A regra "${newRule.name}" foi adicionada com sucesso.`,
    });
  };

  const handleDelete = (rule: CustomRule) => {
    // TODO: Integrar com DELETE /rules/{rule_id}
    // Response: 204 No Content
    
    setRules(rules.filter((r) => r.id !== rule.id));
    toast({
      title: "Regra removida",
      description: `${rule.name} foi removida do sistema.`,
      variant: "destructive",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Regras Customizadas</CardTitle>
              <CardDescription>
                Crie regras globais de detecção baseadas em payload ou porta
              </CardDescription>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Regra</DialogTitle>
                <DialogDescription>
                  Defina uma nova regra de detecção personalizada
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Nome da Regra</Label>
                  <Input
                    id="rule-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Detecta Shell PHP"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rule-type">Tipo de Regra</Label>
                  <select
                    id="rule-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.rule_type}
                    onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as "payload" | "port" })}
                  >
                    <option value="payload">Payload (String no conteúdo)</option>
                    <option value="port">Porta</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-value">
                    {formData.rule_type === "payload" ? "String a Procurar" : "Número da Porta"}
                  </Label>
                  <Input
                    id="rule-value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.rule_type === "payload" ? "<?php" : "4444"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alert-type">Tipo de Alerta</Label>
                  <Input
                    id="alert-type"
                    value={formData.alert_type}
                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                    placeholder="custom_php_shell"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome curto e único para identificar o alerta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severidade</Label>
                  <select
                    id="severity"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>Criar Regra</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Alerta</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma regra customizada criada
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {rule.rule_type === "payload" ? "Payload" : "Porta"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{rule.value}</TableCell>
                    <TableCell className="font-mono text-xs">{rule.alert_type}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(rule.severity)}>
                        {rule.severity === "critical" && "Crítica"}
                        {rule.severity === "high" && "Alta"}
                        {rule.severity === "medium" && "Média"}
                        {rule.severity === "low" && "Baixa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
