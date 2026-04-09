// === Layout Principal do Sistema ===
// Wrapper com sidebar e área de conteúdo — design glassmorphism

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Sun, Moon, Settings, ChevronRight } from 'lucide-react';
import { NotificacoesDropdown } from './NotificacoesDropdown';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedParticles from './AnimatedParticles';
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
    <div className="min-h-screen bg-background relative">
      {/* Subtle animated background */}
      <AnimatedParticles count={30} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl animate-glow-pulse" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-primary/3 blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl animate-glow-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <AppSidebar />

      {/* Conteúdo principal com offset da sidebar */}
      <div className="ml-60 min-h-screen flex flex-col relative z-10">
        {/* Header superior — glass effect */}
        <header className="h-16 glass-header flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-foreground">{titulo}</h1>
            {subtitulo && (
              <p className="text-xs text-muted-foreground">{subtitulo}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-secondary/80 backdrop-blur-sm transition-all duration-200 hover:scale-105"
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
                <button className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-secondary/80 backdrop-blur-sm transition-all duration-200">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ring-2 ring-primary/20 shadow-lg shadow-primary/20">
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
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-2xl border border-border/60 bg-card/90 backdrop-blur-xl">
                {/* Cabeçalho do perfil */}
                <div className="flex items-center gap-3 px-2 py-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ring-2 ring-primary/20 shadow-lg shadow-primary/20 shrink-0">
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

                <DropdownMenuItem
                  onClick={() => navigate('/configuracoes')}
                  className="flex items-center justify-between px-2 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">Meu Perfil</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive transition-all duration-200"
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
        <main className="flex-1 p-6 animate-fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
}
