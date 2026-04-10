import { AppLayout } from '@/components/AppLayout';
import { useDashboard } from '@/hooks/useDashboard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatarMoeda, formatarData, textoUrgencia, diasRestantes } from '@/lib/formatters';
import { MODALIDADE_LABELS, type ModalidadeLicitacao } from '@/types/licitacao';
import {
  TrendingUp, DollarSign, Trophy, AlertCircle, Calendar, ArrowUpRight, Gavel, FileWarning, Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function MetricCard({
  titulo, valor, subtitulo, icone: Icone, destaque, index = 0, loading,
}: {
  titulo: string; valor: string; subtitulo?: string;
  icone: typeof TrendingUp; destaque?: boolean; index?: number; loading?: boolean;
}) {
  const isLong = valor.length > 12;
  return (
    <div
      className={cn(
        'metric-card animate-fade-in-up group cursor-default',
        destaque && 'border-primary/30 bg-primary-light/60'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          destaque ? 'bg-primary/10' : 'bg-secondary/80'
        )}>
          <Icone className={cn('w-5 h-5', destaque ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <p className={isLong ? 'metric-value-sm' : 'metric-value'}>{valor}</p>
          <p className="metric-label">{titulo}</p>
          {subtitulo && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{subtitulo}</p>}
        </>
      )}
    </div>
  );
}

function EmptyState({ icone: Icone, texto }: { icone: typeof Inbox; texto: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-secondary/60 flex items-center justify-center">
        <Icone className="w-6 h-6" />
      </div>
      <p className="text-sm">{texto}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const m = data || {
    totalLicitacoes: 0, valorDisputado: 0, valorGanho: 0,
    taxaSucesso: 0, pendencias: 0, licitacoesEsteMes: 0,
    proximas: [], pendenciasLista: [], docsAlerta: [], contratosVigentes: [],
  };

  return (
    <AppLayout titulo="Dashboard" subtitulo="Visão geral da sua carteira de licitações">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard titulo="Licitações Ativas" valor={String(m.totalLicitacoes)} subtitulo={`${m.licitacoesEsteMes} este mês`} icone={Gavel} index={0} loading={isLoading} />
        <MetricCard titulo="Volume Disputado" valor={formatarMoeda(m.valorDisputado)} icone={DollarSign} index={1} loading={isLoading} />
        <MetricCard titulo="Volume Ganho" valor={formatarMoeda(m.valorGanho)} icone={Trophy} destaque index={2} loading={isLoading} />
        <MetricCard titulo="Taxa de Sucesso" valor={`${m.taxaSucesso}%`} subtitulo={`${m.pendencias} pendências`} icone={TrendingUp} index={3} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas licitações */}
        <div className="lg:col-span-2 section-card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="section-header">
            <h3 className="section-title">Próximas Licitações</h3>
            <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-secondary/60">
              {m.proximas.length} agendadas
            </span>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : m.proximas.length === 0 ? (
            <EmptyState icone={Inbox} texto="Nenhuma licitação agendada" />
          ) : (
            <div className="divide-y divide-border/30">
              {m.proximas.map((lic, i) => {
                const dias = diasRestantes(lic.data_licitacao);
                const urgente = dias <= 3;
                return (
                  <div
                    key={lic.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/30 transition-colors duration-200 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${(i + 3) * 60}ms` }}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                      urgente ? 'bg-status-pendente/10' : 'bg-secondary/60'
                    )}>
                      <Calendar className={cn('w-4 h-4', urgente ? 'text-status-pendente' : 'text-muted-foreground')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{lic.orgao_nome}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {MODALIDADE_LABELS[lic.modalidade as ModalidadeLicitacao] || lic.modalidade} • {lic.numero_edital}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('text-xs font-semibold', urgente ? 'text-status-pendente' : 'text-muted-foreground')}>
                        {textoUrgencia(lic.data_licitacao)}
                      </p>
                      <p className="text-xs text-muted-foreground/70">{formatarData(lic.data_licitacao)}</p>
                    </div>
                    <StatusBadge status={lic.status as any} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pendências + Docs */}
        <div className="space-y-6">
          {/* Pendências */}
          <div className="section-card animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="section-header">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-status-pendente/10 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5 text-status-pendente" />
                </div>
                <h3 className="section-title">Pendências</h3>
              </div>
              {m.pendenciasLista.length > 0 && (
                <span className="text-xs text-status-pendente font-semibold">{m.pendenciasLista.length}</span>
              )}
            </div>
            <div className="p-4 space-y-3">
              {isLoading ? (
                [...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
              ) : m.pendenciasLista.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 text-center py-6">Nenhuma pendência 🎉</p>
              ) : (
                m.pendenciasLista.map((lic, i) => (
                  <div
                    key={lic.id}
                    className="p-3 rounded-xl border border-status-pendente/15 bg-status-pendente/5 animate-fade-in transition-colors hover:border-status-pendente/30"
                    style={{ animationDelay: `${(i + 5) * 60}ms` }}
                  >
                    <p className="text-xs font-semibold text-foreground mb-1 truncate">
                      {lic.numero_edital} — {lic.orgao_nome}
                    </p>
                    <p className="text-xs text-status-pendente font-medium">
                      Checklist incompleto • {textoUrgencia(lic.data_licitacao)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Docs com alerta */}
          {(isLoading || m.docsAlerta.length > 0) && (
            <div className="section-card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="section-header">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-status-analise/10 flex items-center justify-center">
                    <FileWarning className="w-3.5 h-3.5 text-status-analise" />
                  </div>
                  <h3 className="section-title">Docs Vencendo</h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {isLoading ? (
                  [...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)
                ) : (
                  m.docsAlerta.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg bg-status-analise/5 border border-status-analise/15">
                      <p className="text-xs font-medium text-foreground truncate flex-1 mr-2">{doc.nome}</p>
                      <p className="text-xs text-status-analise font-semibold shrink-0">
                        {doc.data_validade ? formatarData(doc.data_validade) : '—'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
