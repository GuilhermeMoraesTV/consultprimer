import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index.tsx";
import KanbanPage from "./pages/KanbanPage.tsx";
import AgendaPage from "./pages/AgendaPage.tsx";
import LicitacoesPage from "./pages/LicitacoesPage.tsx";
import DocumentosPage from "./pages/DocumentosPage.tsx";
import ContratosPage from "./pages/ContratosPage.tsx";
import AnalyticsPage from "./pages/AnalyticsPage.tsx";
import ConfiguracoesPage from "./pages/ConfiguracoesPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/kanban" element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
              <Route path="/licitacoes" element={<ProtectedRoute><LicitacoesPage /></ProtectedRoute>} />
              <Route path="/documentos" element={<ProtectedRoute><DocumentosPage /></ProtectedRoute>} />
              <Route path="/contratos" element={<ProtectedRoute><ContratosPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
