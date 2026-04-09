import { useState } from 'react';
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragStartEvent, DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { AppLayout } from '@/components/AppLayout';
import { KanbanCard } from '@/components/KanbanCard';
import { LicitacaoDetailModal } from '@/components/LicitacaoDetailModal';
import { useSupabaseLicitacoes } from '@/hooks/useSupabaseLicitacoes';
import { ColunaKanban, COLUNA_LABELS, Licitacao } from '@/types/licitacao';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLUNA_INDICATOR: Record<ColunaKanban, string> = {
  captacao: 'bg-muted-foreground/50',
  analise: 'bg-status-analise',
  montagem: 'bg-primary',
  pregao: 'bg-purple-500',
  recurso: 'bg-status-ganha',
};

const COLUNAS: ColunaKanban[] = ['captacao', 'analise', 'montagem', 'pregao', 'recurso'];

function KanbanColumn({ coluna, licitacoes, onCardClick }: { coluna: ColunaKanban; licitacoes: Licitacao[]; onCardClick: (lic: Licitacao) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna });
  return (
    <div className={cn(
      'flex flex-col rounded-2xl min-w-[280px] w-[280px] shrink-0 transition-all duration-300',
      'bg-secondary/30 border border-border/40',
      isOver && 'ring-2 ring-primary/30 bg-primary/5 shadow-lg'
    )}>
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', COLUNA_INDICATOR[coluna])} />
        <h3 className="text-sm font-bold text-foreground">{COLUNA_LABELS[coluna]}</h3>
        <span className="ml-auto flex items-center justify-center w-6 h-6 rounded-md bg-card/80 text-xs font-bold text-muted-foreground border border-border/40">
          {licitacoes.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex-1 px-2 pb-2 space-y-2 min-h-[200px] overflow-y-auto">
        <SortableContext items={licitacoes.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {licitacoes.map((lic) => (
            <KanbanCard key={lic.id} licitacao={lic} onClick={() => onCardClick(lic)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { licitacoes, loading, moverColuna, atualizarLicitacao } = useSupabaseLicitacoes();
  const [activeLicitacao, setActiveLicitacao] = useState<Licitacao | null>(null);
  const [detailLicitacao, setDetailLicitacao] = useState<Licitacao | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveLicitacao(licitacoes.find((l) => l.id === event.active.id) || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLicitacao(null);
    if (!over) return;
    const overId = String(over.id);
    const colunaDestino = COLUNAS.includes(overId as ColunaKanban)
      ? (overId as ColunaKanban)
      : licitacoes.find((l) => l.id === overId)?.colunaKanban;
    if (!colunaDestino) return;
    await moverColuna(String(active.id), colunaDestino);
  };

  const porColuna = (coluna: ColunaKanban) => licitacoes.filter((l) => l.colunaKanban === coluna);

  return (
    <AppLayout titulo="Kanban de Licitações" subtitulo="Arraste os cards entre as colunas para atualizar o funil">
      <div className="flex items-center justify-end mb-4 animate-fade-in">
        <p className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-card/60 border border-border/40">
          {loading ? (
            <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Carregando...</span>
          ) : (
            `${licitacoes.length} licitações no funil`
          )}
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {COLUNAS.map((coluna) => (
            <KanbanColumn key={coluna} coluna={coluna} licitacoes={porColuna(coluna)} onCardClick={(lic) => { setDetailLicitacao(lic); setDetailOpen(true); }} />
          ))}
        </div>
        <DragOverlay>{activeLicitacao && <KanbanCard licitacao={activeLicitacao} />}</DragOverlay>
      </DndContext>

      <LicitacaoDetailModal licitacao={detailLicitacao} open={detailOpen} onOpenChange={setDetailOpen}
        onAtualizar={atualizarLicitacao} onMoverColuna={moverColuna} />
    </AppLayout>
  );
}
