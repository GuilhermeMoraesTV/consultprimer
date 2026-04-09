import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Kanban, CalendarDays, FileText, FolderOpen, BarChart3,
  Settings, ChevronLeft, ChevronRight, Gavel, Building2, ClipboardList,
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
    <aside className={cn(
      'fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300',
      'bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border',
      collapsed ? 'w-[60px]' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 h-14 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center shrink-0">
          <Gavel className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base text-sidebar-primary-foreground tracking-tight truncate">
            ConsultPrimer
          </span>
        )}
      </div>

      {/* Empresa */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-sidebar-border animate-fade-in">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-sidebar-accent/60 border border-sidebar-border/50">
            <Building2 className="w-3.5 h-3.5 text-sidebar-accent-foreground shrink-0" />
            <span className="text-xs font-medium text-sidebar-accent-foreground truncate">Tech Solutions Ltda</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              )}>
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="py-2 px-2 border-t border-sidebar-border space-y-0.5">
        {NAV_BOTTOM.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              )}>
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        <button onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
