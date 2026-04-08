import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Licitacao, MODALIDADE_LABELS, PORTAL_LABELS, COLUNA_LABELS, STATUS_LABELS, ColunaKanban, StatusLicitacao } from '@/types/licitacao';
import { formatarMoeda, formatarData, textoUrgencia, diasRestantes } from '@/lib/formatters';
import { useFileUpload } from '@/hooks/useFileUpload';
import {
  Building2, FileText, Calendar, Clock, DollarSign, Globe, ExternalLink,
  Upload, CheckCircle2, Circle, Trash2, Download, AlertTriangle, MessageSquare,
  Columns3, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Checklist padrão de documentos
const CHECKLIST_PADRAO = [
  { id: 'ck1', label: 'Edital e anexos baixados', grupo: 'Edital' },
  { id: 'ck2', label: 'Termo de Referência analisado', grupo: 'Edital' },
  { id: 'ck3', label: 'Proposta comercial elaborada', grupo: 'Proposta' },
  { id: 'ck4', label: 'Planilha de custos preenchida', grupo: 'Proposta' },
  { id: 'ck5', label: 'CND Federal válida', grupo: 'Habilitação' },
  { id: 'ck6', label: 'CND Estadual válida', grupo: 'Habilitação' },
  { id: 'ck7', label: 'CND Municipal válida', grupo: 'Habilitação' },
  { id: 'ck8', label: 'Certidão FGTS válida', grupo: 'Habilitação' },
  { id: 'ck9', label: 'Certidão Trabalhista (CNDT)', grupo: 'Habilitação' },
  { id: 'ck10', label: 'Balanço Patrimonial', grupo: 'Habilitação' },
  { id: 'ck11', label: 'Contrato Social atualizado', grupo: 'Habilitação' },
  { id: 'ck12', label: 'Atestados de capacidade técnica', grupo: 'Qualificação' },
];

interface LicitacaoDetailModalProps {
  licitacao: Licitacao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAtualizar: (id: string, campos: Record<string, any>) => Promise<boolean>;
  onMoverColuna: (id: string, coluna: ColunaKanban) => Promise<boolean | undefined>;
}

export function LicitacaoDetailModal({ licitacao, open, onOpenChange, onAtualizar, onMoverColuna }: LicitacaoDetailModalProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [observacoes, setObservacoes] = useState('');
  const [editandoObs, setEditandoObs] = useState(false);
  const { upload, uploading } = useFileUpload('editais');
  const [arquivos, setArquivos] = useState<{ name: string; path: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!licitacao) return null;

  const dias = diasRestantes(licitacao.dataLicitacao);
  const urgente = dias >= 0 && dias <= 3;
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;
  const progressoChecklist = Math.round((totalChecked / CHECKLIST_PADRAO.length) * 100);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const result = await upload(file, `licitacoes/${licitacao.id}`);
      if (result) {
        setArquivos(prev => [...prev, { name: file.name, path: result.path, url: result.url }]);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSalvarObs = async () => {
    await onAtualizar(licitacao.id, { observacoes });
    setEditandoObs(false);
  };

  const gruposChecklist = CHECKLIST_PADRAO.reduce((acc, item) => {
    if (!acc[item.grupo]) acc[item.grupo] = [];
    acc[item.grupo].push(item);
    return acc;
  }, {} as Record<string, typeof CHECKLIST_PADRAO>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={licitacao.status} />
              <Badge variant="outline" className="text-xs">
                {MODALIDADE_LABELS[licitacao.modalidade]}
              </Badge>
              {urgente && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {textoUrgencia(licitacao.dataLicitacao)}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl font-bold">{licitacao.orgaoComprador}</DialogTitle>
            <DialogDescription className="text-sm mt-1">{licitacao.objeto}</DialogDescription>
          </DialogHeader>

          {/* Quick info row */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {licitacao.numeroEdital}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatarData(licitacao.dataLicitacao)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {licitacao.horaLicitacao}</span>
            {licitacao.valorReferencia && (
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <DollarSign className="w-3.5 h-3.5" /> {formatarMoeda(licitacao.valorReferencia)}
              </span>
            )}
            {licitacao.portalDisputa && (
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {PORTAL_LABELS[licitacao.portalDisputa]}</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-2 w-fit">
            <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs">
              Checklist ({totalChecked}/{CHECKLIST_PADRAO.length})
            </TabsTrigger>
            <TabsTrigger value="arquivos" className="text-xs">Arquivos</TabsTrigger>
            <TabsTrigger value="notas" className="text-xs">Notas</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* OVERVIEW */}
            <TabsContent value="overview" className="mt-0 space-y-4">
              {/* Status e Coluna */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Status
                  </label>
                  <Select
                    value={licitacao.status}
                    onValueChange={(v) => onAtualizar(licitacao.id, { status: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Columns3 className="w-3.5 h-3.5" /> Coluna Kanban
                  </label>
                  <Select
                    value={licitacao.colunaKanban}
                    onValueChange={(v) => onMoverColuna(licitacao.id, v as ColunaKanban)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(COLUNA_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Link */}
              {licitacao.linkAcesso && (
                <a
                  href={licitacao.linkAcesso}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Acessar portal de disputa
                </a>
              )}

              {/* Progresso Checklist */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Progresso do Checklist</span>
                  <span className="text-muted-foreground">{progressoChecklist}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      progressoChecklist === 100 ? 'bg-status-ganha' : 'bg-primary'
                    )}
                    style={{ width: `${progressoChecklist}%` }}
                  />
                </div>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/30 rounded-lg p-3">
                  <span className="text-xs text-muted-foreground">Criada em</span>
                  <p className="font-medium">{formatarData(licitacao.criadoEm)}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <span className="text-xs text-muted-foreground">Dias restantes</span>
                  <p className={cn('font-medium', urgente && 'text-destructive')}>{textoUrgencia(licitacao.dataLicitacao)}</p>
                </div>
              </div>
            </TabsContent>

            {/* CHECKLIST */}
            <TabsContent value="checklist" className="mt-0 space-y-4">
              {Object.entries(gruposChecklist).map(([grupo, items]) => (
                <div key={grupo}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{grupo}</h4>
                  <div className="space-y-1">
                    {items.map(item => (
                      <label
                        key={item.id}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-accent/50',
                          checkedItems[item.id] && 'bg-accent/30'
                        )}
                      >
                        <Checkbox
                          checked={checkedItems[item.id] || false}
                          onCheckedChange={(v) => setCheckedItems(prev => ({ ...prev, [item.id]: !!v }))}
                        />
                        <span className={cn('text-sm', checkedItems[item.id] && 'line-through text-muted-foreground')}>
                          {item.label}
                        </span>
                        {checkedItems[item.id] ? (
                          <CheckCircle2 className="w-4 h-4 text-status-ganha ml-auto" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/30 ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* ARQUIVOS */}
            <TabsContent value="arquivos" className="mt-0 space-y-4">
              {/* Upload area */}
              <div
                className={cn(
                  'border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all',
                  uploading && 'opacity-50 pointer-events-none'
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">
                  {uploading ? 'Enviando...' : 'Clique ou arraste arquivos aqui'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, XLS, imagens até 20MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Arquivos enviados */}
              {arquivos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Arquivos enviados</h4>
                  {arquivos.map((arq, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm">{arq.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={arq.url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setArquivos(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {arquivos.length === 0 && !uploading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum arquivo enviado para esta licitação.
                </p>
              )}
            </TabsContent>

            {/* NOTAS */}
            <TabsContent value="notas" className="mt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Observações
                </label>
                <Textarea
                  value={observacoes || licitacao.observacoes || ''}
                  onChange={(e) => setObservacoes(e.target.value)}
                  onFocus={() => {
                    if (!observacoes && licitacao.observacoes) setObservacoes(licitacao.observacoes);
                    setEditandoObs(true);
                  }}
                  placeholder="Adicione notas internas, decisões, estratégia..."
                  rows={6}
                  className="resize-none"
                />
                {editandoObs && (
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditandoObs(false)}>Cancelar</Button>
                    <Button size="sm" onClick={handleSalvarObs}>Salvar</Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
