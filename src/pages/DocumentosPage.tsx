import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TIPO_DOCUMENTO_LABELS, type TipoDocumento } from '@/types/licitacao';
import { formatarData, diasRestantes } from '@/lib/formatters';
import {
  FolderOpen, Search, Upload, FileText, Eye, Download, AlertTriangle,
  CheckCircle2, Clock, XCircle, Package, X, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DocRow {
  id: string;
  nome: string;
  tipo: string;
  arquivo_url: string;
  tamanho_kb: number | null;
  data_validade: string | null;
  status: string | null;
  criado_em: string | null;
  licitacao_id: string | null;
  empresa_id: string;
}

function semaforoLabel(dataValidade: string | null, status: string | null) {
  if (!dataValidade) {
    return { text: 'Sem vencimento', icon: CheckCircle2, color: 'text-muted-foreground' };
  }
  const dias = diasRestantes(dataValidade);
  if (dias < 0) return { text: `Vencido há ${Math.abs(dias)} dias`, icon: XCircle, color: 'text-status-pendente' };
  if (dias <= 30) return { text: `Vence em ${dias} dias`, icon: AlertTriangle, color: 'text-status-analise' };
  return { text: `Válido (${dias} dias)`, icon: CheckCircle2, color: 'text-status-ganha' };
}

function SemaforoValidade({ dataValidade, status }: { dataValidade: string | null; status: string | null }) {
  const s = semaforoLabel(dataValidade, status);
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', s.color)}>
      <s.icon className="w-3.5 h-3.5" /> {s.text}
    </span>
  );
}

