import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import { useNotificacoes, Notificacao } from '@/hooks/useNotificacoes';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function getIcon(tipo: string) {
  switch (tipo) {
    case 'aviso':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'erro':
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    case 'sucesso':
      return <Check className="w-4 h-4 text-green-500" />;
    default:
      return <Info className="w-4 h-4 text-primary" />;
  }
}

function NotificacaoItem({
  notificacao,
  onMarcarLida,
  onDeletar,
  onNavigate,
}: {
  notificacao: Notificacao;
  onMarcarLida: (id: string) => void;
  onDeletar: (id: string) => void;
  onNavigate: (link: string) => void;
}) {
  const tempo = formatDistanceToNow(new Date(notificacao.criado_em), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group',
        notificacao.lida
          ? 'opacity-60 hover:opacity-80'
          : 'bg-accent/50 hover:bg-accent'
      )}
      onClick={() => {
        if (!notificacao.lida) onMarcarLida(notificacao.id);
        if (notificacao.link) onNavigate(notificacao.link);
      }}
    >
      <div className="mt-0.5 shrink-0">{getIcon(notificacao.tipo)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">
          {notificacao.titulo}
        </p>
        {notificacao.mensagem && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notificacao.mensagem}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground mt-1">{tempo}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeletar(notificacao.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </button>
    </div>
  );
}

export function NotificacoesDropdown() {
  const {
    notificacoes,
    naoLidas,
    isLoading,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
  } = useNotificacoes();
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {naoLidas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
              {naoLidas > 99 ? '99+' : naoLidas}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 rounded-xl shadow-lg border border-border/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
            {naoLidas > 0 && (
              <span className="text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                {naoLidas}
              </span>
            )}
          </div>
          {naoLidas > 0 && (
            <button
              onClick={() => marcarTodasComoLidas()}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[360px]">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notificacoes.map((n) => (
                <NotificacaoItem
                  key={n.id}
                  notificacao={n}
                  onMarcarLida={marcarComoLida}
                  onDeletar={deletarNotificacao}
                  onNavigate={(link) => navigate(link)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
