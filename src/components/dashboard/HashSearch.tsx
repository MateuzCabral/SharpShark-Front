// src/componentes/dashboard/HashSearch.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner"; // Usando sonner aqui
import { getFileByHash, FileRead } from "@/api/files"; // Integração

export const HashSearch = () => {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<FileRead | null>(null); // Integração: Usar tipo FileRead
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Função helper para formatar data/hora ---
  const formatDateTime = (isoString: string | null | undefined): string => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch (e) {
      console.error("Error formatting date:", isoString, e);
      return isoString;
    }
  };
  // --- Fim Função Helper ---

  const handleSearch = async () => {
    const trimmedHash = hash.trim();
    if (!trimmedHash) {
      sonnerToast.error("Hash vazio", {
        description: "Por favor, insira um hash SHA256 para buscar.",
      });
      return;
    }
    // Adicionar validação básica de formato SHA256 (64 hex chars) - opcional
    if (!/^[a-fA-F0-9]{64}$/.test(trimmedHash)) {
       sonnerToast.warning("Formato inválido", {
         description: "O hash SHA256 deve ter 64 caracteres hexadecimais.",
       });
       return;
    }


    setIsSearching(true);
    setError(null);
    setResult(null); // Limpa resultado anterior

    try {
      // Integração: Chamada real à API
      const fileData = await getFileByHash(trimmedHash);
      setResult(fileData);
      sonnerToast.success("Arquivo encontrado", {
        description: `Hash: ${fileData.file_hash.substring(0, 16)}...`,
      });
    } catch (err: any) {
      console.error("Erro na busca por hash:", err);
      const message = err.response?.status === 404
        ? "Nenhum arquivo com este hash foi encontrado."
        : err.response?.data?.detail || "Erro ao buscar arquivo.";
      setError(message);
      sonnerToast.error("Busca falhou", {
        description: message,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar por Hash (SHA256)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o hash SHA256 do arquivo..."
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="font-mono"
              disabled={isSearching}
            />
            <Button onClick={handleSearch} disabled={isSearching || !hash.trim()}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de Resultado */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Resultado da Busca
               {/* Poderia adicionar status da análise associada se API retornasse */}
               {/* <Badge variant="secondary">Analisado</Badge> */}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Ajustado gap */}
              <div className="md:col-span-2"> {/* Hash ocupa duas colunas */}
                <p className="text-sm text-muted-foreground">Hash</p>
                <p className="font-mono text-xs break-all">{result.file_hash}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arquivo</p>
                <p className="font-medium text-sm truncate" title={result.file_name}>{result.file_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tamanho</p>
                <p className="font-medium">{result.file_size.toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Upload (SP)</p> {/* Atualizado label */}
                <p className="font-medium text-sm">
                   {/* Aplica a formatação aqui */}
                   {formatDateTime(result.uploaded_at)}
                </p>
              </div>
              <div>
                 <p className="text-sm text-muted-foreground">Usuário (ID)</p>
                 <p className="font-medium text-xs font-mono" title={result.user_id}>{result.user_id.substring(0,8)}...</p>
              </div>
            </div>
             {/* Informações da Análise Associada (Exigiria busca adicional) */}
             {/*
             <div>
               <p className="text-sm text-muted-foreground mb-1">Análise Associada</p>
               <Button variant="link" size="sm" className="p-0 h-auto">Ver detalhes da análise</Button>
             </div>
             */}
          </CardContent>
        </Card>
      )}

      {/* Card de Erro */}
      {error && !isSearching && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{error}</p>
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};