function VisualizadorPDF({ doc, onClose }: { doc: DocRow; onClose: () => void }) {
  const isPdf = doc.arquivo_url?.toLowerCase().endsWith('.pdf') || doc.tipo === 'edital';

  const handleDownload = () => {
    if (doc.arquivo_url && doc.arquivo_url !== '#') {
      window.open(doc.arquivo_url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-card border-l border-border shadow-2xl animate-slide-in flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{doc.nome}</h3>
              <p className="text-xs text-muted-foreground">
                {TIPO_DOCUMENTO_LABELS[doc.tipo as TipoDocumento] || doc.tipo}
                {doc.tamanho_kb ? ` • ${(doc.tamanho_kb / 1024).toFixed(1)} MB` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5" /> Baixar
            </Button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
          {isPdf && doc.arquivo_url && doc.arquivo_url !== '#' ? (
            <iframe src={doc.arquivo_url} className="w-full h-full rounded-lg border border-border/50" />
          ) : (
            <div className="bg-card rounded-xl shadow-lg p-12 max-w-md text-center border border-border/50">
              <FileText className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-foreground mb-2">{doc.nome}</h4>
              <SemaforoValidade dataValidade={doc.data_validade} status={doc.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentos, setDocumentos] = useState<DocRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [docVisualizar, setDocVisualizar] = useState<DocRow | null>(null);

  // Fetch empresa_id and documents
  const fetchDocumentos = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let empId = empresaId;
      if (!empId) {
        const { data } = await supabase.rpc('get_user_empresa_id', { _user_id: user.id });
        empId = data;
        setEmpresaId(empId);
      }
      if (!empId) return;

      const { data: docs, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('empresa_id', empId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setDocumentos(docs || []);
    } catch (err: any) {
      console.error('Fetch docs error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, empresaId]);

  useEffect(() => { fetchDocumentos(); }, [fetchDocumentos]);

  // Upload files
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!user || !empresaId) {
      toast({ title: 'Erro', description: 'Faça login primeiro.', variant: 'destructive' });
      return;
    }

    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of fileArray) {
      if (file.size > 20 * 1024 * 1024) {
        toast({ title: 'Arquivo muito grande', description: `${file.name} excede 20MB.`, variant: 'destructive' });
        continue;
      }

      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${empresaId}/${timestamp}_${safeName}`;

      try {
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(storagePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          toast({ title: 'Erro no upload', description: `${file.name}: ${uploadError.message}`, variant: 'destructive' });
          continue;
        }

        // Get URL
        const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(uploadData.path);

        // Detect tipo from extension
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let tipo = 'outro';
        if (['pdf'].includes(ext)) tipo = 'edital';
        if (['doc', 'docx'].includes(ext)) tipo = 'contrato_social';
        if (['xls', 'xlsx'].includes(ext)) tipo = 'balanco_patrimonial';

        // Insert into DB
        const { error: dbError } = await supabase.from('documentos').insert({
          nome: file.name,
          tipo,
          arquivo_url: urlData.publicUrl,
          tamanho_kb: Math.round(file.size / 1024),
          empresa_id: empresaId,
          status: 'ativo',
        });

        if (dbError) {
          toast({ title: 'Erro ao salvar', description: `${file.name}: ${dbError.message}`, variant: 'destructive' });
          continue;
        }

        successCount++;
      } catch (err: any) {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast({ title: '✅ Upload concluído', description: `${successCount} arquivo(s) enviado(s).` });
      fetchDocumentos();
    }
  }, [user, empresaId, toast, fetchDocumentos]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  }, [uploadFiles]);

  // Filters
  const filtrados = useMemo(() => {
    return documentos.filter((d) => {
      const matchBusca = !busca || d.nome.toLowerCase().includes(busca.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || d.tipo === filtroTipo;
      let matchStatus = true;
      if (filtroStatus !== 'todos') {
        if (filtroStatus === 'proximo_vencer') {
          matchStatus = !!d.data_validade && diasRestantes(d.data_validade) >= 0 && diasRestantes(d.data_validade) <= 30;
        } else if (filtroStatus === 'vencido') {
          matchStatus = !!d.data_validade && diasRestantes(d.data_validade) < 0;
        } else if (filtroStatus === 'ativo') {
          matchStatus = !d.data_validade || diasRestantes(d.data_validade) > 30;
        }
      }
      return matchBusca && matchTipo && matchStatus;
    });
  }, [documentos, busca, filtroTipo, filtroStatus]);

  const contadores = useMemo(() => ({
    total: documentos.length,
    ativos: documentos.filter((d) => !d.data_validade || diasRestantes(d.data_validade) > 30).length,
    proximos: documentos.filter((d) => d.data_validade && diasRestantes(d.data_validade) >= 0 && diasRestantes(d.data_validade) <= 30).length,
    vencidos: documentos.filter((d) => d.data_validade && diasRestantes(d.data_validade) < 0).length,
  }), [documentos]);

  const certidoesAlerta = documentos.filter((d) => d.data_validade && diasRestantes(d.data_validade) <= 30);

  const handleDownloadDoc = (doc: DocRow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.arquivo_url && doc.arquivo_url !== '#') {
      window.open(doc.arquivo_url, '_blank');
    }
  };

  return (
    <AppLayout titulo="Gestão de Documentos (GED)" subtitulo="Repositório centralizado com controle de validade">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: FolderOpen, label: 'Total', value: contadores.total, color: 'text-primary' },
          { icon: CheckCircle2, label: 'Válidos', value: contadores.ativos, color: 'text-status-ganha' },
          { icon: Clock, label: 'Próx. Vencer', value: contadores.proximos, color: 'text-status-analise' },
          { icon: XCircle, label: 'Vencidos', value: contadores.vencidos, color: 'text-status-pendente' },
        ].map((item, i) => (
          <div key={i} className="metric-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2 mb-1">
              <item.icon className={cn('w-4 h-4', item.color)} />
              <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className={cn('text-2xl font-bold', item.color === 'text-primary' ? 'text-foreground' : item.color)}>{item.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Certidões alerta */}
      {certidoesAlerta.length > 0 && (
        <div className="bg-status-pendente/5 border border-status-pendente/20 rounded-xl p-4 mb-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-status-pendente" />
            <h3 className="text-sm font-bold text-status-pendente">Certidões que precisam de atenção</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {certidoesAlerta.map((d) => {
              const vencido = d.data_validade && diasRestantes(d.data_validade) < 0;
              return (
                <button key={d.id} onClick={() => setDocVisualizar(d)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:shadow-sm',
                    vencido ? 'bg-status-pendente/10 border-status-pendente/30 text-status-pendente' : 'bg-status-analise/10 border-status-analise/30 text-status-analise'
                  )}>
                  {vencido ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {TIPO_DOCUMENTO_LABELS[d.tipo as TipoDocumento] || d.tipo}
                  {d.data_validade && ` — ${formatarData(d.data_validade)}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 animate-fade-in">
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar documento..." className="pl-9 bg-card/60 border-border/60" />
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[160px] bg-card/60 border-border/60"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              {Object.entries(TIPO_DOCUMENTO_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[140px] bg-card/60 border-border/60"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Válidos</SelectItem>
              <SelectItem value="proximo_vencer">Próx. Vencer</SelectItem>
              <SelectItem value="vencido">Vencidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Enviando...' : 'Upload'}
        </Button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 mb-5 text-center transition-all duration-200 cursor-pointer glass-card animate-fade-in',
          dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border/60 hover:border-primary/40',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        {uploading ? (
          <Loader2 className="w-7 h-7 text-primary mx-auto mb-2 animate-spin" />
        ) : (
          <Upload className={cn('w-7 h-7 mx-auto mb-2', dragging ? 'text-primary' : 'text-muted-foreground/60')} />
        )}
        <p className="text-sm font-medium text-foreground">
          {uploading ? 'Enviando arquivos...' : dragging ? 'Solte os arquivos aqui' : 'Arraste documentos aqui ou clique para enviar'}
        </p>
        <p className="text-xs text-muted-foreground">PDF, DOC, XLS, Imagens • Máx 20MB</p>
      </div>

      {/* Documents list */}
      <div className="section-card animate-fade-in-up">
        <div className="divide-y divide-border/30">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum documento encontrado</p>
            </div>
          ) : (
            filtrados.map((doc) => (
              <div key={doc.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer group"
                onClick={() => setDocVisualizar(doc)}>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  doc.data_validade && diasRestantes(doc.data_validade) < 0 ? 'bg-status-pendente/10'
                    : doc.data_validade && diasRestantes(doc.data_validade) <= 30 ? 'bg-status-analise/10'
                    : 'bg-primary/10'
                )}>
                  <FileText className={cn('w-4 h-4',
                    doc.data_validade && diasRestantes(doc.data_validade) < 0 ? 'text-status-pendente'
                      : doc.data_validade && diasRestantes(doc.data_validade) <= 30 ? 'text-status-analise'
                      : 'text-primary'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{doc.nome}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{TIPO_DOCUMENTO_LABELS[doc.tipo as TipoDocumento] || doc.tipo}</span>
                    {doc.tamanho_kb && <span className="text-xs text-muted-foreground">{(doc.tamanho_kb / 1024).toFixed(1)} MB</span>}
                  </div>
                </div>
                <SemaforoValidade dataValidade={doc.data_validade} status={doc.status} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded hover:bg-secondary" onClick={(e) => { e.stopPropagation(); setDocVisualizar(doc); }}>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-secondary" onClick={(e) => handleDownloadDoc(doc, e)}>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {docVisualizar && <VisualizadorPDF doc={docVisualizar} onClose={() => setDocVisualizar(null)} />}
    </AppLayout>
  );
}
