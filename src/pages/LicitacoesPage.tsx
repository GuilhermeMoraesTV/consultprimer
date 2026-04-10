import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { LicitacaoDetailModal } from '@/components/LicitacaoDetailModal';
import { NovaLicitacaoModal } from '@/components/NovaLicitacaoModal';
import { useSupabaseLicitacoes } from '@/hooks/useSupabaseLicitacoes';
import { Licitacao, StatusLicitacao, MODALIDADE_LABELS, STATUS_LABELS } from '@/types/licitacao';
import { formatarMoeda, formatarData, textoUrgencia, diasRestantes } from '@/lib/formatters';
import { Plus, Search, Filter, FileText, Eye, Loader2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function LicitacoesPage() {
  const { licitacoes, loading, criarLicitacao, atualizarLicitacao, moverColuna } = useSupabaseLicitacoes();
  const [modalAberto, setModalAberto] = useState(false);
  const [detailLic, setDetailLic] = useState<Licitacao | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [dadosDuplicar, setDadosDuplicar] = useState<Partial<Licitacao> | null>(null);

  const filtradas = useMemo(() => {
    return licitacoes.filter((l) => {
      const matchBusca = !busca ||
        l.orgaoComprador.toLowerCase().includes(busca.toLowerCase()) ||
        l.numeroEdital.toLowerCase().includes(busca.toLowerCase()) ||
        l.objeto.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'todos' || l.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [licitacoes, busca, filtroStatus]);

  const handleDuplicar = (lic: Licitacao, e: React.MouseEvent) => {
    e.stopPropagation();
    setDadosDuplicar(lic);
    setModalAberto(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalAberto(open);
    if (!open) setDadosDuplicar(null);
  };

  return (
    <AppLayout titulo="Licitações" subtitulo="Cadastre e gerencie todos os certames da empresa">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 animate-fade-in">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por órgão, edital ou objeto..."
              className="pl-9 bg-card/60 border-border/60" />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[160px] bg-card/60 border-border/60">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
              <SelectItem value="todos">Todos os Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => { setDadosDuplicar(null); setModalAberto(true); }} className="gap-1.5 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30">
          <Plus className="w-4 h-4" /> Nova Licitação
        </Button>
      </div>

      <div className="section-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Edital</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Órgão / Objeto</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Modalidade</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Valor Ref.</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3 w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-12">
                      <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhuma licitação encontrada</p>
                    </div>
                  </td>
                </tr>
              ) : filtradas.map((lic) => {
                const dias = diasRestantes(lic.dataLicitacao);
                const urgente = dias >= 0 && dias <= 3;
                return (
                  <tr key={lic.id}
                    className="hover:bg-primary/[0.03] transition-colors cursor-pointer group"
                    onClick={() => { setDetailLic(lic); setDetailOpen(true); }}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-foreground">{lic.numeroEdital}</span>
                      {lic.uasg && <p className="text-[10px] text-muted-foreground">UASG {lic.uasg}</p>}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{lic.orgaoComprador}</p>
                      <p className="text-xs text-muted-foreground truncate">{lic.objeto}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md bg-secondary/50">
                        {MODALIDADE_LABELS[lic.modalidade]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{formatarData(lic.dataLicitacao)}</p>
                      <p className={cn('text-xs', urgente ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
                        {textoUrgencia(lic.dataLicitacao)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {lic.valorReferencia ? formatarMoeda(lic.valorReferencia) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={lic.status} /></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setDetailLic(lic); setDetailOpen(true); }}>
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalhes</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                              onClick={(e) => handleDuplicar(lic, e)}>
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicar</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-4 py-3 border-t border-border/30 bg-muted/20 text-xs text-muted-foreground">
            {filtradas.length} licitação(ões) encontrada(s)
          </div>
        )}
      </div>

      <NovaLicitacaoModal open={modalAberto} onOpenChange={handleCloseModal} onSalvar={criarLicitacao} dadosIniciais={dadosDuplicar} />
      <LicitacaoDetailModal licitacao={detailLic} open={detailOpen} onOpenChange={setDetailOpen} onAtualizar={atualizarLicitacao} onMoverColuna={moverColuna} />
    </AppLayout>
  );
}
