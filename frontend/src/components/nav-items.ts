import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export const navItems: NavItem[] = [
  { to: '/', labelKey: 'nav.overview', icon: LayoutDashboard, end: true },
  { to: '/products', labelKey: 'nav.products', icon: Package },
  { to: '/customers', labelKey: 'nav.customers', icon: Users },
  { to: '/carts', labelKey: 'nav.carts', icon: ShoppingCart },
  { to: '/orders', labelKey: 'nav.orders', icon: ClipboardList },
  { to: '/reports', labelKey: 'nav.reports', icon: BarChart3 },
];
