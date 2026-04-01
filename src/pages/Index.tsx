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

/** Card de métrica do dashboard */
function MetricCard({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  destaque,
}: {
  titulo: string;
  valor: string;
  subtitulo?: string;
  icone: typeof TrendingUp;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border p-5 transition-all hover:shadow-md',
        destaque && 'border-primary/30 bg-primary-light'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            destaque ? 'bg-primary/20' : 'bg-secondary'
          )}
        >
          <Icone className={cn('w-5 h-5', destaque ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold text-foreground">{valor}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{titulo}</p>
      {subtitulo && <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const m = METRICAS_MOCK;

  // Licitações próximas (ordenar por data)
  const proximas = [...LICITACOES_MOCK]
    .filter((l) => diasRestantes(l.dataLicitacao) >= 0)
    .sort((a, b) => diasRestantes(a.dataLicitacao) - diasRestantes(b.dataLicitacao))
    .slice(0, 5);

  return (
    <AppLayout titulo="Dashboard" subtitulo="Visão geral da sua carteira de licitações">
      {/* Métricas superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          titulo="Licitações Ativas"
          valor={String(m.totalLicitacoes)}
          subtitulo={`${m.licitacoesEsteMes} este mês`}
          icone={Gavel}
        />
        <MetricCard
          titulo="Volume Disputado"
          valor={formatarMoeda(m.valorDisputado)}
          icone={DollarSign}
        />
        <MetricCard
          titulo="Volume Ganho"
          valor={formatarMoeda(m.valorGanho)}
          icone={Trophy}
          destaque
        />
        <MetricCard
          titulo="Taxa de Sucesso"
          valor={`${m.taxaSucesso}%`}
          subtitulo={`${m.pendencias} pendências`}
          icone={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas licitações */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Próximas Licitações</h3>
            <span className="text-xs text-muted-foreground">{proximas.length} agendadas</span>
          </div>
          <div className="divide-y divide-border">
            {proximas.map((lic) => {
              const dias = diasRestantes(lic.dataLicitacao);
              const urgente = dias <= 3;
              return (
                <div
                  key={lic.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      urgente ? 'bg-status-pendente/10' : 'bg-secondary'
                    )}
                  >
                    <Calendar
                      className={cn(
                        'w-4.5 h-4.5',
                        urgente ? 'text-status-pendente' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {lic.orgaoComprador}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {MODALIDADE_LABELS[lic.modalidade]} • {lic.numeroEdital}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        urgente ? 'text-status-pendente' : 'text-muted-foreground'
                      )}
                    >
                      {textoUrgencia(lic.dataLicitacao)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatarData(lic.dataLicitacao)}</p>
                  </div>
                  <StatusBadge status={lic.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel de pendências */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <AlertCircle className="w-4 h-4 text-status-pendente" />
            <h3 className="text-sm font-bold text-foreground">Pendências</h3>
          </div>
          <div className="p-4 space-y-3">
            {LICITACOES_MOCK.filter((l) => !l.checklistCompleto && diasRestantes(l.dataLicitacao) >= 0).map((lic) => (
              <div
                key={lic.id}
                className="p-3 rounded-lg border border-status-pendente/20 bg-status-pendente/5 animate-fade-in"
              >
                <p className="text-xs font-semibold text-foreground mb-1">
                  {lic.numeroEdital} — {lic.orgaoComprador}
                </p>
                <p className="text-xs text-status-pendente font-medium">
                  Faltam {lic.documentosNecessarios - lic.documentosAnexados} documento(s)
                </p>
                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-status-pendente rounded-full"
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
