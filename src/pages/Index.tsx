import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Network, Activity, Lock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-8 max-w-2xl px-4">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShieldCheck className="h-20 w-20 text-primary" strokeWidth={1.5} />
              <div className="absolute inset-0 blur-2xl opacity-40 bg-primary/30" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            SharpShark
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema de Análise de Tráfego e Segurança de Rede
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
            <Network className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Análise em Tempo Real</h3>
            <p className="text-sm text-muted-foreground">
              Monitoramento contínuo do tráfego de rede
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
            <Activity className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Detecção de Ameaças</h3>
            <p className="text-sm text-muted-foreground">
              Identificação automática de atividades suspeitas
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
            <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Segurança Avançada</h3>
            <p className="text-sm text-muted-foreground">
              Proteção completa contra invasões
            </p>
          </div>
        </div>

        <div className="pt-8">
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium login-glow login-glow-hover transition-all duration-300 px-8"
          >
            Acessar Painel
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-8">
          © 2025 SharpShark — Engine local | sem envio de dados
        </p>
      </div>
    </div>
  );
};

export default Index;
