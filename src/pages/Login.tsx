import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/api/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !password) {
      toast.error("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    try {
      const res = await loginUser( username, password );
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro no login:", error);
      const msg = error.response?.data?.detail || "Falha ao autenticar. Verifique suas credenciais.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <ShieldCheck className="h-16 w-16 text-primary" strokeWidth={1.5} />
              <div className="absolute inset-0 blur-xl opacity-50 bg-primary/30" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            SharpShark
          </h1>
          <p className="text-muted-foreground text-sm">
            Sistema de Análise de Tráfego e Segurança de Rede
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              Acesse sua conta
            </CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border/50 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border/50 focus:border-primary transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium login-glow login-glow-hover transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 SharpShark — Engine local | sem envio de dados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
