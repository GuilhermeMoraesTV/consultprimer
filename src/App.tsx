import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/licitacoes" element={<LicitacoesPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/contratos" element={<ContratosPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
