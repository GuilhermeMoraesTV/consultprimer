// === Página de Dashboard Principal ===
import { AppLayout } from '@/components/AppLayout';
import { METRICAS_MOCK, LICITACOES_MOCK } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { formatarMoeda, formatarData, textoUrgencia, diasRestantes } from '@/lib/formatters';
import { MODALIDADE_LABELS } from '@/types/licitacao';
import {
  TrendingUp,
  DollarSign,
  Trophy,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Gavel,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** Card de métrica do dashboard — glassmorphism style */
function MetricCard({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  destaque,
  index = 0,
}: {
  titulo: string;
  valor: string;
  subtitulo?: string;
  icone: typeof TrendingUp;
  destaque?: boolean;
  index?: number;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-300 animate-fade-in-up group cursor-default',
        'glass-card-hover',
        destaque && 'border-primary/30 bg-primary-light/80'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
            destaque
              ? 'bg-gradient-to-br from-primary/20 to-primary/10 shadow-inner'
              : 'bg-secondary/80'
          )}
        >
          <Icone className={cn('w-5 h-5', destaque ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
      </div>
      <p className="text-2xl font-bold text-foreground">{valor}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{titulo}</p>
      {subtitulo && <p className="text-xs text-muted-foreground/70 mt-1">{subtitulo}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const m = METRICAS_MOCK;

  const proximas = [...LICITACOES_MOCK]
    .filter((l) => diasRestantes(l.dataLicitacao) >= 0)
    .sort((a, b) => diasRestantes(a.dataLicitacao) - diasRestantes(b.dataLicitacao))
    .slice(0, 5);

  return (
    <AppLayout titulo="Dashboard" subtitulo="Visão geral da sua carteira de licitações">
      {/* Métricas superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard titulo="Licitações Ativas" valor={String(m.totalLicitacoes)} subtitulo={`${m.licitacoesEsteMes} este mês`} icone={Gavel} index={0} />
        <MetricCard titulo="Volume Disputado" valor={formatarMoeda(m.valorDisputado)} icone={DollarSign} index={1} />
        <MetricCard titulo="Volume Ganho" valor={formatarMoeda(m.valorGanho)} icone={Trophy} destaque index={2} />
        <MetricCard titulo="Taxa de Sucesso" valor={`${m.taxaSucesso}%`} subtitulo={`${m.pendencias} pendências`} icone={TrendingUp} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas licitações */}
        <div className="lg:col-span-2 glass-card rounded-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <h3 className="text-sm font-bold text-foreground">Próximas Licitações</h3>
            <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-secondary/60">{proximas.length} agendadas</span>
          </div>
          <div className="divide-y divide-border/30">
            {proximas.map((lic, i) => {
              const dias = diasRestantes(lic.dataLicitacao);
              const urgente = dias <= 3;
              return (
                <div
                  key={lic.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-all duration-200 cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${(i + 3) * 60}ms` }}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                      urgente ? 'bg-status-pendente/10' : 'bg-secondary/60'
                    )}
                  >
                    <Calendar
                      className={cn('w-4.5 h-4.5', urgente ? 'text-status-pendente' : 'text-muted-foreground')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{lic.orgaoComprador}</p>
                    <p className="text-xs text-muted-foreground">
                      {MODALIDADE_LABELS[lic.modalidade]} • {lic.numeroEdital}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn('text-xs font-semibold', urgente ? 'text-status-pendente' : 'text-muted-foreground')}>
                      {textoUrgencia(lic.dataLicitacao)}
                    </p>
                    <p className="text-xs text-muted-foreground/70">{formatarData(lic.dataLicitacao)}</p>
                  </div>
                  <StatusBadge status={lic.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel de pendências */}
        <div className="glass-card rounded-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
            <div className="w-6 h-6 rounded-lg bg-status-pendente/10 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-status-pendente" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Pendências</h3>
          </div>
          <div className="p-4 space-y-3">
            {LICITACOES_MOCK.filter((l) => !l.checklistCompleto && diasRestantes(l.dataLicitacao) >= 0).map((lic, i) => (
              <div
                key={lic.id}
                className="p-3.5 rounded-xl border border-status-pendente/15 bg-status-pendente/5 backdrop-blur-sm animate-fade-in transition-all duration-200 hover:border-status-pendente/30 hover:shadow-sm cursor-default"
                style={{ animationDelay: `${(i + 5) * 60}ms` }}
              >
                <p className="text-xs font-semibold text-foreground mb-1">
                  {lic.numeroEdital} — {lic.orgaoComprador}
                </p>
                <p className="text-xs text-status-pendente font-medium">
                  Faltam {lic.documentosNecessarios - lic.documentosAnexados} documento(s)
                </p>
                <div className="w-full h-1.5 bg-muted/60 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-status-pendente to-status-pendente/70 rounded-full transition-all duration-500"
                    style={{
                      width: `${(lic.documentosAnexados / lic.documentosNecessarios) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
