// === Página de Agenda / Calendário de Licitações ===
import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { EVENTOS_MOCK } from '@/data/mockData';
import { EventoCalendario } from '@/types/licitacao';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Gavel, AlertTriangle, Package, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Ícone por tipo de evento */
const TIPO_ICONE: Record<EventoCalendario['tipo'], typeof Gavel> = {
  pregao: Gavel,
  impugnacao: AlertTriangle,
  amostra: Package,
  certidao: FileWarning,
};

const TIPO_LABEL: Record<EventoCalendario['tipo'], string> = {
  pregao: 'Pregão',
  impugnacao: 'Impugnação',
  amostra: 'Entrega de Amostra',
  certidao: 'Vencimento Certidão',
};

export default function AgendaPage() {
  const [mesAtual, setMesAtual] = useState(new Date(2026, 3, 1)); // Abril 2026 para mostrar dados mockados
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);

  /** Gerar grade do calendário */
  const diasCalendario = useMemo(() => {
    const inicioMes = startOfMonth(mesAtual);
    const fimMes = endOfMonth(mesAtual);
    const inicioGrade = startOfWeek(inicioMes, { locale: ptBR });
    const fimGrade = endOfWeek(fimMes, { locale: ptBR });

    const dias: Date[] = [];
    let dia = inicioGrade;
    while (dia <= fimGrade) {
      dias.push(dia);
      dia = addDays(dia, 1);
    }
    return dias;
  }, [mesAtual]);

  /** Eventos do dia selecionado */
  const eventosDoDia = useMemo(() => {
    if (!diaSelecionado) return [];
    return EVENTOS_MOCK.filter((e) => isSameDay(e.data, diaSelecionado));
  }, [diaSelecionado]);

  /** Buscar eventos de um dia específico */
  const eventosNoDia = (dia: Date) =>
    EVENTOS_MOCK.filter((e) => isSameDay(e.data, dia));

  return (
    <AppLayout titulo="Agenda de Licitações" subtitulo="Calendário com pregões, prazos e vencimentos">
      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* Calendário principal */}
        <div className="flex-1 bg-card rounded-xl border border-border p-5">
          {/* Navegação de mês */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setMesAtual(subMonths(mesAtual, 1))}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground capitalize">
              {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button
              onClick={() => setMesAtual(addMonths(mesAtual, 1))}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="grid grid-cols-7 gap-1">
            {diasCalendario.map((dia, i) => {
              const eventos = eventosNoDia(dia);
              const doMes = isSameMonth(dia, mesAtual);
              const hoje = isToday(dia);
              const selecionado = diaSelecionado && isSameDay(dia, diaSelecionado);

              return (
                <button
                  key={i}
                  onClick={() => setDiaSelecionado(dia)}
                  className={cn(
                    'relative flex flex-col items-center p-2 rounded-lg min-h-[72px] transition-all text-sm',
                    !doMes && 'opacity-30',
                    doMes && 'hover:bg-secondary',
                    hoje && 'ring-2 ring-primary/30',
                    selecionado && 'bg-primary/10 ring-2 ring-primary'
                  )}
                >
                  <span
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium',
                      hoje && 'bg-primary text-primary-foreground',
                      selecionado && !hoje && 'font-bold text-primary'
                    )}
                  >
                    {format(dia, 'd')}
                  </span>

                  {/* Indicadores de eventos */}
                  {eventos.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {eventos.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: ev.cor }}
                          title={ev.titulo}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel lateral de detalhes do dia */}
        <div className="w-80 bg-card rounded-xl border border-border p-5 flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-1">
            {diaSelecionado
              ? format(diaSelecionado, "dd 'de' MMMM, yyyy", { locale: ptBR })
              : 'Selecione um dia'}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {eventosDoDia.length > 0
              ? `${eventosDoDia.length} evento(s) agendado(s)`
              : 'Nenhum evento neste dia'}
          </p>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {eventosDoDia.map((evento) => {
              const Icone = TIPO_ICONE[evento.tipo];
              return (
                <div
                  key={evento.id}
                  className="p-3 rounded-lg border border-border bg-background animate-fade-in"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: evento.cor + '22', color: evento.cor }}
                    >
                      <Icone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {evento.titulo}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {TIPO_LABEL[evento.tipo]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {diaSelecionado && eventosDoDia.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Gavel className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhum evento agendado
                </p>
              </div>
            )}
          </div>

          {/* Legenda */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Legenda</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TIPO_LABEL).map(([tipo, label]) => {
                const cores: Record<string, string> = {
                  pregao: 'hsl(215, 75%, 35%)',
                  impugnacao: 'hsl(38, 80%, 50%)',
                  amostra: 'hsl(270, 60%, 50%)',
                  certidao: 'hsl(0, 72%, 51%)',
                };
                return (
                  <div key={tipo} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cores[tipo] }}
                    />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
