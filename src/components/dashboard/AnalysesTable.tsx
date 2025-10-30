// src/componentes/dashboard/AnalysesTable.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Download, Eye, Loader2, AlertCircle, FileText } from "lucide-react";
// --- INÍCIO DA ALTERAÇÃO ---
// 1. Importar a função de download 'blob'
import { getAnalyses, AnalysisReadSimple } from "../../api/analyses";
import { downloadPcapFile } from "../../api/files"; // Importado!
import { toast as sonnerToast } from "sonner";
// --- FIM DA ALTERAÇÃO ---
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "../../components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../components/ui/dialog";
import { formatUtcDateToBrazil } from "../../lib/utils";

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  completed: { variant: "default", label: "Concluída" },
  in_progress: { variant: "secondary", label: "Processando" },
  pending: { variant: "outline", label: "Pendente" },
  failed: { variant: "destructive", label: "Falhou" },
};

export const AnalysesTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [detailAnalysis, setDetailAnalysis] = useState<AnalysisReadSimple | null>(null);
  
  // --- INÍCIO DA ALTERAÇÃO ---
  // 2. Estado para controlar o loading do download (RE-ADICIONADO)
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  // --- FIM DA ALTERAÇÃO ---

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['analyses', currentPage, itemsPerPage],
    queryFn: () => getAnalyses(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
  });

  const analyses = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (analysis: AnalysisReadSimple) => {
    console.log("View details for analysis:", analysis);
    setDetailAnalysis(analysis);
  };

  // --- INÍCIO DA ALTERAÇÃO ---
  // 3. Lógica de download (async) atualizada
  const handleDownload = async (analysis: AnalysisReadSimple) => {
    const fileName = analysis.file?.file_name || `${analysis.id}.pcap`;
    
    if (downloadingId) return; 
    
    setDownloadingId(analysis.id);
    sonnerToast.info("Preparando download...", {
      description: fileName,
    });

    try {
      // Chamar a função 'async' da API
      await downloadPcapFile(analysis.file_id, fileName);
      
    } catch (error: any) {
      console.error("Falha no download:", error);
      sonnerToast.error("Falha no download", {
        description: error.response?.data?.detail || "Não foi possível baixar o arquivo.",
      });
    } finally {
      setDownloadingId(null); // Reseta o estado de loading
    }
  };
  // --- FIM DA ALTERAÇÃO ---

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando análises...</span>
      </div>
    );
  }
   if (error) {
    return (
      <div className="flex justify-center items-center h-40 text-destructive">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>Falha ao carregar análises. Tente novamente.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/50 relative">
        {isFetching && (
            <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead>Arquivo</TableHead>
              <TableHead>Pacotes</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Analisado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        Nenhuma análise encontrada.
                    </TableCell>
                </TableRow>
            ) : (
                analyses.map((analysis) => (
                <TableRow key={analysis.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {analysis.file?.file_name || `Análise ID: ${analysis.id}`}
                  </TableCell>
                  <TableCell>{analysis.total_packets.toLocaleString()}</TableCell>
                  <TableCell>
                    {analysis.file?.file_size ? `${analysis.file.file_size.toFixed(1)} MB` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[analysis.status]?.variant || 'secondary'}>
                      {statusConfig[analysis.status]?.label || analysis.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatUtcDateToBrazil(analysis.analyzed_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(analysis)} disabled={downloadingId !== null}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* --- INÍCIO DA ALTERAÇÃO --- */}
                      {/* 4. Botão de Download com estado de loading */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownload(analysis)}
                        disabled={downloadingId !== null} 
                        title="Baixar arquivo PCAP original"
                      >
                        {downloadingId === analysis.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" /> 
                        ) : (
                          <Download className="h-4 w-4" /> 
                        )}
                      </Button>
                      {/* --- FIM DA ALTERAÇÃO --- */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

       {totalPages > 1 && (
         <Pagination>
           <PaginationContent>
             <PaginationItem>
               <PaginationPrevious
                 href="#"
                 onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                 className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
               />
             </PaginationItem>
             {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                     return (
                         <PaginationItem key={pageNum}>
                         <PaginationLink
                             href="#"
                             onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}
                             isActive={currentPage === pageNum}
                         >
                             {pageNum}
                         </PaginationLink>
                         </PaginationItem>
                     );
                  } else if (Math.abs(pageNum - currentPage) === 2) {
                     return <PaginationItem key={`ellipsis-${pageNum}`}><PaginationEllipsis /></PaginationItem>;
                  }
                  return null;
             })}
             <PaginationItem>
               <PaginationNext
                 href="#"
                 onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                 className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
               />
             </PaginationItem>
           </PaginationContent>
         </Pagination>
       )}
        {totalItems > 0 && (
          <p className="text-center text-sm text-muted-foreground">
              Mostrando {analyses.length} de {totalItems} análises. Página {currentPage} de {totalPages}.
          </p>
       )}

      <Dialog open={!!detailAnalysis} onOpenChange={(isOpen) => !isOpen && setDetailAnalysis(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detalhes da Análise
            </DialogTitle>
            <DialogDescription>
              Informações sobre a análise <code className="text-xs">{detailAnalysis?.id}</code>
            </DialogDescription>
          </DialogHeader>
          
          {detailAnalysis && (
            <div className="space-y-3 py-4 text-sm">
              <div className="flex"><span className="font-medium text-muted-foreground w-32 inline-block shrink-0">Arquivo:</span> <span className="truncate">{detailAnalysis.file?.file_name || "-"}</span></div>
              <div className="flex"><span className="font-medium text-muted-foreground w-32 inline-block shrink-0">Status:</span> 
                <Badge variant={statusConfig[detailAnalysis.status]?.variant || 'secondary'}>
                  {statusConfig[detailAnalysis.status]?.label || detailAnalysis.status}
                </Badge>
              </div>
              <div className="flex"><span className="font-medium text-muted-foreground w-32 inline-block shrink-0">Analisado em:</span> {formatUtcDateToBrazil(detailAnalysis.analyzed_at)}</div>
              <div className="flex"><span className="font-medium text-muted-foreground w-32 inline-block shrink-0">Duração:</span> {detailAnalysis.duration.toFixed(2)} segundos</div>
              <div className="flex"><span className="font-medium text-muted-foreground w-32 inline-block shrink-0">Total Pacotes:</span> {detailAnalysis.total_packets.toLocaleString()}</div>
              <div className="flex"><span className="font-medium text-muted-foreground w-32 inline-block shrink-0">Streams Salvos:</span> {detailAnalysis.total_streams.toLocaleString()}</div>
              <div className="flex"><span className="font-medium text-muted-foreground w-32 inline-block shrink-0">ID do Arquivo:</span> <code className="text-xs">{detailAnalysis.file_id}</code></div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};