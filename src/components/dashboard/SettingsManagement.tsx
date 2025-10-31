// src/componentes/dashboard/SettingsManagement.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast as sonnerToast } from "sonner";
import { Settings, FolderOpen, Save, Loader2, AlertCircle } from "lucide-react";
// --- INÍCIO DA ALTERAÇÃO ---
// 1. Importar os tipos corretos da API atualizada
import { getSettings, updateSettings, SettingUpdate } from "@/api/settings"; 
// --- FIM DA ALTERAÇÃO ---
import { AccessDeniedMessage } from "../AccessDeniedMessage";
import { AxiosError } from "axios"; 

export const SettingsManagement = () => {
  const queryClient = useQueryClient();
  // --- INÍCIO DA ALTERAÇÃO ---
  // 2. Renomear estado para refletir o novo campo
  const [folderPath, setFolderPath] = useState("");
  // --- FIM DA ALTERAÇÃO ---

  // Fetch settings
  const { data: settings, isLoading: isLoadingSettings, error: errorSettings, isError, isFetching } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    onSuccess: (data) => {
      // --- INÍCIO DA ALTERAÇÃO ---
      // 3. Atualizar o estado local com 'ingest_folder'
      setFolderPath(data?.ingest_folder || "");
      // --- FIM DA ALTERAÇÃO ---
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
        // --- INÍCIO DA ALTERAÇÃO ---
        // 4. Sincronizar input local com 'ingest_folder'
        setFolderPath(updatedSettings.ingest_folder || ""); 
        sonnerToast.success(updatedSettings.ingest_folder ? "Configurações salvas" : "Ingestão desativada", {
           description: updatedSettings.ingest_folder
             ? `Monitoramento ativado em: ${updatedSettings.ingest_folder}`
             : "A ingestão automática foi desativada.",
        });
        // --- FIM DA ALTERAÇÃO ---
      },
      onError: (error: any) => {
       sonnerToast.error("Falha ao salvar", {
         description: error.response?.data?.detail || error.message || "Não foi possível salvar as configurações.",
       });
      },
   });

  // Handler para salvar
  const handleSave = () => {
    // --- INÍCIO DA ALTERAÇÃO ---
    // 5. Enviar o 'ingest_folder'
    const updateData: SettingUpdate = {
       ingest_folder: folderPath.trim() ? folderPath.trim() : null,
    };
    updateSettingsMutation.mutate(updateData);
    // --- FIM DA ALTERAÇÃO ---
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

  // --- RENDERIZAÇÃO NORMAL ---
  return (
    <Card className="relative">
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
              Configure uma pasta no servidor para ingestão automática de arquivos PCAP
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          
          {/* --- INÍCIO DA ALTERAÇÃO --- */}
          {/* 6. Alterar o Input */}
          <div className="space-y-2">
            <Label htmlFor="folder-path">Caminho Absoluto da Pasta</Label>
            <Input
              id="folder-path"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="Ex: /mnt/capturas/ ou C:\PCAPs (vazio para desativar)"
              disabled={updateSettingsMutation.isPending || isFetching}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              O servidor irá monitorar este caminho. O caminho deve ser absoluto, existir no servidor e o processo deve ter permissão de leitura.
            </p>
          </div>
          {/* --- FIM DA ALTERAÇÃO --- */}

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
           {!settings?.ingest_folder && !isLoadingSettings && ( 
             <div className="p-3 rounded-md border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-300 text-sm">
               A ingestão automática está desativada. Preencha o caminho absoluto da pasta para ativá-la.
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
