// === Página do Kanban - Board Interativo ===
import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { AppLayout } from '@/components/AppLayout';
import { KanbanCard } from '@/components/KanbanCard';
import { LicitacaoDetailModal } from '@/components/LicitacaoDetailModal';
import { useSupabaseLicitacoes } from '@/hooks/useSupabaseLicitacoes';
import { ColunaKanban, COLUNA_LABELS, Licitacao } from '@/types/licitacao';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Cores de fundo por coluna */
const COLUNA_BG: Record<ColunaKanban, string> = {
  captacao: 'bg-kanban-captacao',
  analise: 'bg-kanban-analise',
  montagem: 'bg-kanban-montagem',
  pregao: 'bg-kanban-pregao',
  recurso: 'bg-kanban-recurso',
};

/** Cores de indicador superior por coluna */
const COLUNA_INDICATOR: Record<ColunaKanban, string> = {
  captacao: 'bg-muted-foreground',
  analise: 'bg-status-analise',
  montagem: 'bg-primary',
  pregao: 'bg-purple-500',
  recurso: 'bg-status-ganha',
};

const COLUNAS: ColunaKanban[] = ['captacao', 'analise', 'montagem', 'pregao', 'recurso'];

/** Componente de coluna droppable */
function KanbanColumn({ coluna, licitacoes, onCardClick }: { coluna: ColunaKanban; licitacoes: Licitacao[]; onCardClick: (lic: Licitacao) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna });

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl min-w-[280px] w-[280px] flex-shrink-0 transition-all',
        COLUNA_BG[coluna],
        isOver && 'ring-2 ring-primary/30'
      )}
    >
      {/* Indicador superior colorido */}
      <div className={cn('h-1 rounded-t-xl', COLUNA_INDICATOR[coluna])} />

      {/* Cabeçalho da coluna */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">
            {COLUNA_LABELS[coluna]}
          </h3>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {licitacoes.length}
          </span>
        </div>
      </div>

      {/* Cards */}
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
    const found = licitacoes.find((l) => l.id === event.active.id);
    setActiveLicitacao(found || null);
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

  const handleCardClick = (lic: Licitacao) => {
    setDetailLicitacao(lic);
    setDetailOpen(true);
  };

  const porColuna = (coluna: ColunaKanban) =>
    licitacoes.filter((l) => l.colunaKanban === coluna);

  return (
    <AppLayout titulo="Kanban de Licitações" subtitulo="Arraste os cards entre as colunas para atualizar o funil">
      {/* Info superior */}
      <div className="flex items-center justify-end mb-4">
        <p className="text-xs text-muted-foreground">
          {loading ? (
            <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Carregando...</span>
          ) : (
            `${licitacoes.length} licitações no funil`
          )}
        </p>
      </div>

      {/* Board Kanban */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUNAS.map((coluna) => (
            <KanbanColumn
              key={coluna}
              coluna={coluna}
              licitacoes={porColuna(coluna)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLicitacao && <KanbanCard licitacao={activeLicitacao} />}
        </DragOverlay>
      </DndContext>

      {/* Modal Nova Licitação */}
      <NovaLicitacaoModal
        open={novaModalOpen}
        onOpenChange={setNovaModalOpen}
        onSalvar={criarLicitacao}
      />

      {/* Modal Detalhes */}
      <LicitacaoDetailModal
        licitacao={detailLicitacao}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAtualizar={atualizarLicitacao}
        onMoverColuna={moverColuna}
      />
    </AppLayout>
  );
}
