import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
