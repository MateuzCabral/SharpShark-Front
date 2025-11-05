import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileUp,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { uploadFile } from "@/api/files";
import { useQueryClient } from "@tanstack/react-query";

interface UploadHistoryItem {
  name: string;
  status: "success" | "error";
  timestamp: string;
  message?: string;
}

export const UploadArea = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".pcap") || file.name.endsWith(".pcapng")) {
        setSelectedFile(file);
        sonnerToast.info(`Arquivo selecionado: ${file.name}`);
      } else {
        sonnerToast.error("Seleção inválida", {
            description: "Por favor, selecione um arquivo .pcap ou .pcapng"
        });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
        setSelectedFile(null);
    }
  };

  const handleManualUpload = async () => {
    if (!selectedFile) {
      sonnerToast.error("Nenhum arquivo selecionado", {
          description: "Selecione um arquivo .pcap ou .pcapng para enviar."
      });
      return;
    }

    const maxSizeMB = 100;
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        sonnerToast.error("Arquivo muito grande", {
            description: `O arquivo excede o limite de ${maxSizeMB} MB.`
        });
        return;
    }

    const fileToUpload = selectedFile;
    setIsUploading(true);

    try {
      const response = await uploadFile(fileToUpload);

      setUploadHistory((prev) => [
        { name: fileToUpload.name, status: "success", timestamp: new Date().toLocaleString("pt-BR") },
        ...prev.slice(0, 4),
      ]);
      sonnerToast.success(`Upload concluído`, { description: `${fileToUpload.name} enviado.` });
      console.log("Resposta upload:", response);

      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

    } catch (error: any) {
      console.error("Erro no upload:", error);
      const errorDetail = error.response?.data?.detail || "Erro desconhecido.";
      setUploadHistory((prev) => [
        { name: fileToUpload.name, status: "error", timestamp: new Date().toLocaleString("pt-BR"), message: errorDetail },
        ...prev.slice(0, 4),
      ]);
      sonnerToast.error("Falha no Upload", { description: errorDetail });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileUp className="h-5 w-5 text-primary" /> Upload Manual</CardTitle>
          <CardDescription>Envie arquivos .pcap ou .pcapng para análise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Selecionar Arquivo (.pcap/.pcapng)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input id="file-upload" ref={fileInputRef} type="file" accept=".pcap,.pcapng" onChange={handleFileSelect} className="bg-input border-border/50 flex-grow" disabled={isUploading}/>
              <Button onClick={handleManualUpload} disabled={!selectedFile || isUploading} className="bg-primary hover:bg-primary/90 whitespace-nowrap w-full sm:w-auto">
                {isUploading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>) : (<><Upload className="h-4 w-4 mr-2" />Enviar Arquivo</>)}
              </Button>
            </div>
            {selectedFile && !isUploading && (
              <p className="text-sm text-muted-foreground pt-1">Arquivo: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadHistory.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader><CardTitle className="text-lg">Histórico Recente de Uploads</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {uploadHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 bg-card/30 text-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {item.status === "success" ? (<CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />) : (<XCircle className="h-5 w-5 text-destructive shrink-0" />)}
                    <div className="overflow-hidden">
                      <p className="font-medium truncate" title={item.name}>{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                      {item.status === 'error' && item.message && (<p className="text-xs text-destructive truncate" title={item.message}>Erro: {item.message}</p>)}
                    </div>
                  </div>
                  <Badge variant={item.status === "success" ? "default" : "destructive"} className="shrink-0">{item.status === "success" ? "Sucesso" : "Erro"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};