// src/componentes/dashboard/AlertsTable.tsx
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
import { Eye, Loader2, AlertCircle } from "lucide-react";
import { getAlerts, AlertRead, getAnalysisAlerts } from "@/api/alerts"; // Integração: Adicionado getAnalysisAlerts
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"; // Integração: Importar paginação

interface AlertsTableProps {
  limit?: number; // Para exibição limitada (ex: Overview)
  analysisId?: string; // Para buscar alertas de uma análise específica
}

// Mapeamento de severidade para variantes do Badge (ajustado visualmente)
const severityColors: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive", // Ambas vermelhas
  medium: "default",   // Azul (padrão Shadcn)
  low: "secondary",    // Cinza
};

export const AlertsTable = ({ limit, analysisId }: AlertsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = limit ?? 10; // Usa limite ou padrão 10 para paginação

  // Hook do React Query para buscar os dados
  const { data, isLoading, error, isFetching } = useQuery({
    // A chave da query inclui dependências que causam refetch (ID, página, itens)
    queryKey: ['alerts', analysisId, currentPage, itemsPerPage],
    queryFn: async () => {
      // Decide qual função da API chamar
      if (analysisId) {
        // Busca alertas específicos da análise (API já pagina)
        console.log(`Fetching alerts for analysis ${analysisId}, page ${currentPage}`);
        return getAnalysisAlerts(analysisId, currentPage, itemsPerPage);
      } else {
         // Busca alertas gerais (API simula paginação no frontend)
         console.log(`Fetching general alerts, page ${currentPage}`);
         return getAlerts(currentPage, itemsPerPage);
      }
    },
    placeholderData: (previousData) => previousData, // Mantém dados antigos enquanto busca novos (evita piscar)
    // staleTime: 60 * 1000, // Opcional: considerar dados "frescos" por 1 minuto
  });

  // Extrai dados da resposta ou usa arrays/valores padrão
  const alerts = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  // Handler para mudança de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

   // Handler para exibir detalhes (exemplo usando alert())
   const handleViewDetails = (alertData: AlertRead) => {
      console.log("View details for alert:", alertData);
      // Monta a mensagem para o alert
      const details = [
        `ID: ${alertData.id}`,
        `Tipo: ${alertData.alert_type}`,
        `Severidade: ${alertData.severity}`,
        `IP Origem: ${alertData.src_ip || "-"}`,
        `IP Destino: ${alertData.dst_ip || "-"}`,
        `Porta: ${alertData.port ?? "-"}`,
        `Protocolo: ${alertData.protocol || "-"}`,
        `Evidência: ${alertData.evidence || "-"}`,
        `Análise ID: ${alertData.analysis_id}`,
      ];
      if (alertData.stream_id) {
          details.push(`Stream ID: ${alertData.stream_id}`);
          // TODO: Adicionar botão/lógica para buscar e mostrar conteúdo do stream aqui
          // Ex: getStreamContent(alert.stream_id).then(content => ...)
      }
      // Usar window.alert temporariamente para exibir detalhes
      window.alert(`Detalhes do Alerta:\n\n${details.join("\n")}`);
   };

  // Renderização condicional: Loading inicial
  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Carregando alertas...</span>
      </div>
    );
  }

  // Renderização condicional: Erro na busca
  if (error) {
    console.error("Erro ao buscar alertas:", error); // Log do erro no console
    return (
      <div className="flex flex-col justify-center items-center h-40 text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-4">
        <AlertCircle className="h-8 w-8 mb-2" />
        <span className="font-medium">Falha ao carregar alertas</span>
        <span className="text-sm">Por favor, tente atualizar a página.</span>
        {/* Opcional: Mostrar detalhes do erro */}
        {/* <pre className="text-xs mt-2">{error.message}</pre> */}
      </div>
    );
  }

  // Renderização principal: Tabela e Paginação
  return (
    <div className="space-y-4">
      {/* Container da Tabela com indicador de fetching */}
      <div className="rounded-md border border-border/50 relative overflow-hidden">
       {isFetching && ( // Mostra spinner de atualização sobre a tabela
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex justify-center items-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Atualizando...</span>
          </div>
       )}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 border-b border-border/50">
              {/* Colunas da tabela */}
              <TableHead>Tipo</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead>IP Origem</TableHead>
              <TableHead>IP Destino</TableHead>
              <TableHead>Porta</TableHead>
              <TableHead>Protocolo</TableHead>
              {/* <TableHead>Data/Hora</TableHead> */} {/* Descomentar se timestamp for adicionado */}
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
              // Mapeia os alertas para as linhas da tabela
              alerts.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium max-w-[150px] truncate" title={alert.alert_type}>
                    {alert.alert_type}
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityColors[alert.severity.toLowerCase()] || 'secondary'}>
                      {/* Capitaliza a primeira letra da severidade */}
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{alert.src_ip || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{alert.dst_ip || "-"}</TableCell>
                  <TableCell>{alert.port ?? "-"}</TableCell>
                  <TableCell>{alert.protocol || "-"}</TableCell>
                  {/* <TableCell className="text-muted-foreground text-sm">
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleString("pt-BR") : "-"}
                  </TableCell> */}
                  <TableCell className="text-right">
                    {/* Botão para ver detalhes */}
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

       {/* Controles de Paginação (só aparecem se não for limitado e houver mais de 1 página) */}
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
                 {/* Lógica de renderização das páginas (ex: mostrar 1 ... 5 6 7 ... 10) */}
                 {(() => {
                     const pageNumbers = [];
                     const maxPagesToShow = 5; // Máximo de números de página visíveis (excluindo primeiro/último/elipses)
                     const halfMax = Math.floor(maxPagesToShow / 2);

                     if (totalPages <= maxPagesToShow + 2) { // Mostra todos se couber
                        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
                     } else {
                        pageNumbers.push(1); // Sempre mostra a primeira página
                        let startPage = Math.max(2, currentPage - halfMax);
                        let endPage = Math.min(totalPages - 1, currentPage + halfMax);

                        // Ajusta limites se perto do início/fim
                        if (currentPage <= halfMax + 1) endPage = maxPagesToShow + 1;
                        if (currentPage >= totalPages - halfMax) startPage = totalPages - maxPagesToShow;

                        if (startPage > 2) pageNumbers.push(-1); // Elipse inicial

                        for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

                        if (endPage < totalPages - 1) pageNumbers.push(-1); // Elipse final
                        pageNumbers.push(totalPages); // Sempre mostra a última página
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
             {totalItems > 0 && (
                <p className="text-xs text-muted-foreground">
                    Página {currentPage} de {totalPages} ({totalItems} {totalItems === 1 ? 'alerta' : 'alertas'} no total)
                </p>
             )}
         </div>
       )}
       {/* Caso limite seja usado e haja mais itens do que o limite */}
       {limit && totalItems > limit && (
           <p className="text-center text-sm text-muted-foreground">
              Mostrando os {limit} alertas mais recentes de {totalItems}.
           </p>
       )}
    </div>
  );
};