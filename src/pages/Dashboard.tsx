// src/pages/Dashboard.tsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, AlertTriangle, Globe, Network, TrendingUp, RefreshCw, Download, FileText, Settings, Users, Shield, FileUp, Loader2
} from "lucide-react"; // Removidos ícones não usados diretamente aqui
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

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Busca dados agregados do dashboard
  const { data: statsData, isLoading: isLoadingStats, isFetching: isFetchingStats, error: errorStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Invalida as queries para forçar refetch
    await queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    await queryClient.invalidateQueries({ queryKey: ['alerts'] });
    await queryClient.invalidateQueries({ queryKey: ['analyses'] });
    // setTimeout para feedback visual
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
       <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <div>
                  <h1 className="text-2xl font-bold">SharpShark</h1>
                  <p className="text-xs text-muted-foreground">
                    Sistema de Análise de Tráfego e Segurança
                  </p>
              </div>
            </div>
           <div className="flex items-center gap-2">
             <Button
               variant="outline"
               size="sm"
               onClick={handleRefresh}
               disabled={isRefreshing || isFetchingStats}
               className="gap-2"
             >
               <RefreshCw className={`h-4 w-4 ${(isRefreshing || isFetchingStats) ? "animate-spin" : ""}`} />
               {(isRefreshing || isFetchingStats) ? "Atualizando..." : "Atualizar"}
             </Button>
             <Button variant="outline" size="sm" className="gap-2" disabled>
               <Download className="h-4 w-4" />
               Exportar
             </Button>
           </div>
         </div>
       </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Exibe erro se a busca de stats falhar */}
        {errorStats && (
             <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-4 flex items-center gap-2 text-destructive">
                   <AlertTriangle className="h-5 w-5"/>
                   <p className="text-sm font-medium">Erro ao carregar estatísticas do dashboard.</p>
                </CardContent>
             </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <>
              <Skeleton className="h-[116px]" />
              <Skeleton className="h-[116px]" />
              <Skeleton className="h-[116px]" />
              <Skeleton className="h-[116px]" />
            </>
          ) : (
            <>
              <StatsCard
                title="Total de Pacotes"
                value={(statsData?.totalPackets?.value ?? 0).toLocaleString()}
                icon={Network}
              />
              <StatsCard
                title="Alertas Registrados"
                value={(statsData?.activeAlerts?.value ?? 0).toLocaleString()}
                icon={AlertTriangle}
                variant={(statsData?.activeAlerts?.value ?? 0) > 0 ? "danger" : "default"}
              />
              <StatsCard
                title="IPs Únicos Vistos"
                value={(statsData?.uniqueIPs?.value ?? 0).toLocaleString()}
                icon={Globe}
              />
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
           <TabsList className="bg-card/50 border border-border/50">
             <TabsTrigger value="overview"><TrendingUp className="mr-1 h-4 w-4"/>Visão Geral</TabsTrigger>
             <TabsTrigger value="upload"><FileUp className="mr-1 h-4 w-4"/>Upload</TabsTrigger>
             <TabsTrigger value="alerts"><AlertTriangle className="mr-1 h-4 w-4"/>Alertas</TabsTrigger>
             <TabsTrigger value="analyses"><FileText className="mr-1 h-4 w-4"/>Análises</TabsTrigger>
             <TabsTrigger value="users"><Users className="mr-1 h-4 w-4"/>Usuários</TabsTrigger>
             <TabsTrigger value="rules"><Shield className="mr-1 h-4 w-4"/>Regras</TabsTrigger>
             <TabsTrigger value="settings"><Settings className="mr-1 h-4 w-4"/>Configurações</TabsTrigger>
           </TabsList>

          {/* Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Card Gráfico de Tráfego */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Tráfego de Rede</CardTitle>
                  <CardDescription>Pacotes por hora (placeholder)</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? <Skeleton className="h-[300px] w-full" /> : <TrafficChart data={statsData?.trafficLast24h ?? []} />}
                </CardContent>
              </Card>

              {/* Card Gráfico de Protocolos */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Distribuição de Protocolos</CardTitle>
                  <CardDescription>Protocolos mais comuns (Top 5)</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? <Skeleton className="h-[300px] w-full" /> : <ProtocolDistribution data={statsData?.protocolDistribution ?? []} />}
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
                   <Badge variant="destructive">{isLoadingStats ? '...' : (statsData?.activeAlerts?.value ?? 0)} Registrados</Badge>
                </div>
              </CardHeader>
              <CardContent>
                 {/* Mostra apenas os 5 mais recentes */}
                 <AlertsTable limit={5} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Upload */}
           <TabsContent value="upload"><UploadArea /></TabsContent>

           {/* Aba: Alertas */}
           <TabsContent value="alerts">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Todos os Alertas</CardTitle>
                  <CardDescription>Lista completa de alertas detectados</CardDescription>
                </CardHeader>
                <CardContent>
                   {/* Tabela de alertas completa */}
                  <AlertsTable />
                </CardContent>
              </Card>
           </TabsContent>

           {/* Aba: Análises */}
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

           {/* Aba: Usuários */}
           <TabsContent value="users"><UsersManagement /></TabsContent>

           {/* Aba: Regras */}
           <TabsContent value="rules"><CustomRules /></TabsContent>

           {/* Aba: Configurações */}
           <TabsContent value="settings"><SettingsManagement /></TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;