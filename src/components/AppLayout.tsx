// === Layout Principal do Sistema ===
// Wrapper com sidebar e área de conteúdo

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Sun, Moon, Settings, ChevronRight } from 'lucide-react';
import { NotificacoesDropdown } from './NotificacoesDropdown';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: ReactNode;
  titulo: string;
  subtitulo?: string;
}

export function AppLayout({ children, titulo, subtitulo }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      {/* Conteúdo principal com offset da sidebar */}
      <div className="ml-60 min-h-screen flex flex-col">
        {/* Header superior */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-bold text-foreground">{titulo}</h1>
            {subtitulo && (
              <p className="text-xs text-muted-foreground">{subtitulo}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Notificações */}
            <NotificacoesDropdown />

            {/* Avatar do usuário com dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-secondary transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ring-2 ring-primary/20">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground leading-tight truncate max-w-[120px]">
                      {user?.email?.split('@')[0] ?? 'Usuário'}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight">
                      {user?.email ?? ''}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-lg border border-border/60">
                {/* Cabeçalho do perfil */}
                <div className="flex items-center gap-3 px-2 py-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.email?.split('@')[0] ?? 'Usuário'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email ?? ''}
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-1" />

                {/* Meu Perfil */}
                <DropdownMenuItem
                  onClick={() => navigate('/configuracoes')}
                  className="flex items-center justify-between px-2 py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">Meu Perfil</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                {/* Sair */}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
