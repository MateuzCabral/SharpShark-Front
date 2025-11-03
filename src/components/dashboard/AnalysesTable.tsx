// src/componentes/dashboard/AnalysesTable.tsx
import { useState, useEffect, useRef } from "react"; // 1. Adicionado useEffect e useRef
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2, AlertCircle, FileText, Info } from "lucide-react"; 
import { getAnalyses, AnalysisReadSimple } from "@/api/analyses"; 
import { downloadPcapFile } from "@/api/files"; 
import { toast as sonnerToast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"; 
// 2. Adicionar importações do AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatUtcDateToBrazil } from "@/lib/utils"; 

// Mapeamento de status
const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  completed: { variant: "default", label: "Concluída" },
  in_progress: { variant: "secondary", label: "Processando" },
  pending: { variant: "outline", label: "Pendente" },
  failed: { variant: "destructive", label: "Falhou" },
};

// 3. Tipo para o mapa de estado anterior
type AnalysisStatusMap = { [id: string]: string };

export const AnalysesTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate(); 
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // 4. Estado para a fila de notificações e referência para o estado anterior
  const [completedQueue, setCompletedQueue] = useState<AnalysisReadSimple[]>([]);
  const previousAnalyses = useRef<AnalysisStatusMap>({});
  
  const queryClient = useQueryClient(); // Já estava no seu código

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['analyses', currentPage, itemsPerPage],
    queryFn: () => getAnalyses(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
    // Polling já está sendo definido globalmente no Dashboard.tsx
  });

  const analyses = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  // 5. useEffect para detectar análises concluídas
  useEffect(() => {
    if (analyses.length > 0) {
      const newCompleted: AnalysisReadSimple[] = [];
      const currentStatusMap: AnalysisStatusMap = {};

      analyses.forEach(analysis => {
        const oldStatus = previousAnalyses.current[analysis.id];
        // Se o status anterior era 'in_progress' E o novo é 'completed'
        if (oldStatus === 'in_progress' && analysis.status === 'completed') {
          newCompleted.push(analysis);
        }
        currentStatusMap[analysis.id] = analysis.status;
      });

      // Adiciona as novas análises concluídas à fila
      if (newCompleted.length > 0) {
        setCompletedQueue(prevQueue => [...prevQueue, ...newCompleted]);
      }

      // Atualiza o estado anterior para a próxima verificação
      previousAnalyses.current = currentStatusMap;
    }
  }, [analyses]); // Depende dos dados do useQuery

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

  // 6. Funções para controlar o modal de notificação
  const handleModalAction = (confirm: boolean) => {
    if (confirm && completedQueue.length > 0) {
      // Pega o primeiro da fila e navega
      const analysisToView = completedQueue[0];
      navigate(`/analysis/${analysisToView.id}`);
    }
    // Remove o primeiro da fila (seja 'Sim' ou 'Não') e permite que o próximo apareça
    setCompletedQueue(prevQueue => prevQueue.slice(1));
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

  return (
    <div className="space-y-4">
      {/* Container da Tabela com Responsividade */}
      <div className="rounded-md border border-border/50 relative">
        {isFetching && (
            <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )}
        {/* Div para overflow da tabela em telas pequenas */}
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead>Arquivo</TableHead>
                {/* Colunas responsivas */}
                <TableHead className="hidden md:table-cell">Pacotes</TableHead>
                <TableHead className="hidden md:table-cell">Tamanho</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Analisado em</TableHead>
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
                    {/* Colunas responsivas */}
                    <TableCell className="hidden md:table-cell">{analysis.total_packets.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {analysis.file?.file_size ? `${analysis.file.file_size.toFixed(1)} MB` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[analysis.status]?.variant || 'secondary'}>
                        {statusConfig[analysis.status]?.label || analysis.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
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
      </div>

       {/* Paginação */}
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

      {/* 7. AlertDialog para a notificação */}
      <AlertDialog open={completedQueue.length > 0} onOpenChange={(isOpen) => {
          // Se o usuário fechar clicando fora (isOpen == false), trata como "Não"
          if (!isOpen) handleModalAction(false);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Análise Concluída</AlertDialogTitle>
            <AlertDialogDescription>
              A análise do arquivo <span className="font-medium text-foreground">{completedQueue[0]?.file?.file_name || '...'}</span> foi concluída.
              <br/>
              Deseja ver os detalhes agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleModalAction(false)}>Não</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleModalAction(true)}>Sim, ver detalhes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

