import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navGroups, type NavItem } from '@/components/nav-items';
import { NavUser } from '@/components/NavUser';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed?: boolean;
  /** Called when a nav link is activated (used to close the mobile sheet). */
  onNavigate?: () => void;
}

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex h-full flex-col border-e bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Brand */}
      <div className={cn('flex h-14 items-center gap-2.5 border-b px-3', collapsed && 'justify-center px-0')}>
        <div className="group/logo relative shrink-0">
          <div className="absolute inset-0 rounded-lg bg-primary/25 blur-sm transition-all duration-300 group-hover/logo:bg-primary/40" />
          <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md transition-transform duration-300 group-hover/logo:scale-105">
            <Store className="h-5 w-5" />
          </div>
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-base font-bold text-transparent">
              {t('app.title')}
            </span>
            <span className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('app.subtitle')}
            </span>
          </div>
        )}
      </div>

      {/* Grouped navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navGroups.map((group, i) => (
          <div key={group.labelKey}>
            {collapsed ? (
              i > 0 && <div className="mx-2 my-2 h-px bg-border" />
            ) : (
              <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t(group.labelKey)}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavRow key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer user */}
      <div className="border-t p-2">
        <NavUser collapsed={collapsed} />
      </div>
    </div>
  );
}

function NavRow({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;

  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90'
            : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground',
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}
