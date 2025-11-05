// Em: SharpShark-Front/src/components/dashboard/SettingsManagement.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast as sonnerToast } from "sonner";
import { FolderCog, FolderOpen, Save, Loader2, AlertCircle } from "lucide-react"; // Ícone atualizado
import { getSettings, updateSettings, SettingUpdate } from "@/api/settings";
import { AccessDeniedMessage } from "../AccessDeniedMessage";
import { AxiosError } from "axios";

export const SettingsManagement = () => {
  const queryClient = useQueryClient();
  // Renomeado para 'projectName' para clareza
  const [projectName, setProjectName] = useState("");

  // Fetch settings
  const { data: settings, isLoading: isLoadingSettings, error: errorSettings, isError, isFetching } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    onSuccess: (data) => {
      // Usa 'ingest_folder' (que agora armazena o nome do projeto)
      setProjectName(data?.ingest_folder || "");
    },
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 403) {
        console.log("Access Denied (403) for settings, not retrying.");
        return false;
      }
      return failureCount < 3;
    }
  });

  // Mutação para update
  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
      setProjectName(updatedSettings.ingest_folder || "");
      sonnerToast.success(updatedSettings.ingest_folder ? "Projeto de ingestão salvo" : "Ingestão desativada", {
        description: updatedSettings.ingest_folder
          ? `Monitoramento ativado em: ${updatedSettings.ingest_folder}`
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
      // Envia o 'projectName' como 'ingest_folder'
      ingest_folder: projectName.trim() ? projectName.trim() : null,
    };
    updateSettingsMutation.mutate(updateData);
  };

  // --- TRATAMENTO DE ESTADOS (Loading, Erro 403, Outro Erro) ---
  if (isLoadingSettings && !isError) {
    return <Card><CardContent className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Carregando configurações...</span></CardContent></Card>;
  }
  if (isError && errorSettings instanceof AxiosError && errorSettings.response?.status === 403) {
    return <AccessDeniedMessage resourceName="as configurações" />;
  }
  if (isError && !(errorSettings instanceof AxiosError && errorSettings.response?.status === 403)) {
    console.error("Erro ao carregar configurações:", errorSettings);
    return <Card><CardContent className="flex justify-center items-center h-40 text-destructive"><AlertCircle className="h-6 w-6 mr-2" /><span>Erro ao carregar configurações.</span></CardContent></Card>;
  }

  // --- RENDERIZAÇÃO NORMAL (COM TEXTOS ATUALIZADOS) ---
  return (
    <Card className="relative">
      {isFetching && !isLoadingSettings && (
        <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderCog className="h-5 w-5 text-primary" /> {/* Ícone atualizado */}
          <div>
            <CardTitle>Configuração do Hot-Folder (Ingestor)</CardTitle>
            <CardDescription>
              Configure qual pasta de projeto o sistema deve monitorar.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">

          {/* --- Textos Alterados Abaixo --- */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome da Pasta do Projeto</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: meu_projeto_1 (vazio para desativar)"
              disabled={updateSettingsMutation.isPending || isFetching}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Este deve ser o nome da subpasta que você criou dentro de <code className="text-xs">Captures</code> no seu servidor.
            </p>
          </div>
          {/* --- Fim das Alterações de Texto --- */}

          {/* Exibe informações atuais (se disponíveis) */}
          {settings?.ingest_folder && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                Projeto Monitorado Atualmente
              </Label>
              <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
                <code className="text-sm font-medium">{settings.ingest_folder}</code>
              </div>
              <p className="text-xs text-muted-foreground">
                Caminho completo no servidor: <code className="text-xs">/data/ingest/{settings.ingest_folder}</code>
              </p>
            </div>
          )}

          {settings?.ingest_user_name && (
            <div className="space-y-2">
              <Label>Arquivos Serão Associados ao Usuário</Label>
              <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium">{settings.ingest_user_name}</span>
                {settings.ingest_user_id &&
                  <span className="text-xs text-muted-foreground ml-2">(ID: {settings.ingest_user_id.substring(0, 8)}...)</span>
                }
              </div>
            </div>
          )}
          {!settings?.ingest_folder && !isLoadingSettings && (
            <div className="p-3 rounded-md border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-300 text-sm">
              A ingestão automática está desativada. Digite um nome de projeto para ativá-la.
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