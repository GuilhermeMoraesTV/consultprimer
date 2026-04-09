// === Página de Analytics e Relatórios ===
import { useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { LICITACOES_MOCK, METRICAS_MOCK, CONCORRENTES_MOCK } from '@/data/mockData';
import { formatarMoeda } from '@/lib/formatters';
import { MODALIDADE_LABELS, STATUS_LABELS } from '@/types/licitacao';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function BarraHorizontal({ label, valor, maximo, cor, formato = 'numero' }: {
  label: string; valor: number; maximo: number; cor: string; formato?: 'numero' | 'moeda' | 'percentual';
}) {
  const percentual = maximo > 0 ? (valor / maximo) * 100 : 0;
  const valorFormatado = formato === 'moeda' ? formatarMoeda(valor) : formato === 'percentual' ? `${valor.toFixed(1)}%` : String(valor);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold text-foreground">{valorFormatado}</span>
      </div>
      <div className="w-full h-2.5 bg-secondary/60 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', cor)} style={{ width: `${Math.min(percentual, 100)}%` }} />
      </div>
    </div>
  );
}

function DonutChart({ dados, tamanho = 140 }: { dados: { label: string; valor: number; cor: string }[]; tamanho?: number }) {
  const total = dados.reduce((s, d) => s + d.valor, 0);
  const raio = 50;
  const circunferencia = 2 * Math.PI * raio;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={tamanho} height={tamanho} viewBox="0 0 120 120">
        {dados.map((d, i) => {
          const pct = total > 0 ? d.valor / total : 0;
          const dash = pct * circunferencia;
          const segmento = (
            <circle key={i} cx="60" cy="60" r={raio} fill="none" stroke={d.cor} strokeWidth="16"
              strokeDasharray={`${dash} ${circunferencia - dash}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)"
              className="transition-all duration-700"
            />
          );
          offset += dash;
          return segmento;
        })}
        <text x="60" y="56" textAnchor="middle" className="text-xs font-bold fill-foreground">{total}</text>
        <text x="60" y="70" textAnchor="middle" className="text-[9px] fill-muted-foreground">licitações</text>
      </svg>
      <div className="space-y-1.5">
        {dados.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.cor }} />
            <span className="text-xs text-muted-foreground">{d.label}</span>
            <span className="text-xs font-bold text-foreground">{d.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const m = METRICAS_MOCK;

  const porStatus = useMemo(() => {
    const contagem: Record<string, number> = {};
    LICITACOES_MOCK.forEach((l) => { contagem[l.status] = (contagem[l.status] || 0) + 1; });
    const cores: Record<string, string> = {
      falta_cadastrar: 'hsl(0, 72%, 51%)', em_analise: 'hsl(38, 80%, 50%)',
      cadastrada: 'hsl(215, 75%, 50%)', ganha: 'hsl(145, 63%, 42%)', perdida: 'hsl(220, 10%, 40%)',
    };
    return Object.entries(contagem).map(([status, valor]) => ({
      label: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status, valor, cor: cores[status] || '#999',
    }));
  }, []);

  const porModalidade = useMemo(() => {
    const contagem: Record<string, number> = {};
    LICITACOES_MOCK.forEach((l) => { contagem[l.modalidade] = (contagem[l.modalidade] || 0) + 1; });
    return Object.entries(contagem).sort((a, b) => b[1] - a[1]).map(([mod, val]) => ({
      label: MODALIDADE_LABELS[mod as keyof typeof MODALIDADE_LABELS] || mod, valor: val,
    }));
  }, []);

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const valoresMensais = [
    { disputado: 850000, ganho: 320000 }, { disputado: 1200000, ganho: 680000 },
    { disputado: 950000, ganho: 450000 }, { disputado: 1800000, ganho: 1100000 },
    { disputado: 2100000, ganho: 890000 }, { disputado: 1500000, ganho: 720000 },
  ];
  const maxMensal = Math.max(...valoresMensais.map((v) => v.disputado));

  return (
    <AppLayout titulo="Analytics e Relatórios" subtitulo="Visão analítica do desempenho em licitações">
      {/* Métricas superiores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Target, label: 'Taxa de Sucesso', value: `${m.taxaSucesso}%`, trend: '+12%', up: true },
          { icon: DollarSign, label: 'Volume Ganho', value: formatarMoeda(m.valorGanho), trend: '+8%', up: true },
          { icon: Percent, label: 'Deságio Médio', value: '14.7%', trend: '-3%', up: false },
          { icon: Trophy, label: 'Licitações Disputadas', value: String(m.totalLicitacoes) },
        ].map((item, i) => (
          <div key={i} className="glass-card-hover rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              {item.trend && (
                <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                  item.up ? 'text-status-ganha bg-status-ganha/10' : 'text-status-pendente bg-status-pendente/10'
                )}>
                  {item.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {item.trend}
                </span>
              )}
            </div>
            <p className={cn('font-bold text-foreground', item.value.length > 10 ? 'text-xl' : 'text-2xl')}>{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Evolução Mensal</h3>
          </div>
          <div className="flex items-end gap-3 h-48 mb-3">
            {valoresMensais.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end h-full">
                  <div className="flex-1 rounded-t-lg bg-primary/15 transition-all duration-500 hover:bg-primary/25" style={{ height: `${(v.disputado / maxMensal) * 100}%` }} />
                  <div className="flex-1 rounded-t-lg bg-gradient-to-t from-status-ganha to-status-ganha/70 transition-all duration-500" style={{ height: `${(v.ganho / maxMensal) * 100}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{meses[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary/15" /><span className="text-xs text-muted-foreground">Disputado</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-status-ganha" /><span className="text-xs text-muted-foreground">Ganho</span></div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Por Status</h3>
          </div>
          <DonutChart dados={porStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Por Modalidade</h3>
          </div>
          {porModalidade.map((mod) => (
            <BarraHorizontal key={mod.label} label={mod.label} valor={mod.valor}
              maximo={Math.max(...porModalidade.map((m) => m.valor))} cor="bg-gradient-to-r from-primary to-primary/60" />
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Análise de Concorrência</h3>
          </div>
          <div className="space-y-3">
            {CONCORRENTES_MOCK.map((c) => {
              const total = c.vitorias + c.derrotas;
              const taxa = total > 0 ? (c.vitorias / total) * 100 : 0;
              return (
                <div key={c.empresa} className="p-3.5 rounded-xl bg-secondary/30 backdrop-blur-sm border border-border/30 transition-all duration-200 hover:border-border/60 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-foreground">{c.empresa}</span>
                    <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/60">{taxa.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="text-status-ganha font-medium">✓ {c.vitorias}</span>
                    <span className="text-status-pendente font-medium">✗ {c.derrotas}</span>
                    <span>Deságio: <strong className="text-foreground">{c.valorMedioDesagio}%</strong></span>
                  </div>
                  <div className="mt-1.5 w-full h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-status-ganha to-status-ganha/60 rounded-full transition-all duration-500" style={{ width: `${taxa}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
