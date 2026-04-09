// === Sidebar de Navegação Principal ===
// Menu lateral fixo com navegação — design glassmorphism

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  CalendarDays,
  FileText,
  FolderOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Building2,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cadastros', label: 'Cadastros', icon: ClipboardList },
  { path: '/licitacoes', label: 'Licitações', icon: Gavel },
  { path: '/kanban', label: 'Kanban', icon: Kanban },
  { path: '/agenda', label: 'Agenda', icon: CalendarDays },
  { path: '/documentos', label: 'Documentos', icon: FolderOpen },
  { path: '/contratos', label: 'Contratos', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const NAV_BOTTOM = [
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300',
        'bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sidebar-primary/25">
          <Gavel className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-sidebar-primary-foreground tracking-tight">
            ConsultPrimer
          </span>
        )}
      </div>

      {/* Empresa ativa */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border animate-fade-in">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-sidebar-accent/80 backdrop-blur-sm border border-sidebar-border/50">
            <Building2 className="w-3.5 h-3.5 text-sidebar-accent-foreground" />
            <span className="text-xs font-medium text-sidebar-accent-foreground truncate">
              Tech Solutions Ltda
            </span>
          </div>
        </div>
      )}

      {/* Navegação principal */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:translate-x-0.5'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Navegação inferior */}
      <div className="py-3 px-2 border-t border-sidebar-border space-y-1">
        {NAV_BOTTOM.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              'text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/80 transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
