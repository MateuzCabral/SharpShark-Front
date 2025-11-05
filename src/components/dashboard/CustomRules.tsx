import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner";
import { Plus, Trash2, Shield, Loader2, AlertCircle, Pencil } from "lucide-react";
import {
  getRules,
  createRule,
  deleteRule,
  updateRule,
  CustomRuleRead,
  CustomRuleCreate,
  CustomRuleUpdate,
  SeverityType,
  RuleType
} from "@/api/rules";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { AccessDeniedMessage } from "@/components/AccessDeniedMessage";
import { AxiosError } from "axios";

export const CustomRules = () => {
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CustomRuleRead | null>(null);

  const [formData, setFormData] = useState<Partial<CustomRuleCreate>>({
    name: "",
    rule_type: "payload",
    value: "",
    alert_type: "",
    severity: "medium",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error, isFetching, isError } = useQuery({
    queryKey: ['rules', currentPage, itemsPerPage],
    queryFn: () => getRules(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 403) {
        console.log("Access Denied (403) for rules, not retrying.");
        return false;
      }
      return failureCount < 3;
    }
  });

  const rules = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (error: any) => {
      if (error instanceof AxiosError && error.response?.status === 422 && error.response?.data?.detail) {
        try {
          const validationErrors = error.response.data.detail;
          let errorMsg = "Erro de validação:";
          validationErrors.forEach((err: any) => {
            const fieldName = err.loc && err.loc.length > 1 ? err.loc[1] : 'Campo';
            const friendlyFieldName = {
              name: "Nome da Regra",
              rule_type: "Tipo de Regra",
              value: "Valor",
              alert_type: "Tipo de Alerta",
              severity: "Severidade"
            }[fieldName] || fieldName;
            errorMsg += `\n- ${friendlyFieldName}: ${err.msg}`;
          });
          sonnerToast.error("Dados Inválidos", { description: <pre className="whitespace-pre-wrap">{errorMsg}</pre> });
        } catch (_) {
          sonnerToast.error("Dados Inválidos", { description: JSON.stringify(error.response.data.detail) });
        }
      } else {
        sonnerToast.error("Operação falhou", {
          description: error.response?.data?.detail || error.message || "Ocorreu um erro.",
        });
      }
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

  const updateRuleMutation = useMutation({
    mutationFn: ({ ruleId, ruleData }: { ruleId: string; ruleData: CustomRuleUpdate }) => updateRule(ruleId, ruleData),
    ...mutationOptions,
    onSuccess: (updatedRule) => {
      mutationOptions.onSuccess();
      sonnerToast.success("Regra atualizada", {
        description: `A regra "${updatedRule.name}" foi salva.`,
      });
      setIsEditOpen(false);
      setSelectedRule(null);
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deleteRule,
    ...mutationOptions,
    onSuccess: (_, ruleId) => {
      mutationOptions.onSuccess();
      sonnerToast.error("Regra removida", {
        description: `A regra (ID: ${ruleId.substring(0, 8)}...) foi removida.`,
      });
      if (rules.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  });

  const handleCreate = () => {
    if (!formData.name || !formData.value || !formData.alert_type) {
      sonnerToast.warning("Campos obrigatórios", { description: "Nome, Valor e Tipo de Alerta são necessários." });
      return;
    }
    createRuleMutation.mutate(formData as CustomRuleCreate);
  };

  const handleOpenEditDialog = (rule: CustomRuleRead) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      rule_type: rule.rule_type,
      value: rule.value,
      alert_type: rule.alert_type,
      severity: rule.severity,
    });
    setIsEditOpen(true);
  };

  const handleEdit = () => {
    if (!selectedRule) return;

    const updateData: CustomRuleUpdate = {};
    if (formData.name !== selectedRule.name) updateData.name = formData.name;
    if (formData.rule_type !== selectedRule.rule_type) updateData.rule_type = formData.rule_type;
    if (formData.value !== selectedRule.value) updateData.value = formData.value;
    if (formData.alert_type !== selectedRule.alert_type) updateData.alert_type = formData.alert_type;
    if (formData.severity !== selectedRule.severity) updateData.severity = formData.severity;

    if (Object.keys(updateData).length === 0) {
      sonnerToast.info("Nenhuma alteração", { description: "Nenhum dado foi modificado." });
      setIsEditOpen(false);
      return;
    }

    if (!formData.name || !formData.value || !formData.alert_type) {
      sonnerToast.warning("Campos obrigatórios", { description: "Nome, Valor e Tipo de Alerta são necessários." });
      return;
    }

    updateRuleMutation.mutate({ ruleId: selectedRule.id, ruleData: updateData });
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

  if (isLoading && !isError) {
    return <Card><CardContent className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Carregando regras...</span></CardContent></Card>;
  }
  if (isError && error instanceof AxiosError && error.response?.status === 403) {
    return <AccessDeniedMessage resourceName="as regras customizadas" />;
  }
  if (isError && !(error instanceof AxiosError && error.response?.status === 403)) {
    console.error("Erro ao carregar regras:", error);
    return <Card><CardContent className="flex justify-center items-center h-60 text-destructive"><AlertCircle className="h-8 w-8 mr-2" /><span>Falha ao carregar regras.</span></CardContent></Card>;
  }

  return (
    <Card className="relative">
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Regras Customizadas</CardTitle>
              <CardDescription>
                Crie e edite regras globais de detecção baseadas em payload ou porta
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
                <DialogDescription>Defina uma nova regra de detecção</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Nome da Regra *</Label>
                  <Input id="rule-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Detecta Shell PHP" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-type">Tipo de Regra</Label>
                  <select id="rule-type" className="input-like-select" value={formData.rule_type} onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as RuleType, value: '' })}>
                    <option value="payload">Payload (String)</option>
                    <option value="port">Porta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-value">{formData.rule_type === "payload" ? "String a Procurar *" : "Número da Porta *"}</Label>
                  <Input id="rule-value" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder={formData.rule_type === "payload" ? "Ex: <?php (mín 3 chars)" : "Ex: 4444 (1-65535)"} required />
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
        <div className="rounded-md border relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Valor</TableHead>
                <TableHead className="hidden md:table-cell">Alerta Gerado</TableHead>
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
                    <TableCell className="font-mono text-xs max-w-[150px] truncate hidden md:table-cell" title={rule.value}>{rule.value}</TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">{rule.alert_type}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(rule.severity)}>
                        {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(rule)}
                        disabled={deleteRuleMutation.isPending || updateRuleMutation.isPending}
                        title={`Editar regra ${rule.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteRuleMutation.isPending || updateRuleMutation.isPending}
                            title={`Remover regra ${rule.name}`}
                          >
                            {deleteRuleMutation.isPending && deleteRuleMutation.variables === rule.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4 text-destructive" />
                            }
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover a regra "{rule.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => deleteRuleMutation.mutate(rule.id)}
                            >
                              {deleteRuleMutation.isPending && deleteRuleMutation.variables === rule.id ? "Removendo..." : "Remover"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                </PaginationItem>
                {(() => {
                  const pageNumbers = []; const maxPagesToShow = 5; const halfMax = Math.floor(maxPagesToShow / 2);
                  if (totalPages <= maxPagesToShow + 2) { for (let i = 1; i <= totalPages; i++) pageNumbers.push(i); } else {
                    pageNumbers.push(1); let startPage = Math.max(2, currentPage - halfMax); let endPage = Math.min(totalPages - 1, currentPage + halfMax);
                    if (currentPage <= halfMax + 1) endPage = maxPagesToShow + 1; if (currentPage >= totalPages - halfMax) startPage = totalPages - maxPagesToShow;
                    if (startPage > 2) pageNumbers.push(-1); for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
                    if (endPage < totalPages - 1) pageNumbers.push(-1); pageNumbers.push(totalPages);
                  }
                  return pageNumbers.map((pageNum, index) => (pageNum === -1 ? (<PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>) : (<PaginationItem key={pageNum}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }} isActive={currentPage === pageNum} aria-current={currentPage === pageNum ? "page" : undefined}>{pageNum}</PaginationLink></PaginationItem>)));
                })()}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            {totalItems > 0 && (<p className="text-xs text-muted-foreground"> Página {currentPage} de {totalPages} ({totalItems} {totalItems === 1 ? 'regra' : 'regras'} no total) </p>)}
          </div>
        )}
      </CardContent>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Regra</DialogTitle>
            <DialogDescription>Atualize os detalhes da regra "{selectedRule?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rule-name">Nome da Regra *</Label>
              <Input id="edit-rule-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Detecta Shell PHP" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rule-type">Tipo de Regra</Label>
              <select id="edit-rule-type" className="input-like-select" value={formData.rule_type} onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as RuleType, value: '' })}>
                <option value="payload">Payload (String)</option>
                <option value="port">Porta</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rule-value">{formData.rule_type === "payload" ? "String a Procurar *" : "Número da Porta *"}</Label>
              <Input id="edit-rule-value" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder={formData.rule_type === "payload" ? "Ex: <?php (mín 3 chars)" : "Ex: 4444 (1-65535)"} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-alert-type">Tipo de Alerta Gerado *</Label>
              <Input id="edit-alert-type" value={formData.alert_type} onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })} placeholder="Ex: custom_php_shell" required />
              <p className="text-xs text-muted-foreground">Nome curto e único para identificar o alerta</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-severity">Severidade</Label>
              <select id="edit-severity" className="input-like-select" value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value as SeverityType })}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={updateRuleMutation.isPending}>
              {updateRuleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .input-like-select { display: flex; height: 2.5rem; width: 100%; border-radius: 0.375rem; border: 1px solid hsl(var(--input)); background-color: hsl(var(--background)); padding-left: 0.75rem; padding-right: 2.5rem; padding-top: 0.5rem; padding-bottom: 0.5rem; font-size: 0.875rem; line-height: 1.25rem; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; }
        .input-like-select:focus { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; border-color: hsl(var(--ring)); }
      `}</style>
    </Card>
  );
};