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
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2, AlertCircle } from "lucide-react";
import { getAnalyses, AnalysisReadSimple } from "@/api/analyses"; // Integração
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"; // Integração

// Mapeamento de status para configuração do Badge
const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  completed: { variant: "default", label: "Concluída" },
  in_progress: { variant: "secondary", label: "Processando" },
  pending: { variant: "outline", label: "Pendente" },
  failed: { variant: "destructive", label: "Falhou" },
};

export const AnalysesTable = () => {
  // Integração: Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Integração: Usando React Query para buscar as análises
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['analyses', currentPage, itemsPerPage],
    queryFn: () => getAnalyses(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
    // staleTime: 5 * 60 * 1000, // Cache de 5 minutos
  });

  const analyses = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Integração: Funções para ações
  const handleViewDetails = (analysis: AnalysisReadSimple) => {
    console.log("View details for analysis:", analysis);
    // TODO: Navegar para uma página de detalhes da análise
    // Ex: navigate(`/analysis/${analysis.id}`);
    alert(`Detalhes da Análise (ID: ${analysis.id})\nStatus: ${analysis.status}\nPacotes: ${analysis.total_packets}\nStreams Salvos: ${analysis.total_streams}\nDuração: ${analysis.duration}s`);
  };

  const handleDownload = (analysis: AnalysisReadSimple) => {
    console.log("Download analysis file:", analysis);
    // TODO: Implementar download. O backend não tem endpoint para isso.
    // Poderia tentar baixar o `file_path` se acessível diretamente,
    // ou adicionar um endpoint no backend para servir o arquivo original.
    alert(`Funcionalidade de download do arquivo original (${analysis.file?.file_name}) não implementada.`);
  };


  // Integração: Loading e Erro
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
        {isFetching && ( // Indicador de refresh
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
              {/* <TableHead>Alertas</TableHead> */} {/* Remover ou buscar contagem */}
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
                    {/* // Integração: Usar nome do arquivo da API se disponível */}
                    {analysis.file?.file_name || `Análise ID: ${analysis.id}`}
                  </TableCell>
                  <TableCell>{analysis.total_packets.toLocaleString()}</TableCell>
                  <TableCell>
                    {/* // Integração: Usar tamanho do arquivo da API se disponível */}
                    {analysis.file?.file_size ? `${analysis.file.file_size.toFixed(1)} MB` : '-'}
                  </TableCell>
                  {/* <TableCell>
                    {analysis.alerts_count > 0 ? ( // Ajustar se a contagem for adicionada
                      <Badge variant="destructive">{analysis.alerts_count}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell> */}
                  <TableCell>
                    <Badge variant={statusConfig[analysis.status]?.variant || 'secondary'}>
                      {statusConfig[analysis.status]?.label || analysis.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {/* // Integração: Formatar data da API */}
                    {analysis.analyzed_at ? new Date(analysis.analyzed_at).toLocaleString("pt-BR") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(analysis)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(analysis)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

       {/* Integração: Controles de Paginação */}
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
             {/* Lógica simples para exibir páginas */}
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
    </div>
  );
};