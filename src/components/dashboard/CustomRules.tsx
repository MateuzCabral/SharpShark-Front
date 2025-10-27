// src/componentes/dashboard/CustomRules.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner"; // Usando sonner
import { Plus, Trash2, Shield, Loader2, AlertCircle } from "lucide-react";
import { getRules, createRule, deleteRule, CustomRuleRead, CustomRuleCreate, SeverityType, RuleType } from "@/api/rules"; // Integração
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"; // Integração

export const CustomRules = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CustomRuleCreate>({
    name: "",
    rule_type: "payload",
    value: "",
    alert_type: "",
    severity: "medium",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Integração: Fetch rules com React Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['rules', currentPage, itemsPerPage],
    queryFn: () => getRules(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
  });

  const rules = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

   // Integração: Mutações
   const mutationOptions = {
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['rules'] });
      },
      onError: (error: any) => {
         sonnerToast.error("Operação falhou", {
           description: error.response?.data?.detail || error.message || "Ocorreu um erro.",
         });
      },
   };

  const createRuleMutation = useMutation({
    mutationFn: createRule,
    ...mutationOptions,
    onSuccess: (newRule) => {
        mutationOptions.onSuccess();
        sonnerToast.success("Regra criada", {
          description: `A regra "${newRule.name}" foi adicionada.`,
        });
        setIsCreateOpen(false);
        setFormData({ name: "", rule_type: "payload", value: "", alert_type: "", severity: "medium" });
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deleteRule,
    ...mutationOptions,
     onSuccess: (_, ruleId) => { // Segundo arg é o ID
        mutationOptions.onSuccess();
        sonnerToast.error("Regra removida", { // Usando variant error
           description: `A regra (ID: ${ruleId}) foi removida.`,
        });
     }
  });

  // Handlers
  const handleCreate = () => {
     // Validações básicas (o backend fará validações mais robustas)
     if (!formData.name || !formData.value || !formData.alert_type) {
       sonnerToast.warning("Campos obrigatórios", { description: "Nome, Valor e Tipo de Alerta são necessários." });
       return;
     }
     if (formData.rule_type === 'port' && !/^\d+$/.test(formData.value)) {
        sonnerToast.warning("Valor inválido", { description: "Para tipo 'Porta', o valor deve ser um número." });
        return;
     }
     if (formData.rule_type === 'payload' && formData.value.length < 3) {
        sonnerToast.warning("Valor curto", { description: "Para tipo 'Payload', o valor deve ter pelo menos 3 caracteres." });
        return;
     }

    createRuleMutation.mutate(formData);
  };

  const handleDelete = (rule: CustomRuleRead) => {
     if (window.confirm(`Tem certeza que deseja remover a regra "${rule.name}"?`)) {
       deleteRuleMutation.mutate(rule.id);
     }
  };

   const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getSeverityColor = (severity: SeverityType): "destructive" | "default" | "secondary" | "outline" => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  // Loading e Erro
   if (isLoading && !data) {
    return <Card><CardContent className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Carregando regras...</span></CardContent></Card>;
  }
   if (error) {
     return <Card><CardContent className="flex justify-center items-center h-60 text-destructive"><AlertCircle className="h-8 w-8 mr-2" /><span>Falha ao carregar regras.</span></CardContent></Card>;
  }

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
              {/* ... Conteúdo Dialog Criação (já estava bom, só ajustar o submit) ... */}
              <DialogHeader>
                 <DialogTitle>Criar Nova Regra</DialogTitle>
                 <DialogDescription>Defina uma nova regra de detecção</DialogDescription>
              </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-2">
                   <Label htmlFor="rule-name">Nome da Regra *</Label>
                   <Input id="rule-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Detecta Shell PHP" required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="rule-type">Tipo de Regra</Label>
                   <select id="rule-type" className="input-like-select" value={formData.rule_type} onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as RuleType, value: '' })}> {/* Limpa valor ao trocar tipo */}
                     <option value="payload">Payload (String)</option>
                     <option value="port">Porta</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="rule-value">{formData.rule_type === "payload" ? "String a Procurar *" : "Número da Porta *"}</Label>
                   <Input id="rule-value" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder={formData.rule_type === "payload" ? "Ex: <?php" : "Ex: 4444"} required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="alert-type">Tipo de Alerta Gerado *</Label>
                   <Input id="alert-type" value={formData.alert_type} onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })} placeholder="Ex: custom_php_shell" required />
                   <p className="text-xs text-muted-foreground">Nome curto e único para identificar o alerta</p>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="severity">Severidade</Label>
                   <select id="severity" className="input-like-select" value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value as SeverityType })}>
                     <option value="low">Baixa</option>
                     <option value="medium">Média</option>
                     <option value="high">Alta</option>
                     <option value="critical">Crítica</option>
                   </select>
                 </div>
               </div>
              <DialogFooter>
                 <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                 <Button onClick={handleCreate} disabled={createRuleMutation.isPending}>
                    {createRuleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Regra
                 </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border relative">
           {isFetching && ( // Indicador de refresh
              <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
           )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Alerta Gerado</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
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
                    <TableCell className="font-mono text-xs max-w-[150px] truncate" title={rule.value}>{rule.value}</TableCell>
                    <TableCell className="font-mono text-xs">{rule.alert_type}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(rule.severity)}>
                        {/* Capitaliza a primeira letra */}
                        {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule)}
                        disabled={deleteRuleMutation.isPending && deleteRuleMutation.variables === rule.id}
                      >
                         {deleteRuleMutation.isPending && deleteRuleMutation.variables === rule.id
                            ? <Loader2 className="h-4 w-4 animate-spin"/>
                            : <Trash2 className="h-4 w-4 text-destructive" />
                         }
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

         {/* Paginação */}
        {totalPages > 1 && (
           <div className="mt-4">
              <Pagination>
                <PaginationContent>
                   {/* ... controles de paginação ... */}
                </PaginationContent>
              </Pagination>
              <p className="text-center text-sm text-muted-foreground mt-2">
                 Página {currentPage} de {totalPages} ({totalItems} regras)
              </p>
           </div>
        )}
      </CardContent>

       {/* Estilo para <select> parecer com <Input> */}
       <style jsx global>{`
         .input-like-select {
             display: flex; height: 2.5rem; width: 100%; border-radius: 0.375rem; border: 1px solid hsl(var(--input)); background-color: hsl(var(--background)); padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.5rem; padding-bottom: 0.5rem; font-size: 0.875rem; line-height: 1.25rem; outline: none;
         }
         .input-like-select:focus { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }
        `}</style>
    </Card>
  );
};