import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export const HashSearch = () => {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - preparado para GET /files/hash/{file_hash}
  const mockFileData = {
    hash: "a1b2c3d4e5f6g7h8",
    filename: "capture_2025-10-15.pcapng",
    size: "2.5 MB",
    packets: 15420,
    uploadDate: "2025-10-15 14:23:15",
    status: "analyzed",
    alerts: 3,
    sourceIps: ["192.168.1.45", "203.0.113.89"],
    protocols: ["TCP", "UDP", "HTTP"],
  };

  const handleSearch = () => {
    if (!hash.trim()) {
      toast({
        title: "Hash vazio",
        description: "Por favor, insira um hash para buscar.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Simula chamada à API: GET /files/hash/{file_hash}
    setTimeout(() => {
      // Mock: retorna dados se hash tiver mais de 8 caracteres
      if (hash.length >= 8) {
        setResult({ ...mockFileData, hash });
        toast({
          title: "Arquivo encontrado",
          description: `Hash: ${hash.substring(0, 16)}...`,
        });
      } else {
        setResult(null);
        toast({
          title: "Arquivo não encontrado",
          description: "Nenhum arquivo com esse hash foi encontrado.",
          variant: "destructive",
        });
      }
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar por Hash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o hash do arquivo (ex: a1b2c3d4e5f6g7h8...)"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="font-mono"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Resultado da Busca
              <Badge variant="secondary">{result.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hash</p>
                <p className="font-mono text-sm break-all">{result.hash}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arquivo</p>
                <p className="font-medium">{result.filename}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tamanho</p>
                <p className="font-medium">{result.size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacotes</p>
                <p className="font-medium">{result.packets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Upload</p>
                <p className="font-medium text-sm">{result.uploadDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <Badge variant={result.alerts > 0 ? "destructive" : "secondary"}>
                  {result.alerts} alertas
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">IPs de Origem</p>
              <div className="flex gap-2 flex-wrap">
                {result.sourceIps.map((ip: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="font-mono">
                    {ip}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Protocolos</p>
              <div className="flex gap-2 flex-wrap">
                {result.protocols.map((protocol: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {protocol}
                  </Badge>
                ))}
              </div>
            </div>

            {result.alerts > 0 && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Alertas detectados</p>
                  <p className="text-muted-foreground">
                    Este arquivo possui {result.alerts} alertas de segurança. Verifique a aba de Alertas para mais detalhes.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};