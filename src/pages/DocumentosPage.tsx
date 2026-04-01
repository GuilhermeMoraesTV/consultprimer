// === Página GED - Gestão Eletrônica de Documentos ===
// Repositório centralizado com semáforo de validade

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { DOCUMENTOS_MOCK } from '@/data/mockData';
import { Documento, TIPO_DOCUMENTO_LABELS } from '@/types/licitacao';
import { formatarData, diasRestantes } from '@/lib/formatters';
import {
  FolderOpen,
  Search,
  Upload,
  FileText,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Package,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

/** Ícone e cor do semáforo de validade */
function SemaforoValidade({ doc }: { doc: Documento }) {
  if (!doc.dataValidade) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2 className="w-3.5 h-3.5" /> Sem vencimento
      </span>
    );
  }

  const dias = diasRestantes(doc.dataValidade);

  if (dias < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-status-pendente font-semibold">
        <XCircle className="w-3.5 h-3.5" /> Vencido há {Math.abs(dias)} dias
      </span>
    );
  }

  if (dias <= 30) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-status-analise font-semibold">
        <AlertTriangle className="w-3.5 h-3.5" /> Vence em {dias} dias
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-status-ganha font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> Válido ({dias} dias)
    </span>
  );
}

/** Visualizador de PDF simulado */
function VisualizadorPDF({ doc, onClose }: { doc: Documento; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-card border-l border-border shadow-2xl animate-slide-in flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">{doc.nome}</h3>
              <p className="text-xs text-muted-foreground">
                {TIPO_DOCUMENTO_LABELS[doc.tipo]} • {(doc.tamanhoKb / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> Baixar
            </Button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Simulação do visualizador */}
        <div className="flex-1 flex items-center justify-center bg-muted/50 p-8">
          <div className="bg-card rounded-xl shadow-lg p-12 max-w-md text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-bold text-foreground mb-2">Visualizador de PDF</h4>
            <p className="text-sm text-muted-foreground mb-4">
              O documento será exibido aqui quando conectado ao Lovable Cloud com Supabase Storage.
            </p>
            <SemaforoValidade doc={doc} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentosPage() {
  const [documentos] = useState<Documento[]>(DOCUMENTOS_MOCK);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [docVisualizar, setDocVisualizar] = useState<Documento | null>(null);
  const { toast } = useToast();

  /** Documentos filtrados */
  const filtrados = useMemo(() => {
    return documentos.filter((d) => {
      const matchBusca = !busca || d.nome.toLowerCase().includes(busca.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || d.tipo === filtroTipo;
      const matchStatus = filtroStatus === 'todos' || d.status === filtroStatus;
      return matchBusca && matchTipo && matchStatus;
    });
  }, [documentos, busca, filtroTipo, filtroStatus]);

  /** Contadores por status */
  const contadores = useMemo(() => ({
    total: documentos.length,
    ativos: documentos.filter((d) => d.status === 'ativo').length,
    proximos: documentos.filter((d) => d.status === 'proximo_vencer').length,
    vencidos: documentos.filter((d) => d.status === 'vencido').length,
  }), [documentos]);

  /** Certidões que precisam de atenção */
  const certidoesAlerta = documentos.filter(
    (d) => d.dataValidade && (d.status === 'vencido' || d.status === 'proximo_vencer')
  );

  const handleDownloadZip = () => {
    toast({
      title: '📦 Download em Lote',
      description: 'Pacote ZIP com todos os documentos aprovados será gerado quando conectado ao Cloud.',
    });
  };

  return (
    <AppLayout titulo="Gestão de Documentos (GED)" subtitulo="Repositório centralizado com controle de validade">
      {/* Cards resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{contadores.total}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-status-ganha" />
            <span className="text-xs text-muted-foreground font-medium">Válidos</span>
          </div>
          <p className="text-2xl font-bold text-status-ganha">{contadores.ativos}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-status-analise" />
            <span className="text-xs text-muted-foreground font-medium">Próx. Vencer</span>
          </div>
          <p className="text-2xl font-bold text-status-analise">{contadores.proximos}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-status-pendente" />
            <span className="text-xs text-muted-foreground font-medium">Vencidos</span>
          </div>
          <p className="text-2xl font-bold text-status-pendente">{contadores.vencidos}</p>
        </div>
      </div>

      {/* Alertas de certidões */}
      {certidoesAlerta.length > 0 && (
        <div className="bg-status-pendente/5 border border-status-pendente/20 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-status-pendente" />
            <h3 className="text-sm font-bold text-status-pendente">Certidões que precisam de atenção</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {certidoesAlerta.map((d) => (
              <button
                key={d.id}
                onClick={() => setDocVisualizar(d)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:shadow-sm',
                  d.status === 'vencido'
                    ? 'bg-status-pendente/10 border-status-pendente/30 text-status-pendente'
                    : 'bg-status-analise/10 border-status-analise/30 text-status-analise'
                )}
              >
                {d.status === 'vencido' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {TIPO_DOCUMENTO_LABELS[d.tipo]}
                {d.dataValidade && ` — ${formatarData(d.dataValidade)}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar documento..." className="pl-9" />
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              {Object.entries(TIPO_DOCUMENTO_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Válidos</SelectItem>
              <SelectItem value="proximo_vencer">Próx. Vencer</SelectItem>
              <SelectItem value="vencido">Vencidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadZip}>
            <Package className="w-4 h-4" /> Baixar Pacote ZIP
          </Button>
          <Button size="sm" className="gap-1.5">
            <Upload className="w-4 h-4" /> Upload
          </Button>
        </div>
      </div>

      {/* Área de drag & drop */}
      <div className="border-2 border-dashed border-border rounded-xl p-6 mb-5 text-center hover:border-primary/40 transition-colors cursor-pointer bg-card">
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground">Arraste documentos aqui ou clique para enviar</p>
        <p className="text-xs text-muted-foreground">PDF, DOC, XLS • Máx 20MB por arquivo</p>
      </div>

      {/* Lista de documentos */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {filtrados.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer group"
              onClick={() => setDocVisualizar(doc)}
            >
              {/* Ícone */}
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                doc.status === 'vencido' ? 'bg-status-pendente/10' :
                doc.status === 'proximo_vencer' ? 'bg-status-analise/10' : 'bg-primary/10'
              )}>
                <FileText className={cn(
                  'w-5 h-5',
                  doc.status === 'vencido' ? 'text-status-pendente' :
                  doc.status === 'proximo_vencer' ? 'text-status-analise' : 'text-primary'
                )} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{doc.nome}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">{TIPO_DOCUMENTO_LABELS[doc.tipo]}</span>
                  <span className="text-xs text-muted-foreground">{(doc.tamanhoKb / 1024).toFixed(1)} MB</span>
                  <span className="text-xs text-muted-foreground">Enviado em {formatarData(doc.dataUpload)}</span>
                </div>
              </div>

              {/* Semáforo */}
              <SemaforoValidade doc={doc} />

              {/* Ações */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded hover:bg-secondary" onClick={(e) => { e.stopPropagation(); setDocVisualizar(doc); }}>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-1.5 rounded hover:bg-secondary">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum documento encontrado</p>
          </div>
        )}
      </div>

      {/* Visualizador lateral */}
      {docVisualizar && (
        <VisualizadorPDF doc={docVisualizar} onClose={() => setDocVisualizar(null)} />
      )}
    </AppLayout>
  );
}
