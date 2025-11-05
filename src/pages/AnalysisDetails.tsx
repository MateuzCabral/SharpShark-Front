import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnalysisDetails, AnalysisRead, StatRead, IpRecordRead, getAnalysisIps } from "@/api/analyses";
import { getStatsForAnalysis } from "@/api/stats";
import { AlertsTable } from "@/components/dashboard/AlertsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Loader2, AlertCircle, FileText, Activity, Users, AlertTriangle } from "lucide-react";
import { formatUtcDateToBrazil } from "@/lib/utils";

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  completed: { variant: "default", label: "Concluída" },
  in_progress: { variant: "secondary", label: "Processando" },
  pending: { variant: "outline", label: "Pendente" },
  failed: { variant: "destructive", label: "Falhou" },
};

const StatsDisplay = ({ analysisId }: { analysisId: string }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analysisStats', analysisId],
    queryFn: () => getStatsForAnalysis(analysisId),
  });

  const groupedStats = (stats || []).reduce((acc, stat) => {
    if (!acc[stat.category]) {
      acc[stat.category] = [];
    }
    acc[stat.category].push(stat);
    return acc;
  }, {} as Record<string, StatRead[]>);

  if (groupedStats.protocol) {
    groupedStats.protocol.sort((a, b) => b.count - a.count);
  }
  if (groupedStats.port) {
    groupedStats.port.sort((a, b) => b.count - a.count);
  }

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }
  
  if (!stats || stats.length === 0) {
     return <p className="text-sm text-muted-foreground p-4">Nenhuma estatística detalhada foi registrada para esta análise.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(groupedStats).map(([category, items]) => (
        <Card key={category} className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg capitalize flex items-center gap-2">
               <Activity className="h-5 w-5 text-primary"/> {category === 'protocol' ? 'Protocolos' : category === 'port' ? 'Portas' : category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Contagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium">{stat.key}</TableCell>
                      <TableCell className="text-right font-mono">{stat.count.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const IpDisplay = ({ analysisId }: { analysisId: string }) => {
  
  const { data: srcIpData, isLoading: isLoadingSrc } = useQuery({
    queryKey: ['analysisIps', analysisId, 'SRC'],
    queryFn: () => getAnalysisIps(analysisId, "SRC", 1, 10),
  });

  const { data: dstIpData, isLoading: isLoadingDst } = useQuery({
    queryKey: ['analysisIps', analysisId, 'DST'],
    queryFn: () => getAnalysisIps(analysisId, "DST", 1, 10),
  });

  const srcIps = srcIpData?.items ?? [];
  const dstIps = dstIpData?.items ?? [];

  if (isLoadingSrc || isLoadingDst) {
    return (
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
       </div>
    );
  }
  
  if (srcIps.length === 0 && dstIps.length === 0) {
     return <p className="text-sm text-muted-foreground p-4">Nenhum registro de IP encontrado.</p>
  }
  
  const renderIpTable = (ipList: IpRecordRead[], title: string, isLoading: boolean) => (
     <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">{title} (Top {ipList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <Skeleton className="h-48 w-full" />
          ) : ipList.length === 0 ? (
             <p className="text-sm text-muted-foreground h-48 flex items-center justify-center">Nenhum IP encontrado.</p>
          ) : (
            <ScrollArea className="h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endereço IP</TableHead>
                    <TableHead className="text-right">Contagem (Pacotes)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipList.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono text-sm">{ip.ip}</TableCell>
                      <TableCell className="text-right font-mono">{ip.count.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
     </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderIpTable(srcIps, "Top 10 IPs de Origem", isLoadingSrc)}
      {renderIpTable(dstIps, "Top 10 IPs de Destino", isLoadingDst)}
    </div>
  );
};

const AnalysisDetails = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysisDetails', analysisId],
    queryFn: () => getAnalysisDetails(analysisId!),
    enabled: !!analysisId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 flex flex-col items-center gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="font-medium">Falha ao carregar análise</p>
            <p className="text-sm">A análise com ID "{analysisId}" não foi encontrada ou ocorreu um erro.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold truncate" title={analysis.file?.file_name}>
            {analysis.file?.file_name || "Detalhes da Análise"}
          </h1>
          <code className="text-xs text-muted-foreground">{analysis.id}</code>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Sumário da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
             <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">Status</p>
                <Badge variant={statusConfig[analysis.status]?.variant || 'secondary'}>
                  {statusConfig[analysis.status]?.label || analysis.status}
                </Badge>
             </div>
             <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">Duração</p>
                <p className="font-medium">{analysis.duration.toFixed(2)} seg</p>
             </div>
             <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">Pacotes</p>
                <p className="font-medium">{analysis.total_packets.toLocaleString()}</p>
             </div>
             <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">Streams Salvos</p>
                <p className="font-medium">{analysis.total_streams.toLocaleString()}</p>
             </div>
             <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">Tamanho</p>
                <p className="font-medium">{analysis.file?.file_size ? `${analysis.file.file_size.toFixed(1)} MB` : '-'}</p>
             </div>
             <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">Analisado em</p>
                <p className="font-medium">{formatUtcDateToBrazil(analysis.analyzed_at)}</p>
             </div>
             <div className="col-span-2">
                <p className="text-muted-foreground text-xs font-medium uppercase">Hash (SHA256)</p>
                <p className="font-mono text-xs truncate">{analysis.file?.file_hash}</p>
             </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Estatísticas da Análise</CardTitle>
          <CardDescription>Protocolos, Portas e outros dados agregados desta análise.</CardDescription>
        </CardHeader>
        <CardContent>
            <StatsDisplay analysisId={analysis.id} />
        </CardContent>
      </Card>
      
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Endereços IP</CardTitle>
          <CardDescription>Top 10 IPs de origem e destino encontrados nesta análise.</CardDescription>
        </CardHeader>
        <CardContent>
            <IpDisplay analysisId={analysis.id} />
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Alertas da Análise</CardTitle>
          <CardDescription>Todos os alertas gerados especificamente para esta análise.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertsTable analysisId={analysis.id} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisDetails;

