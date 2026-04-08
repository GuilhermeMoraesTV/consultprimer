// === Layout Principal do Sistema ===
// Wrapper com sidebar e área de conteúdo

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, User, LogOut, Sun, Moon } from 'lucide-react';
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
            {/* Busca rápida */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-sm cursor-pointer hover:bg-secondary/80 transition-colors">
              <Search className="w-4 h-4" />
              <span>Buscar...</span>
              <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>

            {/* Notificações */}
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-status-pendente rounded-full" />
            </button>

            {/* Avatar do usuário com dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email ?? 'Usuário'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
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
