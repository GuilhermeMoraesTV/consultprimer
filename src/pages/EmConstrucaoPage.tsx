// === Página placeholder para módulos em desenvolvimento ===
import { AppLayout } from '@/components/AppLayout';
import { Construction } from 'lucide-react';

interface EmConstrucaoProps {
  titulo: string;
  descricao: string;
}

export default function EmConstrucaoPage({ titulo, descricao }: EmConstrucaoProps) {
  return (
    <AppLayout titulo={titulo} subtitulo="Módulo em desenvolvimento">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Construction className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{titulo}</h2>
        <p className="text-sm text-muted-foreground max-w-md">{descricao}</p>
      </div>
    </AppLayout>
  );
}
