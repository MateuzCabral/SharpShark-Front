import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Eye, Loader2, AlertCircle } from "lucide-react";
import { getAlerts, AlertRead, getAnalysisAlerts } from "@/api/alerts";
import { getStreamContent } from "@/api/analyses";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

interface AlertsTableProps {
  limit?: number; 
  analysisId?: string; 
}

const severityColors: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
};

const StreamContent = ({ streamId }: { streamId: string }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['streamContent', streamId], 
    queryFn: () => getStreamContent(streamId), 
    enabled: !!streamId, 
    staleTime: 5 * 60 * 1000, 
    retry: 1, 
  });

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Carregando conteúdo do stream...</p>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    let errorMessage = "Falha ao carregar o conteúdo do stream.";
    // @ts-ignore
    if (error?.response?.status === 413) {
      errorMessage = "Falha: O stream é muito grande para ser exibido aqui.";
    // @ts-ignore
    } else if (error?.response?.status === 404) {
      errorMessage = "Falha: O arquivo de stream não foi encontrado no servidor.";
    }
    
    return (
      <div className="mt-4 p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">{errorMessage}</span>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Conteúdo do Stream (Texto Plano)</p>
      <ScrollArea className="h-64 w-full rounded-md border bg-muted/30 p-3">
        <pre className="text-xs text-foreground whitespace-pre-wrap break-words">
          {data || "Stream vazio ou sem conteúdo legível."}
        </pre>
      </ScrollArea>
    </div>
  );
};


