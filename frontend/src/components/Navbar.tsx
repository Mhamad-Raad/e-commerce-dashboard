import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { navItems } from '@/components/nav-items';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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

export function Navbar({ collapsed, onToggleCollapsed, onOpenMobileMenu }: NavbarProps) {
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
        <NotificationBell />
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
