// src/App.tsx
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// --- INÍCIO DA ALTERAÇÃO ---
// 1. Importar a nova página de detalhes
import AnalysisDetails from "./pages/AnalysisDetails";
// --- FIM DA ALTERAÇÃO ---

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          {/* Rota do Dashboard agora protegida */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* --- INÍCIO DA ALTERAÇÃO --- */}
            {/* 2. Adicionar a nova rota de detalhes */}
            <Route path="/analysis/:analysisId" element={<AnalysisDetails />} />
            {/* --- FIM DA ALTERAÇÃO --- */}
            
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