export const AlertsTable = ({ limit, analysisId }: AlertsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = limit ?? 10;
  const [selectedAlert, setSelectedAlert] = useState<AlertRead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['alerts', analysisId, currentPage, itemsPerPage],
    queryFn: async () => {
      if (analysisId) {
        return getAnalysisAlerts(analysisId, currentPage, itemsPerPage);
      } else {
         return getAlerts(currentPage, itemsPerPage);
      }
    },
    placeholderData: (previousData) => previousData,
  });

  const alerts = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

   const handleViewDetails = (alertData: AlertRead) => {
      console.log("View details for alert:", alertData);
      setSelectedAlert(alertData);
      setIsDetailOpen(true);
   };

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Carregando alertas...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-40 text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-4">
        <AlertCircle className="h-8 w-8 mb-2" />
        <span className="font-medium">Falha ao carregar alertas</span>
        <span className="text-sm">Por favor, tente atualizar a página.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/50 relative">
       {isFetching && ( 
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex justify-center items-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Atualizando...</span>
          </div>
       )}
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50 border-b border-border/50">
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>IP Origem</TableHead>
                <TableHead className="hidden md:table-cell">IP Destino</TableHead>
                <TableHead className="hidden md:table-cell">Porta</TableHead>
                <TableHead className="hidden md:table-cell">Protocolo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                          Nenhum alerta encontrado{analysisId ? ' para esta análise' : ''}.
                      </TableCell>
                  </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium max-w-[150px] truncate" title={alert.alert_type}>
                      {alert.alert_type}
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityColors[alert.severity.toLowerCase()] || 'secondary'}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{alert.src_ip || "-"}</TableCell>
                    <TableCell className="font-mono text-sm hidden md:table-cell">{alert.dst_ip || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{alert.port ?? "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{alert.protocol || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(alert)} title="Ver Detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

       {!limit && totalPages > 1 && (
         <div className="flex flex-col items-center gap-2">
             <Pagination>
             <PaginationContent>
                 <PaginationItem>
                 <PaginationPrevious
                     href="#"
                     onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                     aria-disabled={currentPage === 1}
                     className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                 />
                 </PaginationItem>
                 {(() => {
                     const pageNumbers = [];
                     const maxPagesToShow = 5;
                     const halfMax = Math.floor(maxPagesToShow / 2);

                     if (totalPages <= maxPagesToShow + 2) {
                        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
                     } else {
                        pageNumbers.push(1);
                        let startPage = Math.max(2, currentPage - halfMax);
                        let endPage = Math.min(totalPages - 1, currentPage + halfMax);
                        if (currentPage <= halfMax + 1) endPage = maxPagesToShow + 1;
                        if (currentPage >= totalPages - halfMax) startPage = totalPages - maxPagesToShow;
                        if (startPage > 2) pageNumbers.push(-1);
                        for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
                        if (endPage < totalPages - 1) pageNumbers.push(-1);
                        pageNumbers.push(totalPages);
                     }

                     return pageNumbers.map((pageNum, index) => (
                        pageNum === -1 ? (
                           <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                           <PaginationItem key={pageNum}>
                           <PaginationLink
                               href="#"
                               onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}
                               isActive={currentPage === pageNum}
                               aria-current={currentPage === pageNum ? "page" : undefined}
                           >
                               {pageNum}
                           </PaginationLink>
                           </PaginationItem>
                        )
                     ));
                 })()}
                 <PaginationItem>
                 <PaginationNext
                     href="#"
                     onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                     aria-disabled={currentPage === totalPages}
                     className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                 />
                 </PaginationItem>
             </PaginationContent>
             </Pagination>
         </div>
       )}
       {!limit && totalItems > 0 && (
          <p className="text-center text-sm text-muted-foreground">
              Mostrando {alerts.length} de {totalItems} {totalItems === 1 ? 'alerta' : 'alertas'}. Página {currentPage} de {totalPages}.
          </p>
       )}
       {limit && totalItems > limit && (
           <p className="text-center text-sm text-muted-foreground">
              Mostrando os {limit} alertas mais recentes de {totalItems}.
           </p>
       )}

      <Dialog open={isDetailOpen && !!selectedAlert} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedAlert(null);
          }
          setIsDetailOpen(isOpen);
        }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${selectedAlert?.severity === 'critical' || selectedAlert?.severity === 'high' ? 'text-destructive' : 'text-primary'}`} />
              Detalhes do Alerta
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o alerta <code className="text-xs">{selectedAlert?.alert_type}</code>
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-3 py-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div><span className="font-medium text-muted-foreground w-24 inline-block">Tipo:</span> {selectedAlert.alert_type}</div>
                <div><span className="font-medium text-muted-foreground w-24 inline-block">Severidade:</span> 
                  <Badge variant={severityColors[selectedAlert.severity.toLowerCase()] || 'secondary'}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                  </Badge>
                </div>
                <div><span className="font-medium text-muted-foreground w-24 inline-block">IP Origem:</span> <code className="text-xs">{selectedAlert.src_ip || "-"}</code></div>
                <div><span className="font-medium text-muted-foreground w-24 inline-block">IP Destino:</span> <code className="text-xs">{selectedAlert.dst_ip || "-"}</code></div>
                <div><span className="font-medium text-muted-foreground w-24 inline-block">Porta:</span> {selectedAlert.port ?? "-"}</div>
                <div><span className="font-medium text-muted-foreground w-24 inline-block">Protocolo:</span> {selectedAlert.protocol || "-"}</div>
                <div><span className="font-medium text-muted-foreground w-24 inline-block">Análise ID:</span> <code className="text-xs">{selectedAlert.analysis_id}</code></div>
                {selectedAlert.stream_id && <div><span className="font-medium text-muted-foreground w-24 inline-block">Stream ID:</span> <code className="text-xs">{selectedAlert.stream_id}</code></div>}
              </div>
              
              {selectedAlert.evidence && (
                <div className="space-y-1 pt-2">
                  <span className="font-medium text-muted-foreground w-24 inline-block">Evidência:</span>
                  <p className="text-xs p-2 rounded-md bg-muted/50 border italic text-foreground">{selectedAlert.evidence}</p>

                </div>
              )}

              {selectedAlert.stream_id && (
                <StreamContent streamId={selectedAlert.stream_id} />
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

