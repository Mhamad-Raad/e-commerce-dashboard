import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { navItems } from '@/components/nav-items';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMobileMenu: () => void;
}

function usePageTitle() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  // Longest matching nav prefix wins (so /products/123 → Products).
  const match = [...navItems]
    .filter((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match ? t(match.labelKey) : t('app.title');
}

function initials(email: string, name: string | null) {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
  return email.slice(0, 2).toUpperCase();
}

export function Navbar({ collapsed, onToggleCollapsed, onOpenMobileMenu }: NavbarProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const title = usePageTitle();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileMenu}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={onToggleCollapsed}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>

      <h1 className="truncate text-base font-semibold">{title}</h1>

      <div className="ms-auto flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ms-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar>
                <AvatarFallback>{user ? initials(user.email, user.name) : '?'}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-xs text-muted-foreground">{t('common.signed_in_as')}</div>
              <div className="truncate text-sm font-medium">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              {t('common.sign_out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
