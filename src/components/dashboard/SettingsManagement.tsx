import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, FolderOpen, Save } from "lucide-react";

interface SettingsData {
  ingest_project_name: string | null;
  ingest_folder: string | null;
  ingest_user_id: string | null;
  ingest_user_name: string | null;
}

export const SettingsManagement = () => {
  const [settings, setSettings] = useState<SettingsData>({
    ingest_project_name: null,
    ingest_folder: null,
    ingest_user_id: null,
    ingest_user_name: null,
  });
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // TODO: Integrar com GET /settings/
    // Response: SettingsResponse
    
    // Mock data
    setSettings({
      ingest_project_name: "Projeto Exemplo",
      ingest_folder: "/uploads/ingest/projeto_exemplo",
      ingest_user_id: "uuid-admin",
      ingest_user_name: "admin_user",
    });
    setProjectName("Projeto Exemplo");
  };

  const handleSave = async () => {
    setIsLoading(true);

    // TODO: Integrar com PUT /settings/
    // Body: { "ingest_project_name": projectName || null }
    // Response: SettingsResponse (200 OK)
    
    setTimeout(() => {
      setSettings({
        ...settings,
        ingest_project_name: projectName || null,
        ingest_folder: projectName ? `/uploads/ingest/${projectName.toLowerCase().replace(/\s+/g, '_')}` : null,
      });
      
      toast({
        title: projectName ? "Configurações salvas" : "Ingestão desativada",
        description: projectName 
          ? `O projeto "${projectName}" foi configurado com sucesso.`
          : "A ingestão automática foi desativada.",
      });
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Configurações de Ingestão</CardTitle>
            <CardDescription>
              Configure a pasta monitorada para ingestão automática de arquivos PCAP
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do Projeto</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Digite o nome do projeto (vazio para desativar)"
            />
            <p className="text-xs text-muted-foreground">
              O nome será sanitizado e usado para criar o diretório de ingestão
            </p>
          </div>

          {settings.ingest_folder && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Pasta de Ingestão Atual
              </Label>
              <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
                <code className="text-xs">{settings.ingest_folder}</code>
              </div>
            </div>
          )}

          {settings.ingest_user_name && (
            <div className="space-y-2">
              <Label>Usuário Associado</Label>
              <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
                <span className="text-sm font-medium">{settings.ingest_user_name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (ID: {settings.ingest_user_id})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
