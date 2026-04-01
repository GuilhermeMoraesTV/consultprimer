// === Card de Licitação para o Kanban ===
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Licitacao, MODALIDADE_LABELS } from '@/types/licitacao';
import { StatusBadge } from './StatusBadge';
import { formatarMoeda, textoUrgencia, diasRestantes } from '@/lib/formatters';
import { Calendar, FileText, ExternalLink, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  licitacao: Licitacao;
}

export function KanbanCard({ licitacao }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: licitacao.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dias = diasRestantes(licitacao.dataLicitacao);
  const urgente = dias >= 0 && dias <= 3;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card rounded-lg border border-border p-3.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing animate-fade-in group',
        isDragging && 'opacity-50 shadow-lg rotate-2',
        urgente && 'border-l-2 border-l-status-pendente'
      )}
    >
      {/* Alça de arrastar + Status */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <GripVertical
            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
            {...attributes}
            {...listeners}
          />
          <StatusBadge status={licitacao.status} />
        </div>
        {licitacao.linkAcesso && (
          <a
            href={licitacao.linkAcesso}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Órgão e Edital */}
      <p className="text-xs text-muted-foreground font-medium mb-1">
        {MODALIDADE_LABELS[licitacao.modalidade]} • {licitacao.numeroEdital}
      </p>
      <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">
        {licitacao.orgaoComprador}
      </h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {licitacao.objeto}
      </p>

      {/* Informações inferiores */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span className={cn(urgente && 'text-status-pendente font-semibold')}>
            {textoUrgencia(licitacao.dataLicitacao)}
          </span>
        </div>

        {licitacao.valorReferencia && (
          <span className="font-semibold text-foreground">
            {formatarMoeda(licitacao.valorReferencia)}
          </span>
        )}
      </div>

      {/* Barra de progresso de documentos */}
      <div className="mt-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>Docs: {licitacao.documentosAnexados}/{licitacao.documentosNecessarios}</span>
          </div>
          <span className="text-muted-foreground">
            {Math.round((licitacao.documentosAnexados / licitacao.documentosNecessarios) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              licitacao.checklistCompleto ? 'bg-status-ganha' : 'bg-primary'
            )}
            style={{
              width: `${(licitacao.documentosAnexados / licitacao.documentosNecessarios) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
