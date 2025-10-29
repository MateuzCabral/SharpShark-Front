// src/pages/Dashboard.tsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton
import {
  Activity, AlertTriangle, Globe, Network, TrendingUp, RefreshCw, FileText, Settings, Users, Shield, FileUp, Loader2, LogOut
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { AlertsTable } from "@/components/dashboard/AlertsTable";
import { AnalysesTable } from "@/components/dashboard/AnalysesTable";
import { ProtocolDistribution } from "@/components/dashboard/ProtocolDistribution";
import { UploadArea } from "@/components/dashboard/UploadArea";
import { HashSearch } from "@/components/dashboard/HashSearch";
import { UsersManagement } from "@/components/dashboard/UsersManagement";
import { SettingsManagement } from "@/components/dashboard/SettingsManagement";
import { CustomRules } from "@/components/dashboard/CustomRules";
import { getDashboardStats } from "@/api/stats"; // Integração
import { logoutUser } from "@/api/auth"; // Importar logoutUser

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Busca dados agregados do dashboard usando React Query
  const { data: statsData, isLoading: isLoadingStats, isFetching: isFetchingStats, error: errorStats, isError: isErrorStats } = useQuery({
    queryKey: ['dashboardStats'], // Chave única para esta query
    queryFn: getDashboardStats, // Função que busca os dados
    // staleTime: 5 * 60 * 1000, // Opcional: manter dados frescos por 5 min
    // refetchInterval: 60 * 1000, // Opcional: buscar automaticamente a cada minuto
  });

  // Handler para o botão de atualizar
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Invalida as queries relevantes para forçar um refetch
    // invalidateQueries retorna uma Promise, podemos esperar por elas se necessário
    await Promise.all([
       queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
       queryClient.invalidateQueries({ queryKey: ['alerts'] }), // Atualiza tabela de alertas recentes também
       queryClient.invalidateQueries({ queryKey: ['analyses'] }) // Atualiza tabela de análises recentes se houver
    ]);
    // Pequeno delay para feedback visual, mesmo que as queries terminem rápido
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handler para o botão de Sair
  const handleLogout = () => {
     logoutUser(); // Chama a função que remove o token e força reload/redirect
  };

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
                  <p className="text-xs text-muted-foreground">
                    Sistema de Análise de Tráfego e Segurança
                  </p>
              </div>
            </div>
            {/* Botões de Ação */}
           <div className="flex items-center gap-2">
             <Button
               variant="outline"
               size="sm"
               onClick={handleRefresh}
               // Desabilita enquanto estiver atualizando ou buscando dados iniciais dos stats
               disabled={isRefreshing || isFetchingStats}
               className="gap-2"
               title="Atualizar dados do dashboard"
             >
               <RefreshCw className={`h-4 w-4 ${(isRefreshing || isFetchingStats) ? "animate-spin" : ""}`} />
               {(isRefreshing || isFetchingStats) ? "Atualizando..." : "Atualizar"}
             </Button>
             <Button
               variant="outline"
               size="sm"
               className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive" // Estilo Destructive
               onClick={handleLogout} // Chama a função de logout
               title="Sair do sistema"
             >
               <LogOut className="h-4 w-4" />
               Sair
             </Button>
           </div>
         </div>
       </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Mensagem de Erro (se a busca de stats falhar) */}
        {isErrorStats && !isLoadingStats && ( // Mostra erro apenas se não estiver no loading inicial
             <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-4 flex items-center gap-2 text-destructive">
                   <AlertTriangle className="h-5 w-5"/>
                   <p className="text-sm font-medium">Erro ao carregar estatísticas do dashboard. Tente atualizar.</p>
                </CardContent>
             </Card>
        )}

        {/* Stats Cards (com Skeletons durante o loading) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <>
              <Skeleton className="h-[116px] rounded-lg" />
              <Skeleton className="h-[116px] rounded-lg" />
              <Skeleton className="h-[116px] rounded-lg" />
              <Skeleton className="h-[116px] rounded-lg" />
            </>
          ) : (
            <>
              {/* Card Total de Pacotes */}
              <StatsCard
                title="Total de Pacotes (Análises)"
                value={(statsData?.totalPackets?.value ?? 0).toLocaleString()}
                icon={Network}
                // change e trend podem ser adicionados se o backend calcular a variação
              />
              {/* Card Alertas Registrados */}
              <StatsCard
                title="Alertas Registrados"
                value={(statsData?.activeAlerts?.value ?? 0).toLocaleString()}
                icon={AlertTriangle}
                variant={(statsData?.activeAlerts?.value ?? 0) > 0 ? "danger" : "default"}
              />
              {/* Card IPs Únicos */}
              <StatsCard
                title="IPs Únicos Vistos"
                value={(statsData?.uniqueIPs?.value ?? 0).toLocaleString()}
                icon={Globe}
              />
              {/* Card Análises Concluídas */}
              <StatsCard
                title="Análises Concluídas"
                value={(statsData?.completedAnalyses?.value ?? 0).toLocaleString()}
                icon={Activity}
              />
            </>
          )}
        </div>

        {/* Abas Principais */}
        <Tabs defaultValue="overview" className="space-y-4">
           {/* Lista de Abas com Ícones */}
           <TabsList className="bg-card/50 border border-border/50">
             <TabsTrigger value="overview"><TrendingUp className="mr-1 h-4 w-4"/>Visão Geral</TabsTrigger>
             <TabsTrigger value="upload"><FileUp className="mr-1 h-4 w-4"/>Upload</TabsTrigger>
             <TabsTrigger value="alerts"><AlertTriangle className="mr-1 h-4 w-4"/>Alertas</TabsTrigger>
             <TabsTrigger value="analyses"><FileText className="mr-1 h-4 w-4"/>Análises</TabsTrigger>
             {/* Condicionalmente renderiza abas de admin se necessário */}
             {/* Exemplo: {isAdmin && <TabsTrigger value="users">...</TabsTrigger>} */}
             <TabsTrigger value="users"><Users className="mr-1 h-4 w-4"/>Usuários</TabsTrigger>
             <TabsTrigger value="rules"><Shield className="mr-1 h-4 w-4"/>Regras</TabsTrigger>
             <TabsTrigger value="settings"><Settings className="mr-1 h-4 w-4"/>Configurações</TabsTrigger>
           </TabsList>

          {/* Conteúdo Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Card Gráfico de Tráfego */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Tráfego de Rede</CardTitle>
                  <CardDescription>Pacotes por hora (últimas 24h)</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Passa os dados buscados para o gráfico, ou array vazio durante loading/erro */}
                  {isLoadingStats ? <Skeleton className="h-[300px] w-full rounded-md" /> : <TrafficChart data={statsData?.trafficLast24h ?? []} />}
                </CardContent>
              </Card>

              {/* Card Gráfico de Protocolos */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Distribuição de Protocolos</CardTitle>
                  <CardDescription>Protocolos mais comuns (Top 5 + Outros)</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Passa os dados buscados para o gráfico, ou array vazio */}
                  {isLoadingStats ? <Skeleton className="h-[300px] w-full rounded-md" /> : <ProtocolDistribution data={statsData?.protocolDistribution ?? []} />}
                </CardContent>
              </Card>
            </div>

            {/* Card Alertas Recentes */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Alertas Recentes
                        </CardTitle>
                        <CardDescription>Ameaças detectadas recentemente</CardDescription>
                    </div>
                   {/* Mostra contagem de alertas do dashboard */}
                   <Badge variant="destructive">{isLoadingStats ? '...' : (statsData?.activeAlerts?.value ?? 0)} Registrados</Badge>
                </div>
              </CardHeader>
              <CardContent>
                 {/* Mostra apenas os 5 mais recentes (limitado via prop) */}
                 <AlertsTable limit={5} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo Outras Abas (Renderiza os componentes correspondentes) */}
           <TabsContent value="upload"><UploadArea /></TabsContent>
           <TabsContent value="alerts">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Todos os Alertas</CardTitle>
                  <CardDescription>Lista completa de alertas detectados</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertsTable /> {/* Tabela de alertas completa */}
                </CardContent>
              </Card>
           </TabsContent>
           <TabsContent value="analyses" className="space-y-4">
             <HashSearch />
             <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Histórico de Análises</CardTitle>
                  <CardDescription>Arquivos PCAP processados e seus status</CardDescription>
               </CardHeader>
               <CardContent>
                 <AnalysesTable />
               </CardContent>
             </Card>
           </TabsContent>
           {/* Renderiza componentes protegidos */}
           <TabsContent value="users"><UsersManagement /></TabsContent>
           <TabsContent value="rules"><CustomRules /></TabsContent>
           <TabsContent value="settings"><SettingsManagement /></TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;