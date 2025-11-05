import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Trash2, Loader2, AlertCircle, FileText, Info } from "lucide-react";
import { getFiles, deleteFileById, FileRead } from "../../api/files";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "../../components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast as sonnerToast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import { formatUtcDateToBrazil } from "../../lib/utils";

export const FilesTable = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [detailFile, setDetailFile] = useState<FileRead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading, error, isFetching, isError } = useQuery({
    queryKey: ['files', currentPage, itemsPerPage],
    queryFn: () => getFiles(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
  });

  const files = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  const deleteFileMutation = useMutation({
      mutationFn: deleteFileById,
      onSuccess: (_, fileId) => {
        sonnerToast.success("Arquivo removido", { description: `Arquivo (ID: ${fileId.substring(0,8)}...) e análise removidos.` });
        queryClient.invalidateQueries({ queryKey: ['files'] });
        queryClient.invalidateQueries({ queryKey: ['analyses'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        if (files.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      },
      onError: (error: any, fileId) => {
        sonnerToast.error("Falha ao remover", { description: error.response?.data?.detail || `Erro ao remover arquivo (ID: ${fileId.substring(0,8)}...).` });
      },
      onSettled: () => { setPendingDeleteId(null); }
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleDeleteConfirm = (fileId: string) => {
      setPendingDeleteId(fileId);
      deleteFileMutation.mutate(fileId);
  };

  const handleViewDetails = (file: FileRead) => {
      setDetailFile(file);
      setIsDetailOpen(true);
  };

  const LoadingCard = () => (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Arquivos Enviados</CardTitle>
              <CardDescription>Lista de todos os arquivos .pcap/.pcapng que foram enviados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
          </CardContent>
      </Card>
  );

  const ErrorCard = () => (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Arquivos Enviados</CardTitle>
              <CardDescription>Lista de todos os arquivos .pcap/.pcapng que foram enviados.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-40 text-destructive">
              <AlertCircle className="h-8 w-8 mr-2" /><span>Falha ao carregar arquivos. Tente atualizar.</span>
          </CardContent>
      </Card>
  );

  if (isLoading && !data) return <LoadingCard />;
  if (isError) return <ErrorCard />;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Arquivos Enviados</CardTitle>
        <CardDescription>Lista de arquivos .pcap/.pcapng enviados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Arquivo</TableHead>
                  <TableHead className="w-[100px] hidden md:table-cell">Tamanho</TableHead>
                  <TableHead className="w-[180px] hidden md:table-cell">Data Upload (SP)</TableHead>
                  <TableHead className="w-[150px] hidden md:table-cell">Hash (Início)</TableHead>
                  <TableHead className="text-right w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Nenhum arquivo encontrado.</TableCell></TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium max-w-[250px] truncate" title={file.file_name}>{file.file_name}</TableCell>
                      <TableCell className="hidden md:table-cell">{file.file_size.toFixed(1)} MB</TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden md:table-cell">{formatUtcDateToBrazil(file.uploaded_at)}</TableCell>
                      <TableCell className="font-mono text-xs hidden md:table-cell" title={file.file_hash}>{file.file_hash.substring(0, 12)}...</TableCell>
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon" title="Ver Detalhes do Arquivo" onClick={() => handleViewDetails(file)}>
                              <Info className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Remover Arquivo e Análise" disabled={deleteFileMutation.isPending}>
                                  {deleteFileMutation.isPending && pendingDeleteId === file.id ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Trash2 className="h-4 w-4 text-destructive" />)}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Confirmar Remoção</AlertDialogTitle><AlertDialogDescription>Remover <span className="font-medium">{file.file_name}</span>? <br/><span className="font-bold text-destructive">A análise associada também será removida.</span></AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteConfirm(file.id)} className="bg-destructive hover:bg-destructive/90">{deleteFileMutation.isPending && pendingDeleteId === file.id ? "Removendo..." : "Remover"}</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
           <div className="flex flex-col items-center gap-2">
             <Pagination>
               <PaginationContent>
                 <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}/></PaginationItem>
                 {(() => { const pN = []; const maxP = 5; const halfM = Math.floor(maxP / 2); if (totalPages <= maxP + 2) { for (let i = 1; i <= totalPages; i++) pN.push(i); } else { pN.push(1); let sP = Math.max(2, currentPage - halfM); let eP = Math.min(totalPages - 1, currentPage + halfM); if (currentPage <= halfM + 1) eP = maxP + 1; if (currentPage >= totalPages - halfM) sP = totalPages - maxP; if (sP > 2) pN.push(-1); for (let i = sP; i <= eP; i++) pN.push(i); if (eP < totalPages - 1) pN.push(-1); pN.push(totalPages); } return pN.map((p, i) => ( p === -1 ? (<PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>) : (<PaginationItem key={p}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(p); }} isActive={currentPage === p} aria-current={currentPage === p ? "page" : undefined}>{p}</PaginationLink></PaginationItem>) ));})()}
                 <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}/></PaginationItem>
               </PaginationContent>
             </Pagination>
             {totalItems > 0 && ( <p className="text-xs text-muted-foreground"> Página {currentPage} de {totalPages} ({totalItems} {totalItems === 1 ? 'arquivo' : 'arquivos'} no total) </p> )}
           </div>
        )}

        <Dialog open={isDetailOpen && !!detailFile} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Detalhes do Arquivo</DialogTitle><DialogDescription>Informações sobre o arquivo enviado.</DialogDescription></DialogHeader>
              {detailFile && (
                  <div className="space-y-3 py-4 text-sm">
                      <div><span className="font-medium text-muted-foreground w-24 inline-block">Nome:</span> {detailFile.file_name}</div>
                      <div><span className="font-medium text-muted-foreground w-24 inline-block">ID:</span> <code className="text-xs">{detailFile.id}</code></div>
                      <div><span className="font-medium text-muted-foreground w-24 inline-block">Tamanho:</span> {detailFile.file_size.toFixed(2)} MB</div>
                      <div><span className="font-medium text-muted-foreground w-24 inline-block">Upload:</span> {formatUtcDateToBrazil(detailFile.uploaded_at)} (SP)</div>
                      <div><span className="font-medium text-muted-foreground w-24 inline-block">Usuário ID:</span> <code className="text-xs">{detailFile.user_id}</code></div>
                      <div className="pt-2"><span className="font-medium text-muted-foreground w-24 inline-block">Hash SHA256:</span> <code className="text-xs break-all">{detailFile.file_hash}</code></div>
                  </div>
              )}
              <DialogFooter><DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

