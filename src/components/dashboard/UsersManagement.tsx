// src/componentes/dashboard/UsersManagement.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner"; // Usando sonner
import { UserPlus, Pencil, Trash2, Search, Loader2, AlertCircle, Users } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser, UserRead, UserCreate, UserUpdate } from "@/api/users"; // Integração
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"; // Integração

// Mapeamento de UserRead para a interface interna (simplificado)
interface UserDisplay extends UserRead {
  role: "admin" | "user";
  status: "active" | "inactive";
  created_at_display?: string; // Para data formatada
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

  // Integração: Fetch users com React Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['users', currentPage, itemsPerPage],
    queryFn: () => getUsers(currentPage, itemsPerPage),
    placeholderData: (previousData) => previousData,
    // Mapeia os dados da API para o formato de exibição
    select: (data) => ({
      ...data,
      items: data.items.map(user => ({
        ...user,
        role: user.is_superuser ? 'admin' : 'user',
        status: user.is_active ? 'active' : 'inactive',
        created_at_display: user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : 'N/A' // Ajustar se backend incluir created_at
      }))
    })
  });

  const users = data?.items ?? [];
  const totalPages = data?.pages ?? 0;
  const totalItems = data?.total ?? 0;

  // Integração: Mutações para Create, Update, Delete
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalida o cache para buscar a lista atualizada
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
       mutationOptions.onSuccess(); // Chama o onSuccess base
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
     onSuccess: (_, variables) => { // O primeiro argumento é a resposta, o segundo são as variáveis enviadas
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
     onSuccess: (_, userId) => { // O segundo argumento é o ID do usuário deletado
        mutationOptions.onSuccess();
        sonnerToast.error("Usuário removido", { // Usando error variant para delete
           description: `O usuário (ID: ${userId}) foi removido do sistema.`,
        });
     }
  });

  // Handlers
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
      password: formData.password ? formData.password : undefined, // Envia só se digitou nova senha
      is_active: formData.is_active !== selectedUser.is_active ? formData.is_active : undefined,
      is_superuser: formData.is_superuser !== selectedUser.is_superuser ? formData.is_superuser : undefined,
    };

     // Verifica se a nova senha (se fornecida) é válida
     if (updateData.password && updateData.password.length < 8) {
        sonnerToast.warning("Senha curta", { description: "A nova senha deve ter pelo menos 8 caracteres." });
        return;
     }

     // Verifica se há algo para atualizar
     if (Object.values(updateData).every(val => val === undefined)) {
        sonnerToast.info("Nenhuma alteração", { description: "Nenhum dado foi modificado." });
        setIsEditOpen(false);
        return;
     }

    updateUserMutation.mutate({ userId: selectedUser.id, userData: updateData });
  };

  const handleDelete = (user: UserDisplay) => {
    // Adicionar confirmação
    if (window.confirm(`Tem certeza que deseja remover o usuário ${user.name}? Esta ação não pode ser desfeita.`)) {
      deleteUserMutation.mutate(user.id);
    }
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

  // Filtro local (a API de usuários não tem filtro por nome no código fornecido)
   const filteredUsers = users.filter(
     (user) =>
       user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.id.toLowerCase().includes(searchTerm.toLowerCase())
   );

  // Loading e Erro
  if (isLoading && !data) {
    return <Card><CardContent className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Carregando usuários...</span></CardContent></Card>;
  }
  if (error) {
     return <Card><CardContent className="flex justify-center items-center h-60 text-destructive"><AlertCircle className="h-8 w-8 mr-2" /><span>Falha ao carregar usuários.</span></CardContent></Card>;
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
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              {/* ... Conteúdo do Dialog de Criação ... */}
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
                 {/* Campo 'is_active' geralmente não é definido na criação, padrão é true */}
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

        <div className="rounded-md border relative">
          {isFetching && ( // Indicador de refresh
              <div className="absolute inset-0 bg-background/50 flex justify-center items-center z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                {/* Ajustar colunas conforme UserRead */}
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Criado em</TableHead> */} {/* Adicionar se backend incluir */}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    {isLoading ? "Carregando..." : "Nenhum usuário encontrado"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs w-[100px] truncate" title={user.id}>{user.id.substring(0,8)}...</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "outline"}>
                        {user.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>{user.created_at_display || "-"}</TableCell> */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} disabled={updateUserMutation.isPending || deleteUserMutation.isPending}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user)} disabled={updateUserMutation.isPending || deleteUserMutation.isPending}>
                           {deleteUserMutation.isPending && deleteUserMutation.variables === user.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
           <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}/>
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => {
                       const pageNum = i + 1;
                       if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                          return <PaginationItem key={pageNum}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }} isActive={currentPage === pageNum}>{pageNum}</PaginationLink></PaginationItem>;
                       } else if (Math.abs(pageNum - currentPage) === 2) {
                          return <PaginationItem key={`ellipsis-${pageNum}`}><PaginationEllipsis /></PaginationItem>;
                       }
                       return null;
                  })}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}/>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="text-center text-sm text-muted-foreground mt-2">
                 Página {currentPage} de {totalPages} ({totalItems} usuários)
              </p>
           </div>
        )}

        {/* Dialog de Edição */}
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

      {/* Estilo para <select> parecer com <Input> */}
       <style jsx global>{`
         .input-like-select {
             display: flex;
             height: 2.5rem; /* h-10 */
             width: 100%;
             border-radius: 0.375rem; /* rounded-md */
             border: 1px solid hsl(var(--input));
             background-color: hsl(var(--background));
             padding-left: 0.75rem; /* px-3 */
             padding-right: 0.75rem; /* px-3 */
             padding-top: 0.5rem; /* py-2 */
             padding-bottom: 0.5rem; /* py-2 */
             font-size: 0.875rem; /* text-sm */
             line-height: 1.25rem;
             outline: none; /* focus-visible:outline-none */
         }
         .input-like-select:focus {
              outline: 2px solid hsl(var(--ring));
              outline-offset: 2px;
         }
        `}</style>
    </Card>
  );
};