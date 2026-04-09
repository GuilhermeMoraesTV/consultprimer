import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Licitacao, MODALIDADE_LABELS } from '@/types/licitacao';
import { StatusBadge } from './StatusBadge';
import { formatarMoeda, textoUrgencia, diasRestantes } from '@/lib/formatters';
import { Calendar, FileText, ExternalLink, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  licitacao: Licitacao;
  onClick?: () => void;
}

export function KanbanCard({ licitacao, onClick }: KanbanCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: licitacao.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const dias = diasRestantes(licitacao.dataLicitacao);
  const urgente = dias >= 0 && dias <= 3;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl border border-border/60 p-3.5 shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing animate-fade-in group',
        'hover:shadow-md hover:border-primary/20',
        isDragging && 'opacity-40 shadow-xl rotate-1 scale-105',
        urgente && 'border-l-[3px] border-l-status-pendente'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical
            className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0"
            {...attributes}
            {...listeners}
          />
          <StatusBadge status={licitacao.status} />
        </div>
        {licitacao.linkAcesso && (
          <a href={licitacao.linkAcesso} target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors shrink-0"
            onClick={(e) => e.stopPropagation()}>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground font-medium mb-0.5 truncate">
        {MODALIDADE_LABELS[licitacao.modalidade]} • {licitacao.numeroEdital}
      </p>
      <h4 className="text-sm font-semibold text-foreground mb-0.5 line-clamp-2 leading-snug">
        {licitacao.orgaoComprador}
      </h4>
      <p className="text-xs text-muted-foreground line-clamp-1 mb-2.5">
        {licitacao.objeto}
      </p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground min-w-0">
          <Calendar className="w-3 h-3 shrink-0" />
          <span className={cn('truncate', urgente && 'text-status-pendente font-semibold')}>
            {textoUrgencia(licitacao.dataLicitacao)}
          </span>
        </div>
        {licitacao.valorReferencia && (
          <span className="font-semibold text-foreground shrink-0 ml-2">
            {formatarMoeda(licitacao.valorReferencia)}
          </span>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{licitacao.documentosAnexados}/{licitacao.documentosNecessarios}</span>
          </div>
          <span className="text-muted-foreground">
            {Math.round((licitacao.documentosAnexados / licitacao.documentosNecessarios) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              licitacao.checklistCompleto ? 'bg-status-ganha' : 'bg-primary'
            )}
            style={{ width: `${(licitacao.documentosAnexados / licitacao.documentosNecessarios) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
