import { useState } from "react";
// --- INÍCIO DA ALTERAÇÃO ---
// 1. Importar useNavigate
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// --- FIM DA ALTERAÇÃO ---
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"; // Corrigido para ../
import { Badge } from "../ui/badge"; // Corrigido para ../
import { Button } from "../ui/button"; // Corrigido para ../
import { Download, Eye, Loader2, AlertCircle, FileText } from "lucide-react"; 
import { getAnalyses, AnalysisReadSimple } from "../../api/analyses"; // Corrigido para ../../
import { downloadPcapFile } from "../../api/files"; // Corrigido para ../../
import { toast as sonnerToast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "../ui/pagination"; // Corrigido para ../
// --- INÍCIO DA ALTERAÇÃO ---
// 2. Remover importações do Dialog
// import {
//   Dialog,
//   ...
// } from "../ui/dialog";
// --- FIM DA ALTERAÇÃO ---
import { formatUtcDateToBrazil } from "../../lib/utils"; // Corrigido para ../../

// Mapeamento de status para configuração do Badge
const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  completed: { variant: "default", label: "Concluída" },
  in_progress: { variant: "secondary", label: "Processando" },
  pending: { variant: "outline", label: "Pendente" },
  failed: { variant: "destructive", label: "Falhou" },
};

export const AnalysesTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // --- INÍCIO DA ALTERAÇÃO ---
  // 3. Remover estado do modal e adicionar navigate
  // const [detailAnalysis, setDetailAnalysis] = useState<AnalysisReadSimple | null>(null); // REMOVIDO
  const navigate = useNavigate(); // ADICIONADO
  // --- FIM DA ALTERAÇÃO ---
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  // --- INÍCIO DA ALTERAÇÃO ---
  // 4. Atualizar handleViewDetails para navegar
  const handleViewDetails = (analysis: AnalysisReadSimple) => {
    console.log("Navigating to details for analysis:", analysis.id);
    navigate(`/analysis/${analysis.id}`);
  };
  // --- FIM DA ALTERAÇÃO ---

  // handleDownload (seguro, via blob)
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

      {/* --- INÍCIO DA ALTERAÇÃO --- */}
      {/* 5. Remover o Dialog de Detalhes da Análise */}
      {/* O modal foi removido daqui */}
      {/* --- FIM DA ALTERAÇÃO --- */}
    </div>
  );
};
