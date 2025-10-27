// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner'; // Para notificar sobre redirect

// Função simples para verificar se o token existe
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  // Poderia adicionar validação de expiração do token aqui se necessário
  return !!token;
};

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const isAuth = isAuthenticated();

  useEffect(() => {
    if (!isAuth && location.pathname !== '/login') {
      toast.error('Acesso não autorizado', {
        description: 'Você precisa fazer login para acessar esta página.',
      });
    }
  }, [isAuth, location.pathname]);

  if (!isAuth) {
    // Redireciona para /login, mas guarda a rota que o usuário tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se autenticado, renderiza o componente filho (no nosso caso, o Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
