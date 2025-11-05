import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, AlertCircle, Loader2, Info } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { getFileByHash, getFileById, FileRead } from "@/api/files";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { formatUtcDateToBrazil } from "@/lib/utils";

export const HashSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<FileRead | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSearch = async () => {
    const term = searchTerm.trim();
    if (!term) {
      sonnerToast.error("Termo vazio", { description: "Por favor, insira um Hash SHA256 ou ID de arquivo." });
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      let fileData: FileRead | null = null;
      if (term.length === 64 && /^[a-fA-F0-9]{64}$/.test(term)) {
          sonnerToast.info("Buscando por Hash...");
          fileData = await getFileByHash(term);
      } else if (term.length === 36 && term.includes('-')) {
          sonnerToast.info("Buscando por ID...");
          fileData = await getFileById(term);
      } else {
          sonnerToast.warning("Formato inválido", { description: "Insira um Hash SHA256 (64 hex) ou um ID de arquivo (UUID)." });
          setIsSearching(false);
          return;
      }

      setSearchResult(fileData);
      setIsDetailOpen(true);
      sonnerToast.success("Arquivo encontrado!");

    } catch (err: any) {
      console.error("Erro na busca:", err);
      const message = err.response?.status === 404
        ? "Nenhum arquivo encontrado com este identificador."
        : err.response?.data?.detail || "Erro ao buscar arquivo.";
      setSearchError(message);
      sonnerToast.error("Busca falhou", { description: message });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Arquivo por Hash ou ID</CardTitle>
          <CardDescription>Encontre um arquivo específico usando seu hash SHA256 ou ID interno.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o Hash SHA256 (64 chars) ou ID (UUID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="font-mono"
              disabled={isSearching}
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
              {isSearching ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : (<Search className="h-4 w-4 mr-2" />)}
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchError && !isSearching && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{searchError}</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDetailOpen && !!searchResult} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Detalhes do Arquivo Encontrado</DialogTitle>
            </DialogHeader>
            {searchResult && (
                <div className="space-y-3 py-4 text-sm">
                    <div><span className="font-medium text-muted-foreground w-24 inline-block">Nome:</span> {searchResult.file_name}</div>
                    <div><span className="font-medium text-muted-foreground w-24 inline-block">ID:</span> <code className="text-xs">{searchResult.id}</code></div>
                    <div><span className="font-medium text-muted-foreground w-24 inline-block">Tamanho:</span> {searchResult.file_size.toFixed(2)} MB</div>
                    <div>
                      <span className="font-medium text-muted-foreground w-24 inline-block">Upload:</span>
                      {formatUtcDateToBrazil(searchResult.uploaded_at)}
                    </div>
                    <div><span className="font-medium text-muted-foreground w-24 inline-block">Usuário ID:</span> <code className="text-xs">{searchResult.user_id}</code></div>
                    <div className="pt-2"><span className="font-medium text-muted-foreground w-24 inline-block">Hash SHA256:</span> <code className="text-xs break-all">{searchResult.file_hash}</code></div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
