import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner";
import { UserPlus, Pencil, Trash2, Search, Loader2, AlertCircle, Users } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser, UserRead, UserCreate, UserUpdate } from "@/api/users";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { AccessDeniedMessage } from "../AccessDeniedMessage";
import { AxiosError } from "axios";

interface UserDisplay extends UserRead {
  role: "admin" | "user";
  status: "active" | "inactive";
  created_at_display?: string;
}

export const UsersManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDisplay | null>(null);
  const [formData, setFormData] = useState<Partial<UserCreate & UserUpdate>>({ name: "", password: "", is_active: true, is_superuser: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error, isFetching, isError } = useQuery({
    queryKey: ['users', currentPage, itemsPerPage],
    queryFn: () => getUsers(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
    select: (data) => ({
      ...data,
      items: data.items.map(user => ({
        ...user,
        role: user.is_superuser ? 'admin' : 'user',
        status: user.is_active ? 'active' : 'inactive',
        created_at_display: user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : 'N/A'
      }))
    }),
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 403) {
        console.log("Access Denied (403) for users, not retrying.");
        return false;
      }
      return failureCount < 3;
    }
  });

  const users = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      sonnerToast.error("Operação falhou", {
        description: error.response?.data?.detail || error.message || "Ocorreu um erro inesperado.",
      });
    },
  };

  const createUserMutation = useMutation({
    mutationFn: createUser,
    ...mutationOptions,
    onSuccess: (newUser) => {
      mutationOptions.onSuccess();
      sonnerToast.success("Usuário criado", {
        description: `${newUser.name} foi adicionado com sucesso.`,
      });
      setIsCreateOpen(false);
      setFormData({ name: "", password: "", is_active: true, is_superuser: false });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: UserUpdate }) => updateUser(userId, userData),
    ...mutationOptions,
    onSuccess: (_, variables) => {
      mutationOptions.onSuccess();
      sonnerToast.success("Usuário atualizado", {
        description: `As informações de ${variables.userData.name || selectedUser?.name} foram salvas.`,
      });
      setIsEditOpen(false);
      setSelectedUser(null);
      setFormData({ name: "", password: "", is_active: true, is_superuser: false });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    ...mutationOptions,
    onSuccess: (_, userId) => {
      mutationOptions.onSuccess();
      sonnerToast.error("Usuário removido", {
        description: `O usuário (ID: ${userId.substring(0, 8)}...) foi removido do sistema.`,
      });
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  });

  const handleCreate = () => {
    if (!formData.name || !formData.password) {
      sonnerToast.warning("Campos obrigatórios", { description: "Nome e senha são necessários." });
      return;
    }
    if (formData.password.length < 8) {
      sonnerToast.warning("Senha curta", { description: "A senha deve ter pelo menos 8 caracteres." });
      return;
    }
    const createData: UserCreate = {
      name: formData.name,
      password: formData.password,
      is_active: formData.is_active ?? true,
      is_superuser: formData.is_superuser ?? false,
    };
    createUserMutation.mutate(createData);
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    const updateData: UserUpdate = {
      name: formData.name !== selectedUser.name ? formData.name : undefined,
      password: formData.password ? formData.password : undefined,
      is_active: formData.is_active !== selectedUser.is_active ? formData.is_active : undefined,
      is_superuser: formData.is_superuser !== selectedUser.is_superuser ? formData.is_superuser : undefined,
    };

    if (updateData.password && updateData.password.length < 8) {
      sonnerToast.warning("Senha curta", { description: "A nova senha deve ter pelo menos 8 caracteres." });
      return;
    }

    if (Object.values(updateData).every(val => val === undefined)) {
      sonnerToast.info("Nenhuma alteração", { description: "Nenhum dado foi modificado." });
      setIsEditOpen(false);
      return;
    }

    updateUserMutation.mutate({ userId: selectedUser.id, userData: updateData });
  };

  const openEditDialog = (user: UserDisplay) => {
    setSelectedUser(user);
    setFormData({ name: user.name, password: "", is_active: user.is_active, is_superuser: user.is_superuser });
    setIsEditOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !isError) {
    return <Card><CardContent className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Carregando usuários...</span></CardContent></Card>;
  }

  if (isError && error instanceof AxiosError && error.response?.status === 403) {
    return <AccessDeniedMessage resourceName="o gerenciamento de usuários" />;
  }

  if (isError && !(error instanceof AxiosError && error.response?.status === 403)) {
    console.error("Erro ao buscar usuários:", error);
    return <Card><CardContent className="flex justify-center items-center h-60 text-destructive"><AlertCircle className="h-8 w-8 mr-2" /><span>Falha ao carregar usuários. Tente atualizar.</span></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>Criar, editar, visualizar e remover usuários</CardDescription>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" /> Novo Usuário</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>Adicione um novo usuário ao sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Nome *</Label>
                  <Input id="create-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">Senha *</Label>
                  <Input id="create-password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Mínimo 8 caracteres" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">Função</Label>
                  <select id="create-role" className="input-like-select" value={formData.is_superuser ? 'admin' : 'user'} onChange={(e) => setFormData({ ...formData, is_superuser: e.target.value === 'admin' })}>
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-md border relative w-full overflow-auto">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] hidden sm:table-cell">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    {searchTerm ? 'Nenhum usuário encontrado para "' + searchTerm + '"' : 'Nenhum usuário cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs truncate hidden sm:table-cell" title={user.id}>{user.id.substring(0, 8)}...</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={user.status === "active" ? "default" : "outline"}>
                        {user.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} disabled={updateUserMutation.isPending || deleteUserMutation.isPending}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={updateUserMutation.isPending || deleteUserMutation.isPending}
                              title={`Remover usuário ${user.name}`}
                            >
                              {deleteUserMutation.isPending && deleteUserMutation.variables === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o usuário "{user.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteUserMutation.mutate(user.id)}
                              >
                                {deleteUserMutation.isPending && deleteUserMutation.variables === user.id ? "Removendo..." : "Remover"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
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
                      <PaginationItem key={pageNum}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }} isActive={currentPage === pageNum} aria-current={currentPage === pageNum ? "page" : undefined}>{pageNum}</PaginationLink></PaginationItem>
                    )
                  ));
                })()}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            {totalItems > 0 && (
              <p className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages} ({totalItems} {totalItems === 1 ? 'usuário' : 'usuários'} no total)
              </p>
            )}
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>Atualize as informações de {selectedUser?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Nova Senha</Label>
                <Input id="edit-password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Deixe em branco para manter a atual" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Função</Label>
                <select id="edit-role" className="input-like-select" value={formData.is_superuser ? 'admin' : 'user'} onChange={(e) => setFormData({ ...formData, is_superuser: e.target.value === 'admin' })}>
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select id="edit-status" className="input-like-select" value={formData.is_active ? 'active' : 'inactive'} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleEdit} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>

      <style jsx global>{`
        .input-like-select { display: flex; height: 2.5rem; width: 100%; border-radius: 0.375rem; border: 1px solid hsl(var(--input)); background-color: hsl(var(--background)); padding-left: 0.75rem; padding-right: 2.5rem; padding-top: 0.5rem; padding-bottom: 0.5rem; font-size: 0.875rem; line-height: 1.25rem; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; }
        .input-like-select:focus { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; border-color: hsl(var(--ring)); }
      `}</style>
    </Card>
  );
};