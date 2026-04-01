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
import { LICITACOES_MOCK } from '@/data/mockData';
import { ColunaKanban, COLUNA_LABELS, Licitacao } from '@/types/licitacao';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
function KanbanColumn({ coluna, licitacoes }: { coluna: ColunaKanban; licitacoes: Licitacao[] }) {
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
        <button className="p-1 rounded hover:bg-muted transition-colors">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 px-2 pb-2 space-y-2 min-h-[200px] overflow-y-auto">
        <SortableContext items={licitacoes.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {licitacoes.map((lic) => (
            <KanbanCard key={lic.id} licitacao={lic} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(LICITACOES_MOCK);
  const [activeLicitacao, setActiveLicitacao] = useState<Licitacao | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  /** Ao iniciar o arraste */
  const handleDragStart = (event: DragStartEvent) => {
    const found = licitacoes.find((l) => l.id === event.active.id);
    setActiveLicitacao(found || null);
  };

  /** Ao soltar o card em uma nova coluna */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLicitacao(null);
    if (!over) return;

    const overId = String(over.id);
    // Verificar se soltou sobre uma coluna
    const colunaDestino = COLUNAS.includes(overId as ColunaKanban)
      ? (overId as ColunaKanban)
      : licitacoes.find((l) => l.id === overId)?.colunaKanban;

    if (!colunaDestino) return;

    // Trava: não pode ir para "pregao" sem checklist completo
    const lic = licitacoes.find((l) => l.id === active.id);
    if (colunaDestino === 'pregao' && lic && !lic.checklistCompleto) {
      // Toast de alerta seria ideal aqui
      return;
    }

    setLicitacoes((prev) =>
      prev.map((l) =>
        l.id === active.id ? { ...l, colunaKanban: colunaDestino } : l
      )
    );
  };

  /** Agrupar licitações por coluna */
  const porColuna = (coluna: ColunaKanban) =>
    licitacoes.filter((l) => l.colunaKanban === coluna);

  return (
    <AppLayout titulo="Kanban de Licitações" subtitulo="Arraste os cards entre as colunas para atualizar o funil">
      {/* Ações superiores */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nova Licitação
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {licitacoes.length} licitações no funil
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
            />
          ))}
        </div>

        <DragOverlay>
          {activeLicitacao && <KanbanCard licitacao={activeLicitacao} />}
        </DragOverlay>
      </DndContext>
    </AppLayout>
  );
}
