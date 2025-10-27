import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  Globe,
  Shield,
  TrendingUp,
  FileText,
  Download,
  RefreshCw,
  Network,
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

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
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
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Pacotes"
            value="1,234,567"
            change="+12.5%"
            icon={Network}
            trend="up"
          />
          <StatsCard
            title="Alertas Ativos"
            value="23"
            change="+3"
            icon={AlertTriangle}
            trend="up"
            variant="danger"
          />
          <StatsCard
            title="IPs Únicos"
            value="892"
            change="-5.2%"
            icon={Globe}
            trend="down"
          />
          <StatsCard
            title="Análises Completas"
            value="156"
            change="+8"
            icon={Activity}
            trend="up"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="analyses">Análises</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Tráfego de Rede
                  </CardTitle>
                  <CardDescription>Últimas 24 horas</CardDescription>
                </CardHeader>
                <CardContent>
                  <TrafficChart />
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Distribuição de Protocolos
                  </CardTitle>
                  <CardDescription>Por tipo de tráfego</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProtocolDistribution />
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
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
                  <Badge variant="destructive">23 Ativos</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <AlertsTable limit={5} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <UploadArea />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Todos os Alertas
                </CardTitle>
                <CardDescription>
                  Detecção de ataques e anomalias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertsTable />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analyses Tab */}
          <TabsContent value="analyses" className="space-y-4">
            <HashSearch />
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Histórico de Análises
                </CardTitle>
                <CardDescription>
                  Arquivos PCAP processados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalysesTable />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <CustomRules />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
