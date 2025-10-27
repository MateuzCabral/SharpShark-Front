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

  const handleSearch = async () => {
    if (!hash.trim()) {
      sonnerToast.error("Hash vazio", {
        description: "Por favor, insira um hash SHA256 para buscar.",
      });
      return;
    }

    setIsSearching(true);
    setError(null);
    setResult(null); // Limpa resultado anterior

    try {
      // Integração: Chamada real à API
      const fileData = await getFileByHash(hash.trim());
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

      {/* Exibe o resultado se encontrado */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hash</p>
                <p className="font-mono text-xs break-all">{result.file_hash}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arquivo</p>
                <p className="font-medium text-sm">{result.file_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tamanho</p>
                <p className="font-medium">{result.file_size.toFixed(2)} MB</p>
              </div>
               {/* Informações como 'packets', 'alerts', 'sourceIps', 'protocols'
                   pertencem à ANÁLISE, não ao ARQUIVO.
                   Seria necessário buscar a análise associada (GET /analyses?file_id=...)
                   para exibir esses detalhes aqui. Por simplicidade, vamos omitir por enquanto.
               */}
              <div>
                <p className="text-sm text-muted-foreground">Data Upload</p>
                <p className="font-medium text-sm">{new Date(result.uploaded_at).toLocaleString("pt-BR")}</p>
              </div>
            </div>
             {/* Exemplo de como buscar e mostrar alertas associados (requer API call adicional) */}
             {/* {result.analysis && result.analysis.alerts > 0 && ( ... ) } */}
          </CardContent>
        </Card>
      )}

      {/* Exibe erro se ocorrer */}
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