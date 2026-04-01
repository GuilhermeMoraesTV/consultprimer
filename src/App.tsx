import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import KanbanPage from "./pages/KanbanPage.tsx";
import AgendaPage from "./pages/AgendaPage.tsx";
import EmConstrucaoPage from "./pages/EmConstrucaoPage.tsx";
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
          <Route
            path="/licitacoes"
            element={
              <EmConstrucaoPage
                titulo="Cadastro de Licitações"
                descricao="Formulário completo para cadastrar certames com busca de órgãos, upload de editais e controle de documentos."
              />
            }
          />
          <Route
            path="/documentos"
            element={
              <EmConstrucaoPage
                titulo="Gestão de Documentos (GED)"
                descricao="Repositório centralizado com semáforo de validade, visualizador de PDF integrado e download em lote."
              />
            }
          />
          <Route
            path="/contratos"
            element={
              <EmConstrucaoPage
                titulo="Contratos e Atas (SRP)"
                descricao="Gestão de Atas de Registro de Preços, controle de saldo item a item e alertas de reequilíbrio econômico."
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <EmConstrucaoPage
                titulo="Analytics e Relatórios"
                descricao="Dashboards com volume financeiro, taxa de sucesso, análise de concorrência e mapa de deságio."
              />
            }
          />
          <Route
            path="/configuracoes"
            element={
              <EmConstrucaoPage
                titulo="Configurações"
                descricao="Gerenciamento de perfis de acesso, integrações com ERP e personalização do sistema."
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
