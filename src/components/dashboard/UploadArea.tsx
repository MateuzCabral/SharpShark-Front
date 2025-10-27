import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FolderOpen,
  Play,
  Square,
  FileUp,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/api/files"; // integração real

export const UploadArea = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [monitoringPath, setMonitoringPath] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<
    Array<{ name: string; status: "success" | "error"; timestamp: string }>
  >([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".pcap") || file.name.endsWith(".pcapng")) {
        setSelectedFile(file);
        toast.success(`Arquivo selecionado: ${file.name}`);
      } else {
        toast.error("Por favor, selecione um arquivo .pcap ou .pcapng");
      }
    }
  };

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const path = files[0].webkitRelativePath.split("/")[0];
      setMonitoringPath(path);
      toast.success(`Pasta selecionada: ${path}`);
    }
  };

  const handleManualUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadFile(selectedFile);
      
      setUploadHistory((prev) => [
        {
          name: selectedFile.name,
          status: "success",
          timestamp: new Date().toLocaleString("pt-BR"),
        },
        ...prev,
      ]);

      toast.success(`Upload concluído: ${selectedFile.name}`);
      console.log("Resposta do servidor:", response);

    } catch (error: any) {
      console.error("Erro no upload:", error);
      setUploadHistory((prev) => [
        {
          name: selectedFile.name,
          status: "error",
          timestamp: new Date().toLocaleString("pt-BR"),
        },
        ...prev,
      ]);
      toast.error(error.response?.data?.detail || "Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleMonitoring = () => {
    if (!monitoringPath) {
      toast.error("Selecione uma pasta primeiro");
      return;
    }

    if (isMonitoring) {
      setIsMonitoring(false);
      toast.info("Monitoramento pausado");
    } else {
      setIsMonitoring(true);
      toast.success(`Monitorando pasta: ${monitoringPath}`);

      const interval = setInterval(() => {
        if (!isMonitoring) {
          clearInterval(interval);
          return;
        }

        const mockFile = `capture_auto_${Date.now()}.pcapng`;
        setUploadHistory((prev) => [
          {
            name: mockFile,
            status: "success",
            timestamp: new Date().toLocaleString("pt-BR"),
          },
          ...prev,
        ]);
      }, 15000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Manual */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Upload Manual
          </CardTitle>
          <CardDescription>
            Envie arquivos .pcap ou .pcapng para análise imediata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Selecionar Arquivo</Label>
            <div className="flex gap-2">
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".pcap,.pcapng"
                onChange={handleFileSelect}
                className="bg-input border-border/50"
              />
              <Button
                onClick={handleManualUpload}
                disabled={!selectedFile || isUploading}
                className="bg-primary hover:bg-primary/90 whitespace-nowrap"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: <span className="font-medium">{selectedFile.name}</span> (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Uploads */}
      {uploadHistory.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Uploads</CardTitle>
            <CardDescription>Arquivos enviados recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {uploadHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30"
                >
                  <div className="flex items-center gap-3">
                    {item.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === "success" ? "default" : "destructive"}>
                    {item.status === "success" ? "Sucesso" : "Erro"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
