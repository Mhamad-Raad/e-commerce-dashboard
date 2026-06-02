import {
  LayoutDashboard,
  Package,
  Tags,
  Store,
  Users,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  LayoutTemplate,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    labelKey: 'nav.group_main',
    items: [{ to: '/', labelKey: 'nav.overview', icon: LayoutDashboard, end: true }],
  },
  {
    labelKey: 'nav.group_storefront',
    items: [
      { to: '/homepage', labelKey: 'nav.homepage', icon: LayoutTemplate },
      { to: '/stores', labelKey: 'nav.stores', icon: Store },
    ],
  },
  {
    labelKey: 'nav.group_management',
    items: [
      { to: '/products', labelKey: 'nav.products', icon: Package },
      { to: '/categories', labelKey: 'nav.categories', icon: Tags },
      { to: '/customers', labelKey: 'nav.customers', icon: Users },
      { to: '/carts', labelKey: 'nav.carts', icon: ShoppingCart },
      { to: '/orders', labelKey: 'nav.orders', icon: ClipboardList },
    ],
  },
  {
    labelKey: 'nav.group_analytics',
    items: [{ to: '/reports', labelKey: 'nav.reports', icon: BarChart3 }],
  },
];

/** Flat list of all nav items (e.g. for deriving the active page title). */
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);
