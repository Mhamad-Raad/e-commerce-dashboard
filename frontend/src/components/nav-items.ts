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
  Blocks,
  BookOpen,
  TicketPercent,
  Boxes,
  Receipt,
  ReceiptText,
  Settings,
  Bot,
  Megaphone,
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
      { to: '/home-builder', labelKey: 'nav.home_builder', icon: Blocks },
      { to: '/blog', labelKey: 'nav.blog', icon: BookOpen },
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
      { to: '/announcements', labelKey: 'nav.announcements', icon: Megaphone },
      { to: '/carts', labelKey: 'nav.carts', icon: ShoppingCart },
      { to: '/orders', labelKey: 'nav.orders', icon: ClipboardList },
      { to: '/refunds', labelKey: 'nav.refunds', icon: ReceiptText },
      { to: '/coupons', labelKey: 'nav.coupons', icon: TicketPercent },
      { to: '/inventory', labelKey: 'nav.inventory', icon: Boxes },
      { to: '/fee-groups', labelKey: 'nav.fee_groups', icon: Receipt },
    ],
  },
  {
    labelKey: 'nav.group_analytics',
    items: [{ to: '/reports', labelKey: 'nav.reports', icon: BarChart3 }],
  },
  {
    labelKey: 'nav.group_system',
    items: [
      { to: '/assistant', labelKey: 'nav.assistant', icon: Bot },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
  },
];

/** Flat list of all nav items (e.g. for deriving the active page title). */
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);
