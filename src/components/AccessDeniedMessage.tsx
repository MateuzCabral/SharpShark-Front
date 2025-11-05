import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AccessDeniedMessageProps {
  resourceName?: string;
}

export const AccessDeniedMessage: React.FC<AccessDeniedMessageProps> = ({ resourceName }) => {
  const message = resourceName
    ? `Você não tem permissão para acessar ${resourceName}.`
    : 'Você não tem permissão para acessar este recurso.';

  return (
    <Card className="border-yellow-500/50 bg-yellow-500/10">
      <CardContent className="p-4 flex items-center gap-3 text-yellow-300">
        <AlertTriangle className="h-6 w-6" />
        <div className='text-left'>
           <p className="font-semibold text-yellow-200">Acesso Negado</p>
           <p className="text-sm">{message}</p>
           <p className="text-xs mt-1">Contate um administrador se precisar de acesso.</p>
        </div>
      </CardContent>
    </Card>
  );
};
