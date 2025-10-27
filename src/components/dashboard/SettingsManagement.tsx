// src/componentes/dashboard/SettingsManagement.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast as sonnerToast } from "sonner"; // Usando sonner
import { Settings, FolderOpen, Save, Loader2, AlertCircle } from "lucide-react";
import { getSettings, updateSettings, SettingsResponse, SettingUpdate } from "@/api/settings"; // Integração
import { AccessDeniedMessage } from "@/components/AccessDeniedMessage"; // Importar
import { AxiosError } from "axios"; // Importar

export const SettingsManagement = () => {
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState("");

  // Integração: Fetch settings com React Query
  const { data: settings, isLoading: isLoadingSettings, error: errorSettings, isError, isFetching } = useQuery({ // Adicionado isError, isFetching
    queryKey: ['settings'],
    queryFn: getSettings,
    onSuccess: (data) => {
       // Atualiza o estado local do input quando os dados são carregados
       setProjectName(data?.ingest_project_name || "");
    },
    retry: (failureCount, error) => { // Não retenta em erro 403
        if (error instanceof AxiosError && error.response?.status === 403) {
            console.log("Access Denied (403) for settings, not retrying.");
            return false;
        }
        return failureCount < 3;
    }
  });

   // Integração: Mutação para update
   const updateSettingsMutation = useMutation({
       mutationFn: updateSettings,
       onSuccess: (updatedSettings) => {
          queryClient.setQueryData(['settings'], updatedSettings); // Atualiza o cache manualmente
          setProjectName(updatedSettings.ingest_project_name || ""); // Sincroniza input local
          sonnerToast.success(updatedSettings.ingest_project_name ? "Configurações salvas" : "Ingestão desativada", {
             description: updatedSettings.ingest_project_name
               ? `O projeto "${updatedSettings.ingest_project_name}" foi configurado.`
               : "A ingestão automática foi desativada.",
          });
       },
       onError: (error: any) => {
         sonnerToast.error("Falha ao salvar", {
           description: error.response?.data?.detail || error.message || "Não foi possível salvar as configurações.",
         });
       },
   });

  // Handler para salvar
  const handleSave = () => {
    const updateData: SettingUpdate = {
       // Envia null se o campo estiver vazio para desativar
      ingest_project_name: projectName.trim() ? projectName.trim() : null,
    };
    updateSettingsMutation.mutate(updateData);
  };

  // --- TRATAMENTO DE ESTADOS ---

  // Loading Inicial
  if (isLoadingSettings && !isError) {
     return <Card><CardContent className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Carregando configurações...</span></CardContent></Card>;
  }

  // Erro 403 (Acesso Negado)
  if (isError && errorSettings instanceof AxiosError && errorSettings.response?.status === 403) {
     return <AccessDeniedMessage resourceName="as configurações" />;
  }

  // Outro Erro
  if (isError && !(errorSettings instanceof AxiosError && errorSettings.response?.status === 403)) {
      console.error("Erro ao carregar configurações:", errorSettings);
      return <Card><CardContent className="flex justify-center items-center h-40 text-destructive"><AlertCircle className="h-6 w-6 mr-2" /><span>Erro ao carregar configurações.</span></CardContent></Card>;
  }

  // --- RENDERIZAÇÃO NORMAL ---
  return (
    <Card className="relative">
      {/* Indicador de Fetching */}
       {isFetching && !isLoadingSettings && (
          <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
       )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Configurações de Ingestão (Watchdog)</CardTitle>
            <CardDescription>
              Configure a pasta monitorada para ingestão automática de arquivos PCAP
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do Projeto de Ingestão</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Deixe vazio para desativar ingestão automática"
              disabled={updateSettingsMutation.isPending || isFetching}
            />
            <p className="text-xs text-muted-foreground">
              Um nome aqui ativará o monitoramento. O nome será usado para criar a subpasta dentro de {'<uploads>/ingest/'}.
            </p>
          </div>

          {/* Exibe informações atuais (se disponíveis) */}
          {settings?.ingest_folder && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                Pasta Monitorada Atualmente
              </Label>
              <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
                <code className="text-xs">{settings.ingest_folder}</code>
              </div>
            </div>
          )}

          {settings?.ingest_user_name && (
            <div className="space-y-2">
              <Label>Arquivos Serão Associados ao Usuário</Label>
              <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium">{settings.ingest_user_name}</span>
                 {settings.ingest_user_id &&
                   <span className="text-xs text-muted-foreground ml-2">(ID: {settings.ingest_user_id.substring(0,8)}...)</span>
                 }
              </div>
              <p className="text-xs text-muted-foreground">
                 O usuário associado é sempre o administrador que salvou esta configuração.
              </p>
            </div>
          )}
           {!settings?.ingest_project_name && !isLoadingSettings && ( // Mostra só depois de carregar
              <div className="p-3 rounded-md border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-300 text-sm">
                A ingestão automática está desativada. Preencha o nome do projeto para ativá-la.
              </div>
           )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending || isFetching} className="gap-2">
             {updateSettingsMutation.isPending ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
             ) : (
                 <Save className="h-4 w-4" />
             )}
            {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};