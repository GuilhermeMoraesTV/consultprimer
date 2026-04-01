// === Página de Cadastro / Lista de Licitações ===
// Formulário inteligente + tabela de licitações cadastradas

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { LICITACOES_MOCK, ORGAOS_SUGESTAO } from '@/data/mockData';
import {
  Licitacao,
  ModalidadeLicitacao,
  ModoDisputa,
  PortalDisputa,
  StatusLicitacao,
  MODALIDADE_LABELS,
  PORTAL_LABELS,
  MODO_DISPUTA_LABELS,
  STATUS_LABELS,
} from '@/types/licitacao';
import { formatarMoeda, formatarData, textoUrgencia, diasRestantes } from '@/lib/formatters';
import {
  Plus,
  Search,
  Filter,
  X,
  Upload,
  FileText,
  ExternalLink,
  Eye,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

/** Componente de autocompletar para órgãos */
function OrgaoAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState(value);

  const sugestoes = useMemo(() => {
    if (!busca) return ORGAOS_SUGESTAO.slice(0, 5);
    return ORGAOS_SUGESTAO.filter((o) =>
      o.toLowerCase().includes(busca.toLowerCase())
    ).slice(0, 8);
  }, [busca]);

  return (
    <div className="relative">
      <Input
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          onChange(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 200)}
        placeholder="Digite o nome do órgão comprador..."
      />
      {aberto && sugestoes.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {sugestoes.map((org) => (
            <button
              key={org}
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
              onMouseDown={() => {
                setBusca(org);
                onChange(org);
                setAberto(false);
              }}
            >
              {org}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Modal lateral de detalhes da licitação */
function DetalheSlideOver({
  licitacao,
  onClose,
}: {
  licitacao: Licitacao;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="fixed inset-0 bg-foreground/20" onClick={onClose} />
      {/* Painel lateral */}
      <div className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl animate-slide-in overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-foreground">Detalhes da Licitação</h2>
            <p className="text-xs text-muted-foreground">{licitacao.numeroEdital}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusBadge status={licitacao.status} />
            {licitacao.linkAcesso && (
              <a
                href={licitacao.linkAcesso}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> Acessar portal
              </a>
            )}
          </div>

          {/* Órgão */}
          <div>
            <Label className="text-xs text-muted-foreground">Órgão Comprador</Label>
            <p className="text-sm font-semibold text-foreground mt-0.5">{licitacao.orgaoComprador}</p>
          </div>

          {/* Objeto */}
          <div>
            <Label className="text-xs text-muted-foreground">Objeto</Label>
            <p className="text-sm text-foreground mt-0.5">{licitacao.objeto}</p>
          </div>

          {/* Grid de informações */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Modalidade</Label>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {MODALIDADE_LABELS[licitacao.modalidade]}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Data / Hora</Label>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {formatarData(licitacao.dataLicitacao)} às {licitacao.horaLicitacao}
              </p>
            </div>
            {licitacao.valorReferencia && (
              <div>
                <Label className="text-xs text-muted-foreground">Valor de Referência</Label>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {formatarMoeda(licitacao.valorReferencia)}
                </p>
              </div>
            )}
            {licitacao.portalDisputa && (
              <div>
                <Label className="text-xs text-muted-foreground">Portal</Label>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {PORTAL_LABELS[licitacao.portalDisputa]}
                </p>
              </div>
            )}
            {licitacao.modoDisputa && (
              <div>
                <Label className="text-xs text-muted-foreground">Modo de Disputa</Label>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {MODO_DISPUTA_LABELS[licitacao.modoDisputa]}
                </p>
              </div>
            )}
          </div>

          {/* Progresso de documentos */}
          <div>
            <Label className="text-xs text-muted-foreground">Documentos</Label>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    licitacao.checklistCompleto ? 'bg-status-ganha' : 'bg-primary'
                  )}
                  style={{ width: `${(licitacao.documentosAnexados / licitacao.documentosNecessarios) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {licitacao.documentosAnexados}/{licitacao.documentosNecessarios}
              </span>
            </div>
            {!licitacao.checklistCompleto && (
              <p className="text-xs text-status-pendente mt-1 font-medium">
                ⚠️ Faltam {licitacao.documentosNecessarios - licitacao.documentosAnexados} documento(s) obrigatório(s)
              </p>
            )}
          </div>

          {/* Observações */}
          {licitacao.observacoes && (
            <div>
              <Label className="text-xs text-muted-foreground">Observações</Label>
              <p className="text-sm text-foreground mt-0.5 bg-secondary/50 p-3 rounded-lg">
                {licitacao.observacoes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LicitacoesPage() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(LICITACOES_MOCK);
  const [modalAberto, setModalAberto] = useState(false);
  const [slideOverLic, setSlideOverLic] = useState<Licitacao | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const { toast } = useToast();

  // Estado do formulário
  const [form, setForm] = useState({
    orgaoComprador: '',
    modalidade: '' as ModalidadeLicitacao | '',
    numeroEdital: '',
    objeto: '',
    dataLicitacao: '',
    horaLicitacao: '',
    modoDisputa: '' as ModoDisputa | '',
    valorReferencia: '',
    portalDisputa: '' as PortalDisputa | '',
    linkAcesso: '',
    observacoes: '',
  });

  /** Filtrar licitações */
  const filtradas = useMemo(() => {
    return licitacoes.filter((l) => {
      const matchBusca =
        !busca ||
        l.orgaoComprador.toLowerCase().includes(busca.toLowerCase()) ||
        l.numeroEdital.toLowerCase().includes(busca.toLowerCase()) ||
        l.objeto.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'todos' || l.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [licitacoes, busca, filtroStatus]);

  /** Salvar nova licitação */
  const salvarLicitacao = () => {
    if (!form.orgaoComprador || !form.modalidade || !form.numeroEdital || !form.objeto || !form.dataLicitacao || !form.horaLicitacao) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios para cadastrar a licitação.',
        variant: 'destructive',
      });
      return;
    }

    const nova: Licitacao = {
      id: String(Date.now()),
      orgaoComprador: form.orgaoComprador,
      modalidade: form.modalidade as ModalidadeLicitacao,
      numeroEdital: form.numeroEdital,
      objeto: form.objeto,
      dataLicitacao: form.dataLicitacao,
      horaLicitacao: form.horaLicitacao,
      modoDisputa: form.modoDisputa as ModoDisputa || undefined,
      valorReferencia: form.valorReferencia ? Number(form.valorReferencia.replace(/\D/g, '')) / 100 : undefined,
      portalDisputa: form.portalDisputa as PortalDisputa || undefined,
      status: 'falta_cadastrar',
      colunaKanban: 'captacao',
      linkAcesso: form.linkAcesso || undefined,
      observacoes: form.observacoes || undefined,
      checklistCompleto: false,
      documentosAnexados: 0,
      documentosNecessarios: 8,
      empresaId: 'emp1',
      criadoEm: new Date().toISOString().split('T')[0],
    };

    setLicitacoes((prev) => [nova, ...prev]);
    setModalAberto(false);
    setForm({
      orgaoComprador: '', modalidade: '', numeroEdital: '', objeto: '',
      dataLicitacao: '', horaLicitacao: '', modoDisputa: '', valorReferencia: '',
      portalDisputa: '', linkAcesso: '', observacoes: '',
    });

    toast({
      title: '✅ Licitação cadastrada!',
      description: `${nova.numeroEdital} — ${nova.orgaoComprador}`,
    });
  };

  /** Formatar valor monetário no input */
  const handleValorChange = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (!numeros) { setForm((f) => ({ ...f, valorReferencia: '' })); return; }
    const centavos = parseInt(numeros, 10);
    const formatado = (centavos / 100).toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL',
    });
    setForm((f) => ({ ...f, valorReferencia: formatado }));
  };

  return (
    <AppLayout titulo="Licitações" subtitulo="Cadastre e gerencie todos os certames da empresa">
      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por órgão, edital ou objeto..."
              className="pl-9"
            />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setModalAberto(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nova Licitação
        </Button>
      </div>

      {/* Tabela de licitações */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Edital</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Órgão / Objeto</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Modalidade</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Valor Ref.</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Docs</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtradas.map((lic) => {
                const dias = diasRestantes(lic.dataLicitacao);
                const urgente = dias >= 0 && dias <= 3;
                return (
                  <tr
                    key={lic.id}
                    className="hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSlideOverLic(lic)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-foreground">{lic.numeroEdital}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm font-semibold text-foreground truncate">{lic.orgaoComprador}</p>
                      <p className="text-xs text-muted-foreground truncate">{lic.objeto}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        {MODALIDADE_LABELS[lic.modalidade]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{formatarData(lic.dataLicitacao)}</p>
                      <p className={cn('text-xs', urgente ? 'text-status-pendente font-semibold' : 'text-muted-foreground')}>
                        {textoUrgencia(lic.dataLicitacao)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-foreground">
                        {lic.valorReferencia ? formatarMoeda(lic.valorReferencia) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={lic.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', lic.checklistCompleto ? 'bg-status-ganha' : 'bg-primary')}
                            style={{ width: `${(lic.documentosAnexados / lic.documentosNecessarios) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {lic.documentosAnexados}/{lic.documentosNecessarios}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSlideOverLic(lic); }}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtradas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma licitação encontrada</p>
          </div>
        )}
      </div>

      {/* Slide-over de detalhes */}
      {slideOverLic && (
        <DetalheSlideOver licitacao={slideOverLic} onClose={() => setSlideOverLic(null)} />
      )}

      {/* Modal de nova licitação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Nova Licitação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Órgão */}
            <div>
              <Label className="text-sm font-medium">Órgão Comprador *</Label>
              <OrgaoAutocomplete value={form.orgaoComprador} onChange={(v) => setForm((f) => ({ ...f, orgaoComprador: v }))} />
            </div>

            {/* Modalidade + Edital */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Modalidade *</Label>
                <Select value={form.modalidade} onValueChange={(v) => setForm((f) => ({ ...f, modalidade: v as ModalidadeLicitacao }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MODALIDADE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Nº do Edital/Pregão *</Label>
                <Input
                  value={form.numeroEdital}
                  onChange={(e) => setForm((f) => ({ ...f, numeroEdital: e.target.value }))}
                  placeholder="Ex: 012/2026"
                />
              </div>
            </div>

            {/* Objeto */}
            <div>
              <Label className="text-sm font-medium">Objeto *</Label>
              <Textarea
                value={form.objeto}
                onChange={(e) => setForm((f) => ({ ...f, objeto: e.target.value }))}
                placeholder="Descreva o que a administração pública está comprando..."
                rows={3}
              />
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Data da Licitação *</Label>
                <Input
                  type="date"
                  value={form.dataLicitacao}
                  onChange={(e) => setForm((f) => ({ ...f, dataLicitacao: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Hora da Licitação *</Label>
                <Input
                  type="time"
                  value={form.horaLicitacao}
                  onChange={(e) => setForm((f) => ({ ...f, horaLicitacao: e.target.value }))}
                />
              </div>
            </div>

            {/* Modo de Disputa + Portal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Modo de Disputa</Label>
                <Select value={form.modoDisputa} onValueChange={(v) => setForm((f) => ({ ...f, modoDisputa: v as ModoDisputa }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MODO_DISPUTA_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Portal de Disputa</Label>
                <Select value={form.portalDisputa} onValueChange={(v) => setForm((f) => ({ ...f, portalDisputa: v as PortalDisputa }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PORTAL_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valor + Link */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Valor de Referência</Label>
                <Input
                  value={form.valorReferencia}
                  onChange={(e) => handleValorChange(e.target.value)}
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Link de Acesso</Label>
                <Input
                  value={form.linkAcesso}
                  onChange={(e) => setForm((f) => ({ ...f, linkAcesso: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label className="text-sm font-medium">Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                placeholder="Anotações estratégicas, lembretes..."
                rows={2}
              />
            </div>

            {/* Área de upload */}
            <div>
              <Label className="text-sm font-medium">Anexos</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-foreground">Upload do Edital</p>
                  <p className="text-[10px] text-muted-foreground">PDF, máx 20MB</p>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-foreground">Termo de Referência</p>
                  <p className="text-[10px] text-muted-foreground">PDF, máx 20MB</p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
              <Button onClick={salvarLicitacao}>Cadastrar Licitação</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
