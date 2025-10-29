// src/pages/Dashboard.tsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, AlertTriangle, Globe, Network, TrendingUp, RefreshCw, FileText, Settings, Users, Shield, Loader2, LogOut, UploadCloud // Usando UploadCloud para a aba Arquivos
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { AlertsTable } from "@/components/dashboard/AlertsTable";
import { AnalysesTable } from "@/components/dashboard/AnalysesTable";
import { ProtocolDistribution } from "@/components/dashboard/ProtocolDistribution";
import { UploadArea } from "@/components/dashboard/UploadArea";
import { HashSearch } from "@/components/dashboard/HashSearch";
import { FilesTable } from "@/components/dashboard/FilesTable"; // Importado FilesTable
import { UsersManagement } from "@/components/dashboard/UsersManagement";
import { SettingsManagement } from "@/components/dashboard/SettingsManagement";
import { CustomRules } from "@/components/dashboard/CustomRules";
import { getDashboardStats } from "@/api/stats";
import { logoutUser } from "@/api/auth";
// Import do useAuth foi removido corretamente

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Variáveis user, isAdmin, isLoadingAuth foram removidas

  // Busca dados agregados do dashboard
  const { data: statsData, isLoading: isLoadingStats, isFetching: isFetchingStats, error: errorStats, isError: isErrorStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  // Handler para atualizar
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
       queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
       queryClient.invalidateQueries({ queryKey: ['alerts'] }),
       queryClient.invalidateQueries({ queryKey: ['analyses'] }),
       queryClient.invalidateQueries({ queryKey: ['files'] }),
       queryClient.invalidateQueries({ queryKey: ['users'] }),
       queryClient.invalidateQueries({ queryKey: ['rules'] }),
       queryClient.invalidateQueries({ queryKey: ['settings'] }),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handler para Sair
  const handleLogout = () => {
     logoutUser();
  };

  // Removido loader de autenticação e guarda de !user

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
       <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <div>
                  <h1 className="text-2xl font-bold">SharpShark</h1>
                  <p className="text-xs text-muted-foreground">Sistema de Análise de Tráfego e Segurança</p>
              </div>
            </div>
            {/* Botões (sem nome de usuário) */}
           <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing || isFetchingStats} className="gap-2" title="Atualizar dados">
               <RefreshCw className={`h-4 w-4 ${(isRefreshing || isFetchingStats) ? "animate-spin" : ""}`} />
               {(isRefreshing || isFetchingStats) ? "Atualizando..." : "Atualizar"}
             </Button>
             <Button variant="outline" size="sm" className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout} title="Sair">
               <LogOut className="h-4 w-4" /> Sair
             </Button>
           </div>
         </div>
       </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Erro Stats */}
        {isErrorStats && !isLoadingStats && (
             <Card className="border-destructive/50 bg-destructive/10"><CardContent className="p-4 flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5"/><p className="text-sm font-medium">Erro ao carregar estatísticas.</p></CardContent></Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingStats ? (
             <> {/* Skeletons */}
               <Skeleton className="h-[116px] rounded-lg" /> <Skeleton className="h-[116px] rounded-lg" />
               <Skeleton className="h-[116px] rounded-lg" /> <Skeleton className="h-[116px] rounded-lg" />
             </>
          ) : (
             <> {/* StatsCards com dados */}
               <StatsCard title="Total Pacotes" value={(statsData?.totalPackets?.value ?? 0).toLocaleString()} icon={Network}/>
               <StatsCard title="Alertas" value={(statsData?.activeAlerts?.value ?? 0).toLocaleString()} icon={AlertTriangle} variant={(statsData?.activeAlerts?.value ?? 0) > 0 ? "danger" : "default"}/>
               <StatsCard title="IPs Únicos" value={(statsData?.uniqueIPs?.value ?? 0).toLocaleString()} icon={Globe}/>
               <StatsCard title="Análises" value={(statsData?.completedAnalyses?.value ?? 0).toLocaleString()} icon={Activity}/>
             </>
          )}
        </div>

        {/* Abas Principais */}
        <Tabs defaultValue="overview" className="space-y-4">
           {/* Lista de Abas (TODAS VISÍVEIS) */}
           <TabsList className="bg-card/50 border border-border/50">
             <TabsTrigger value="overview"><TrendingUp className="mr-1 h-4 w-4"/>Visão Geral</TabsTrigger>
             <TabsTrigger value="files"><UploadCloud className="mr-1 h-4 w-4"/>Arquivos</TabsTrigger> {/* Aba Arquivos */}
             <TabsTrigger value="analyses"><FileText className="mr-1 h-4 w-4"/>Análises</TabsTrigger>
             <TabsTrigger value="alerts"><AlertTriangle className="mr-1 h-4 w-4"/>Alertas</TabsTrigger>
             {/* Abas Admin SEMPRE visíveis */}
             <TabsTrigger value="users"><Users className="mr-1 h-4 w-4"/>Usuários</TabsTrigger>
             <TabsTrigger value="rules"><Shield className="mr-1 h-4 w-4"/>Regras</TabsTrigger>
             <TabsTrigger value="settings"><Settings className="mr-1 h-4 w-4"/>Configurações</TabsTrigger>
           </TabsList>

          {/* Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
             {/* Gráficos */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Tráfego</CardTitle><CardDescription>Pacotes/hora (24h)</CardDescription></CardHeader><CardContent>{isLoadingStats ? <Skeleton className="h-[300px]"/> : <TrafficChart data={statsData?.trafficLast24h ?? []} />}</CardContent></Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Protocolos</CardTitle><CardDescription>Top 5 + Outros</CardDescription></CardHeader><CardContent>{isLoadingStats ? <Skeleton className="h-[300px]"/> : <ProtocolDistribution data={statsData?.protocolDistribution ?? []} />}</CardContent></Card>
             </div>
             {/* Alertas Recentes */}
             <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Alertas Recentes</CardTitle><CardDescription>Últimas detecções</CardDescription></div><Badge variant="destructive">{isLoadingStats ? '...' : (statsData?.activeAlerts?.value ?? 0)} Reg.</Badge></div></CardHeader>
                <CardContent><AlertsTable limit={5} /></CardContent>
             </Card>
          </TabsContent>

          {/* Aba: Arquivos (Estrutura Correta) */}
           <TabsContent value="files" className="space-y-6">
              <UploadArea /> {/* Componente de Upload Manual */}
              <HashSearch /> {/* Componente de Busca por Hash/ID */}
              <FilesTable /> {/* Tabela de Listagem de Arquivos */}
           </TabsContent>

           {/* Aba: Análises */}
           <TabsContent value="analyses" className="space-y-4">
             <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
               <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Histórico de Análises</CardTitle><CardDescription>Resultados dos processamentos</CardDescription></CardHeader>
               <CardContent><AnalysesTable /></CardContent> {/* Tabela de Análises */}
             </Card>
           </TabsContent>

           {/* Aba: Alertas */}
           <TabsContent value="alerts">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Todos os Alertas</CardTitle><CardDescription>Lista completa</CardDescription></CardHeader>
                <CardContent><AlertsTable /></CardContent> {/* Tabela de Alertas */}
              </Card>
           </TabsContent>

           {/* Abas Admin SEMPRE renderizadas (controle de acesso dentro dos componentes) */}
           <TabsContent value="users"><UsersManagement /></TabsContent>
           <TabsContent value="rules"><CustomRules /></TabsContent>
           <TabsContent value="settings"><SettingsManagement /></TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;