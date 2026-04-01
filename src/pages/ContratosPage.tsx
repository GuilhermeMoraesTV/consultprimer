// === Página de Contratos e Atas SRP ===
// Gestão de Atas de Registro de Preços com saldo de itens

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { CONTRATOS_MOCK } from '@/data/mockData';
import { Contrato, ItemAta } from '@/types/licitacao';
import { formatarMoeda, formatarData, diasRestantes } from '@/lib/formatters';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingDown,
  Package,
  BarChart3,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

/** Badge de status do contrato */
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

/** Card expandível de contrato/ata */
function ContratoCard({ contrato }: { contrato: Contrato }) {
  const [expandido, setExpandido] = useState(false);

  const percentualUtilizado = (contrato.valorUtilizado / contrato.valorTotal) * 100;
  const saldoRestante = contrato.valorTotal - contrato.valorUtilizado;
  const diasParaFim = diasRestantes(contrato.dataFim);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:shadow-md">
      {/* Cabeçalho */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-foreground">{contrato.numeroAta}</h3>
              <ContratoStatusBadge status={contrato.status} />
            </div>
            <p className="text-sm text-foreground font-medium">{contrato.orgao}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{contrato.objeto}</p>
          </div>
          <button className="p-1 rounded hover:bg-secondary transition-colors flex-shrink-0">
            {expandido ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>

        {/* Informações resumidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-sm font-bold text-foreground">{formatarMoeda(contrato.valorTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo Restante</p>
            <p className={cn('text-sm font-bold', saldoRestante > 0 ? 'text-status-ganha' : 'text-status-perdida')}>
              {formatarMoeda(saldoRestante)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vigência</p>
            <p className="text-xs text-foreground font-medium">
              {formatarData(contrato.dataInicio)} — {formatarData(contrato.dataFim)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prazo</p>
            <p className={cn('text-xs font-semibold', diasParaFim <= 30 ? 'text-status-analise' : diasParaFim <= 0 ? 'text-status-pendente' : 'text-muted-foreground')}>
              {diasParaFim > 0 ? `${diasParaFim} dias restantes` : diasParaFim === 0 ? 'Vence hoje!' : 'Vencida'}
            </p>
          </div>
        </div>

        {/* Barra de utilização */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Utilização</span>
            <span className="font-semibold text-foreground">{percentualUtilizado.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percentualUtilizado >= 90 ? 'bg-status-pendente' :
                percentualUtilizado >= 70 ? 'bg-status-analise' : 'bg-status-ganha'
              )}
              style={{ width: `${Math.min(percentualUtilizado, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detalhes expandidos — Itens da Ata */}
      {expandido && (
        <div className="border-t border-border bg-secondary/20 animate-fade-in">
          <div className="px-5 py-3 border-b border-border">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Itens da Ata</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-2">Descrição</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">Un.</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">Qtd. Total</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">Utilizado</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">Saldo</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-3 py-2">Preço Unit.</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-2">Subtotal</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contrato.itens.map((item) => {
                  const saldoItem = item.quantidadeTotal - item.quantidadeUtilizada;
                  const percItem = (item.quantidadeUtilizada / item.quantidadeTotal) * 100;
                  return (
                    <tr key={item.id} className="hover:bg-secondary/30">
                      <td className="px-5 py-2.5 text-sm text-foreground">{item.descricao}</td>
                      <td className="px-3 py-2.5 text-xs text-center text-muted-foreground">{item.unidade}</td>
                      <td className="px-3 py-2.5 text-sm text-center font-medium text-foreground">{item.quantidadeTotal}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-foreground">{item.quantidadeUtilizada}</td>
                      <td className="px-3 py-2.5 text-sm text-center">
                        <span className={cn('font-semibold', saldoItem === 0 ? 'text-status-pendente' : 'text-status-ganha')}>
                          {saldoItem}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-right text-foreground">{formatarMoeda(item.precoUnitario)}</td>
                      <td className="px-5 py-2.5 text-sm text-right font-semibold text-foreground">
                        {formatarMoeda(item.quantidadeUtilizada * item.precoUnitario)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="w-16 mx-auto">
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                percItem >= 90 ? 'bg-status-pendente' : percItem >= 70 ? 'bg-status-analise' : 'bg-status-ganha'
                              )}
                              style={{ width: `${percItem}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Alerta de reequilíbrio */}
          {contrato.status === 'vigente' && diasParaFim <= 90 && (
            <div className="px-5 py-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs bg-status-analise/10 text-status-analise p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p className="font-medium">
                  Atenção: a ata vence em {diasParaFim} dias. Verifique a necessidade de solicitar reequilíbrio econômico-financeiro.
                </p>
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

  const filtrados = filtroStatus === 'todos'
    ? contratos
    : contratos.filter((c) => c.status === filtroStatus);

  // Métricas
  const totalValor = contratos.reduce((s, c) => s + c.valorTotal, 0);
  const totalUtilizado = contratos.reduce((s, c) => s + c.valorUtilizado, 0);
  const vigentes = contratos.filter((c) => c.status === 'vigente').length;

  return (
    <AppLayout titulo="Contratos e Atas (SRP)" subtitulo="Gestão de Atas de Registro de Preços com controle de saldo">
      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Total de Atas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{contratos.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-status-ganha" />
            <span className="text-xs text-muted-foreground font-medium">Vigentes</span>
          </div>
          <p className="text-2xl font-bold text-status-ganha">{vigentes}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Valor Contratado</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatarMoeda(totalValor)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-status-analise" />
            <span className="text-xs text-muted-foreground font-medium">Saldo Disponível</span>
          </div>
          <p className="text-lg font-bold text-status-ganha">{formatarMoeda(totalValor - totalUtilizado)}</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-2 mb-4">
        {['todos', 'vigente', 'vencida', 'encerrada'].map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filtroStatus === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {s === 'todos' ? 'Todas' : s.charAt(0).toUpperCase() + s.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Lista de contratos */}
      <div className="space-y-4">
        {filtrados.map((contrato) => (
          <ContratoCard key={contrato.id} contrato={contrato} />
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border">
          <FileText className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum contrato encontrado</p>
        </div>
      )}
    </AppLayout>
  );
}
