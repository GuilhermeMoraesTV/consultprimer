// === Badge de Status da Licitação ===
// Componente visual com cores semânticas do design system

import { StatusLicitacao, STATUS_LABELS } from '@/types/licitacao';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: StatusLicitacao;
  className?: string;
}

/** Mapa de estilos por status usando tokens do design system */
const STATUS_STYLES: Record<StatusLicitacao, string> = {
  falta_cadastrar: 'bg-status-pendente/15 text-status-pendente border-status-pendente/30',
  em_analise: 'bg-status-analise/15 text-status-analise border-status-analise/30',
  cadastrada: 'bg-status-cadastrada/15 text-status-cadastrada border-status-cadastrada/30',
  ganha: 'bg-status-ganha/15 text-status-ganha border-status-ganha/30',
  perdida: 'bg-status-perdida/15 text-status-perdida border-status-perdida/30',
};

/** Ícones de semáforo por status */
const STATUS_ICONS: Record<StatusLicitacao, string> = {
  falta_cadastrar: '🟥',
  em_analise: '🟨',
  cadastrada: '🟦',
  ganha: '🟩',
  perdida: '⬛',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border',
        STATUS_STYLES[status],
        className
      )}
    >
      <span className="text-[10px]">{STATUS_ICONS[status]}</span>
      {STATUS_LABELS[status]}
    </span>
  );
}
