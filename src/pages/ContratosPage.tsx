import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { CONTRATOS_MOCK } from '@/data/mockData';
import { Contrato } from '@/types/licitacao';
import { formatarMoeda, formatarData, diasRestantes } from '@/lib/formatters';
import {
  FileText, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  TrendingDown, Package, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ContratoStatusBadge({ status }: { status: Contrato['status'] }) {
  const estilos = {
    vigente: 'bg-status-ganha/15 text-status-ganha border-status-ganha/30',
    vencida: 'bg-status-analise/15 text-status-analise border-status-analise/30',
    encerrada: 'bg-status-perdida/15 text-status-perdida border-status-perdida/30',
  };
  const labels = { vigente: 'Vigente', vencida: 'Vencida', encerrada: 'Encerrada' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border', estilos[status])}>
      {labels[status]}
    </span>
  );
}

function ContratoCard({ contrato }: { contrato: Contrato }) {
  const [expandido, setExpandido] = useState(false);
  const percentualUtilizado = (contrato.valorUtilizado / contrato.valorTotal) * 100;
  const saldoRestante = contrato.valorTotal - contrato.valorUtilizado;
  const diasParaFim = diasRestantes(contrato.dataFim);

  return (
    <div className="section-card transition-all hover:shadow-md">
      <div className="p-5 cursor-pointer" onClick={() => setExpandido(!expandido)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">{contrato.numeroAta}</h3>
              <ContratoStatusBadge status={contrato.status} />
            </div>
            <p className="text-sm text-foreground font-medium truncate">{contrato.orgao}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{contrato.objeto}</p>
          </div>
          <button className="p-1 rounded hover:bg-secondary transition-colors shrink-0">
            {expandido ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-sm font-bold text-foreground truncate">{formatarMoeda(contrato.valorTotal)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Saldo Restante</p>
            <p className={cn('text-sm font-bold truncate', saldoRestante > 0 ? 'text-status-ganha' : 'text-status-perdida')}>
              {formatarMoeda(saldoRestante)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Vigência</p>
            <p className="text-xs text-foreground font-medium truncate">
              {formatarData(contrato.dataInicio)} — {formatarData(contrato.dataFim)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prazo</p>
            <p className={cn('text-xs font-semibold',
              diasParaFim <= 0 ? 'text-status-pendente' : diasParaFim <= 30 ? 'text-status-analise' : 'text-muted-foreground')}>
              {diasParaFim > 0 ? `${diasParaFim} dias restantes` : diasParaFim === 0 ? 'Vence hoje!' : 'Vencida'}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Utilização</span>
            <span className="font-semibold text-foreground">{percentualUtilizado.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-500',
              percentualUtilizado >= 90 ? 'bg-status-pendente' : percentualUtilizado >= 70 ? 'bg-status-analise' : 'bg-status-ganha'
            )} style={{ width: `${Math.min(percentualUtilizado, 100)}%` }} />
          </div>
        </div>
      </div>

      {expandido && (
        <div className="border-t border-border/40 bg-secondary/10 animate-fade-in">
          <div className="px-5 py-3 border-b border-border/30">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Itens da Ata</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-2">Descrição</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">Un.</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">Total</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">Usado</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">Saldo</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-3 py-2">Unit.</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {contrato.itens.map((item) => {
                  const saldoItem = item.quantidadeTotal - item.quantidadeUtilizada;
                  return (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-2.5 text-sm text-foreground truncate max-w-[200px]">{item.descricao}</td>
                      <td className="px-3 py-2.5 text-xs text-center text-muted-foreground">{item.unidade}</td>
                      <td className="px-3 py-2.5 text-sm text-center font-medium text-foreground">{item.quantidadeTotal}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-foreground">{item.quantidadeUtilizada}</td>
                      <td className="px-3 py-2.5 text-sm text-center">
                        <span className={cn('font-semibold', saldoItem === 0 ? 'text-status-pendente' : 'text-status-ganha')}>{saldoItem}</span>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-right text-foreground whitespace-nowrap">{formatarMoeda(item.precoUnitario)}</td>
                      <td className="px-5 py-2.5 text-sm text-right font-semibold text-foreground whitespace-nowrap">
                        {formatarMoeda(item.quantidadeUtilizada * item.precoUnitario)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {contrato.status === 'vigente' && diasParaFim <= 90 && (
            <div className="px-5 py-3 border-t border-border/30">
              <div className="flex items-center gap-2 text-xs bg-status-analise/10 text-status-analise p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p className="font-medium">Ata vence em {diasParaFim} dias. Verifique reequilíbrio econômico-financeiro.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ContratosPage() {
  const [contratos] = useState<Contrato[]>(CONTRATOS_MOCK);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const filtrados = filtroStatus === 'todos' ? contratos : contratos.filter((c) => c.status === filtroStatus);
  const totalValor = contratos.reduce((s, c) => s + c.valorTotal, 0);
  const totalUtilizado = contratos.reduce((s, c) => s + c.valorUtilizado, 0);
  const vigentes = contratos.filter((c) => c.status === 'vigente').length;

  return (
    <AppLayout titulo="Contratos e Atas (SRP)" subtitulo="Gestão de Atas de Registro de Preços com controle de saldo">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: FileText, label: 'Total de Atas', value: contratos.length, color: 'text-foreground', iconColor: 'text-primary' },
          { icon: CheckCircle2, label: 'Vigentes', value: vigentes, color: 'text-status-ganha', iconColor: 'text-status-ganha' },
          { icon: Package, label: 'Valor Contratado', value: formatarMoeda(totalValor), color: 'text-foreground', iconColor: 'text-primary', small: true },
          { icon: TrendingDown, label: 'Saldo Disponível', value: formatarMoeda(totalValor - totalUtilizado), color: 'text-status-ganha', iconColor: 'text-status-analise', small: true },
        ].map((item, i) => (
          <div key={i} className="metric-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2 mb-1">
              <item.icon className={cn('w-4 h-4', item.iconColor)} />
              <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
            </div>
            <p className={cn('font-bold truncate', item.color, item.small ? 'text-lg' : 'text-2xl')}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 animate-fade-in">
        {['todos', 'vigente', 'vencida', 'encerrada'].map((s) => (
          <button key={s} onClick={() => setFiltroStatus(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filtroStatus === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}>
            {s === 'todos' ? 'Todas' : s.charAt(0).toUpperCase() + s.slice(1) + 's'}
          </button>
        ))}
      </div>

      <div className="space-y-3 animate-fade-in-up">
        {filtrados.map((contrato) => (<ContratoCard key={contrato.id} contrato={contrato} />))}
      </div>

      {filtrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center section-card">
          <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum contrato encontrado</p>
        </div>
      )}
    </AppLayout>
  );
}
