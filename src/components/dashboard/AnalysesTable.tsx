// src/componentes/dashboard/AnalysesTable.tsx
import { useState, useEffect, useRef } from "react"; // 1. Importar useEffect e useRef
import { useNavigate } from "react-router-dom"; // 2. Importar useNavigate
import { useQuery } from "@tanstack/react-query";
// --- INÍCIO DA CORREÇÃO DE CAMINHOS ---
// Corrigindo todos os caminhos de '@/' para caminhos relativos
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
// 3. Importar AlertDialog e CheckCircle
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Download, Eye, Loader2, AlertCircle, FileText, CheckCircle } from "lucide-react"; 
import { getAnalyses, AnalysisReadSimple } from "../../api/analyses"; 
import { downloadPcapFile } from "../../api/files"; 
import { toast as sonnerToast } from "sonner";
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
// --- FIM DA CORREÇÃO DE CAMINHOS ---

// Mapeamento de status
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
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // 4. Estados para a notificação de conclusão
  const previousAnalysesRef = useRef<AnalysisReadSimple[]>([]);
  const [completedAnalysesQueue, setCompletedAnalysesQueue] = useState<AnalysisReadSimple[]>([]);
  const isInitialLoadRef = useRef(true);

  // 5. Pegar o isSuccess
  const { data, isLoading, error, isFetching, isSuccess } = useQuery({ 
    queryKey: ['analyses', currentPage, itemsPerPage],
    queryFn: () => getAnalyses(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
    // O polling já está sendo definido globalmente no Dashboard.tsx
  });

  // 6. useEffect para detectar análises concluídas
  useEffect(() => {
    if (isSuccess && data?.items) {
      
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        previousAnalysesRef.current = data.items;
        return;
      }

      const prevItems = previousAnalysesRef.current;
      const newlyCompleted: AnalysisReadSimple[] = [];

      for (const currentAnalysis of data.items) {
        if (currentAnalysis.status === 'completed') {
          const prevAnalysis = prevItems.find(p => p.id === currentAnalysis.id);
          
          if (prevAnalysis && prevAnalysis.status !== 'completed') {
            newlyCompleted.push(currentAnalysis);
          }
        }
      }

      if (newlyCompleted.length > 0) {
        setCompletedAnalysesQueue(prevQueue => [...prevQueue, ...newlyCompleted]);
        
        newlyCompleted.forEach(analysis => {
            sonnerToast.success("Análise Concluída", {
                description: `O arquivo ${analysis.file?.file_name || analysis.id} terminou.`,
            });
        });
      }

      previousAnalysesRef.current = data.items;
    }
  }, [data, isSuccess]); 


  const analyses = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (analysis: AnalysisReadSimple) => {
    console.log("Navigating to details for analysis:", analysis.id);
    navigate(`/analysis/${analysis.id}`);
  };

  const handleDownload = async (analysis: AnalysisReadSimple) => {
    const fileName = analysis.file?.file_name || `${analysis.id}.pcap`;
    if (downloadingId) return; 
    setDownloadingId(analysis.id);
    sonnerToast.info("Preparando download...", {
      description: fileName,
    });
    try {
      await downloadPcapFile(analysis.file_id, fileName);
    } catch (error: any) {
      console.error("Falha no download:", error);
      sonnerToast.error("Falha no download", {
        description: error.response?.data?.detail || "Não foi possível baixar o arquivo.",
      });
    } finally {
      setDownloadingId(null); 
    }
  };

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

  // 7. Lógica para o AlertDialog
  const analysisToShowInModal = completedAnalysesQueue[0];

  const handleRedirect = () => {
    if (!analysisToShowInModal) return;
    navigate(`/analysis/${analysisToShowInModal.id}`);
    setCompletedAnalysesQueue(prevQueue => prevQueue.slice(1)); // Remove da fila
  };

  const handleCloseModal = () => {
    setCompletedAnalysesQueue(prevQueue => prevQueue.slice(1)); // Remove da fila
  };

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

      {/* Modal de Detalhes (Sem alteração) */}
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
      
      {/* 8. Adicionar o AlertDialog para notificação */}
      <AlertDialog open={completedAnalysesQueue.length > 0}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Análise Concluída
            </AlertDialogTitle>
            <AlertDialogDescription>
              A análise para o arquivo <span className="font-medium text-foreground">"{analysisToShowInModal?.file?.file_name}"</span> foi concluída.
              <br/>
              Deseja ir para a página de detalhes agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseModal}>Não</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedirect}>Sim, ver detalhes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

